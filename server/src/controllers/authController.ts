import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { acceptInvitation, authenticateUser, getUserById, inviteStaff, listManagedUsers, updateUserRole } from '../services/authService.js';
import { acceptInvitationSchema, inviteStaffSchema, updateUserRoleSchema } from '../validators/index.js';

function createTokenPayload(user: { id: string; email: string; fullName: string; role: string; employeeId?: string }) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    employeeId: user.employeeId,
  };
}

export async function login(request: Request, response: Response) {
  const { email, password } = request.body as { email: string; password: string };
  const user = await authenticateUser(email, password);

  if (!user) {
    response.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const token = jwt.sign(createTokenPayload(user), env.JWT_SECRET, { expiresIn: '7d' });

  response.json({
    success: true,
    data: {
      token,
      user: createTokenPayload(user),
    },
  });
}

export async function me(request: Request, response: Response) {
  const userId = request.user?.id;

  if (!userId) {
    response.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const user = await getUserById(userId);

  if (!user) {
    response.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  response.json({
    success: true,
    data: {
      user,
    },
  });
}

export async function invite(request: Request, response: Response) {
  const invitedBy = request.user?.id;
  if (!invitedBy) { response.status(401).json({ success: false, message: 'Authentication required' }); return; }
  const invitation = await inviteStaff(inviteStaffSchema.parse(request.body), invitedBy);
  response.status(201).json({ success: true, data: invitation, message: 'Invitation email sent' });
}

export async function acceptInvite(request: Request, response: Response) {
  const user = await acceptInvitation(acceptInvitationSchema.parse(request.body));
  const token = jwt.sign(createTokenPayload(user), env.JWT_SECRET, { expiresIn: '7d' });
  response.status(201).json({ success: true, data: { token, user: createTokenPayload(user) } });
}

export async function changeUserRole(request: Request, response: Response) {
  const userId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const user = await updateUserRole(userId, updateUserRoleSchema.parse(request.body).role);
  response.json({ success: true, data: user });
}

export async function listUsers(_request: Request, response: Response) { response.json({ success: true, data: await listManagedUsers() }); }
