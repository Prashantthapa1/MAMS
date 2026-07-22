import { describe, expect, it } from 'vitest';
import {
  createEmployeeSchema,
  createExpenseSchema,
  createLeaveRequestSchema,
  loginSchema,
  upsertAttendanceSchema,
} from '../index.js';

describe('validation schemas', () => {
  it('normalizes login email', () => {
    const result = loginSchema.parse({ email: ' ADMIN@EXAMPLE.COM ', password: 'admin123' });

    expect(result.email).toBe('admin@example.com');
  });

  it('accepts a valid employee payload', () => {
    const result = createEmployeeSchema.parse({
      fullName: 'Maya Gurung',
      email: 'maya@example.com',
      phone: '+977-9800000002',
      position: 'Accountant',
      joinDate: '2026-07-22',
      monthlySalary: '62000',
    });

    expect(result.monthlySalary).toBe(62000);
    expect(result.status).toBe('Active');
  });

  it('rejects leave requests where end date is before start date', () => {
    const result = createLeaveRequestSchema.safeParse({
      employeeId: '67c3fadc-355a-4d25-a1bc-3091db196a53',
      leaveType: 'Sick',
      startDate: '2026-07-23',
      endDate: '2026-07-22',
      reason: 'Medical appointment',
    });

    expect(result.success).toBe(false);
  });

  it('validates attendance time format', () => {
    const result = upsertAttendanceSchema.safeParse({
      employeeId: '67c3fadc-355a-4d25-a1bc-3091db196a53',
      date: '2026-07-22',
      checkInTime: '9:00',
    });

    expect(result.success).toBe(false);
  });

  it('accepts required expense categories', () => {
    const result = createExpenseSchema.parse({
      date: '2026-07-22',
      category: 'Internet',
      description: 'Office internet',
      amount: 3200,
    });

    expect(result.category).toBe('Internet');
  });
});
