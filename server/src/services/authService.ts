import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import type { AuthRole, AuthUser } from '../middleware/authMiddleware.js';
import type { AcceptInvitationInput, InviteStaffInput } from '../validators/authSchemas.js';
import { ApiError } from '../utils/apiError.js';
import { sendInvitationEmail } from '../config/mailer.js';

type UserRow = { id: string; email: string; full_name: string; role: AuthRole; employee_id: string | null; password_hash: string };
type InvitationRow = { id: string; email: string; employee_id: string; role: AuthRole; token_hash: string; expires_at: string; accepted_at: string | null };
function mapUser(row: UserRow): AuthUser { return { id: row.id, email: row.email, fullName: row.full_name, role: row.role, ...(row.employee_id ? { employeeId: row.employee_id } : {}) }; }
function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
const userSelect = `SELECT u.id, u.email, COALESCE(e.full_name, u.email) AS full_name, u.role, u.employee_id, u.password_hash FROM users u LEFT JOIN employees e ON e.id = u.employee_id`;

export async function authenticateUser(email: string, password: string) {
  const user = await findOne<UserRow>(`${userSelect} WHERE LOWER(u.email) = LOWER($1)`, [email]);
  return user && await bcrypt.compare(password, user.password_hash) ? mapUser(user) : null;
}
export async function getUserById(id: string) { const user = await findOne<UserRow>(`${userSelect} WHERE u.id = $1`, [id]); return user ? mapUser(user) : null; }

export async function inviteStaff(input: InviteStaffInput, invitedBy: string) {
  const existingUser = await findOne<{ id: string }>('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [input.email]);
  if (existingUser) throw new ApiError(409, 'This email already has an account');
  const existingInvitation = await findOne<InvitationRow>('SELECT id, email, employee_id, role, token_hash, expires_at::text, accepted_at::text FROM invitations WHERE LOWER(email) = LOWER($1)', [input.email]);
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  let employeeId: string;
  if (existingInvitation) {
    if (existingInvitation.accepted_at) throw new ApiError(409, 'This invitation has already been accepted');
    employeeId = existingInvitation.employee_id;
    await pool.query(`UPDATE employees SET full_name = $2, phone = $3, position = $4, updated_at = NOW() WHERE id = $1`, [employeeId, input.fullName, input.phone, input.position]);
    await pool.query(`UPDATE invitations SET role = $2, token_hash = $3, invited_by = $4, expires_at = $5, updated_at = NOW() WHERE id = $1`, [existingInvitation.id, input.role, tokenHash, invitedBy, expiresAt]);
  } else {
    const employee = await pool.query<{ id: string }>(`INSERT INTO employees (full_name, email, phone, position, join_date, monthly_salary, status) VALUES ($1, $2, $3, $4, CURRENT_DATE, 0, 'Active') RETURNING id`, [input.fullName, input.email, input.phone, input.position]);
    employeeId = employee.rows[0].id;
    await pool.query(`INSERT INTO invitations (email, employee_id, role, token_hash, invited_by, expires_at) VALUES ($1, $2, $3, $4, $5, $6)`, [input.email, employeeId, input.role, tokenHash, invitedBy, expiresAt]);
  }
  await sendInvitationEmail(input.email, token);
  return { email: input.email, employeeId, role: input.role, expiresAt: expiresAt.toISOString() };
}

export async function acceptInvitation(input: AcceptInvitationInput) {
  const invitation = await findOne<InvitationRow>(`SELECT id, email, employee_id, role, token_hash, expires_at::text, accepted_at::text FROM invitations WHERE token_hash = $1`, [hashToken(input.token)]);
  if (!invitation || invitation.accepted_at || new Date(invitation.expires_at) < new Date()) throw new ApiError(400, 'This invitation is invalid or has expired');
  const passwordHash = await bcrypt.hash(input.password, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<UserRow>(`INSERT INTO users (email, password_hash, role, employee_id) VALUES ($1, $2, $3, $4) RETURNING id, email, (SELECT full_name FROM employees WHERE id = employee_id) AS full_name, role, employee_id, password_hash`, [invitation.email, passwordHash, invitation.role, invitation.employee_id]);
    await client.query('UPDATE invitations SET accepted_at = NOW(), updated_at = NOW() WHERE id = $1', [invitation.id]);
    await client.query('COMMIT');
    return mapUser(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}

export async function updateUserRole(userId: string, role: 'MANAGER' | 'STAFF') {
  const result = await pool.query<UserRow>(`UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING id, email, COALESCE((SELECT full_name FROM employees WHERE id = employee_id), email) AS full_name, role, employee_id, password_hash`, [userId, role]);
  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return mapUser(result.rows[0]);
}

export async function listManagedUsers() {
  const rows = await findMany<Omit<UserRow, 'password_hash'> & { position: string | null }>(`${userSelect.replace(', u.password_hash', ', e.position')} WHERE u.role <> 'ADMIN' ORDER BY full_name`);
  return rows.map((row) => ({ ...mapUser({ ...row, password_hash: '' }), position: row.position }));
}
