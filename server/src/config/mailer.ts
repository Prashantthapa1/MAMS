import nodemailer from 'nodemailer';
import { env } from './env.js';
import { ApiError } from '../utils/apiError.js';

export async function sendInvitationEmail(email: string, token: string) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    throw new ApiError(503, 'Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.');
  }
  const inviteUrl = `${env.APP_URL}/accept-invitation?token=${encodeURIComponent(token)}`;
  const transporter = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } });
  await transporter.sendMail({ from: env.SMTP_FROM, to: email, subject: 'You are invited to Employee Manager', text: `You have been invited. Set your password here: ${inviteUrl}` });
}
