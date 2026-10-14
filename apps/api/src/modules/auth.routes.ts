import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  avatarColorFor,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateMeSchema,
  type AuthResponse,
} from '@baymax/shared';
import { env } from '../config/env';
import { badRequest, conflict, notFound, unauthorized } from '../lib/errors';
import { logger } from '../lib/logger';
import { toUser, type LeanUser } from '../lib/serialize';
import { signToken } from '../lib/tokens';
import { validate } from '../lib/validate';
import { currentUserId, requireAuth } from '../middleware/auth';
import { UserModel } from '../models/User';

const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.isTest ? 10_000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: { code: 'rate_limited', message: 'Too many attempts. Please wait a few minutes.' },
  },
});

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

async function loadUser(id: string) {
  const user = await UserModel.findById(id).lean<LeanUser>();
  if (!user) throw notFound('User');
  return toUser(user);
}

export const authRouter = Router();

authRouter.post('/auth/register', authLimiter, async (req, res) => {
  const input = validate(registerSchema, req.body);
  if (await UserModel.exists({ email: input.email })) {
    throw conflict('An account with this email already exists');
  }
  const { password, ...rest } = input;
  const created = await UserModel.create({
    ...rest,
    passwordHash: await bcrypt.hash(password, 12),
    avatarColor: avatarColorFor(input.email),
  });
  const user = await loadUser(created.id);
  const body: AuthResponse = { token: signToken({ sub: user.id, role: user.role }), user };
  res.status(201).json(body);
});

authRouter.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = validate(loginSchema, req.body);
  const record = await UserModel.findOne({ email }).select('+passwordHash');
  // Compare against a dummy hash when the user is missing to keep timing uniform.
  const ok = await bcrypt.compare(
    password,
    record?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv',
  );
  if (!record || !ok) throw unauthorized('Incorrect email or password');
  const user = await loadUser(record.id);
  const body: AuthResponse = { token: signToken({ sub: user.id, role: user.role }), user };
  res.json(body);
});

authRouter.post('/auth/forgot-password', authLimiter, async (req, res) => {
  const { email } = validate(forgotPasswordSchema, req.body);
  const user = await UserModel.findOne({ email });
  if (user) {
    const token = randomBytes(32).toString('hex');
    user.set('resetToken', {
      hash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60_000),
    });
    await user.save();
    // Wire an email provider here; until then the link is logged for operators.
    logger.info({ email }, `Password reset link: ${env.APP_URL}/reset-password?token=${token}`);
  }
  // Always respond the same way so accounts cannot be enumerated.
  res
    .status(202)
    .json({ message: 'If an account exists for that email, a reset link is on its way.' });
});

authRouter.post('/auth/reset-password', authLimiter, async (req, res) => {
  const { token, password } = validate(resetPasswordSchema, req.body);
  const user = await UserModel.findOne({
    'resetToken.hash': hashToken(token),
    'resetToken.expiresAt': { $gt: new Date() },
  });
  if (!user) throw badRequest('This reset link is invalid or has expired');
  user.set('passwordHash', await bcrypt.hash(password, 12));
  user.set('resetToken', undefined);
  await user.save();
  res.json({ message: 'Your password has been updated. You can now sign in.' });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json(await loadUser(currentUserId(req)));
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const input = validate(updateMeSchema, req.body);
  const user = await UserModel.findById(currentUserId(req));
  if (!user) throw notFound('User');

  if (input.fullName !== undefined) user.fullName = input.fullName;
  if (input.phone !== undefined) user.phone = input.phone;
  // Only the profile matching the account's role may be edited.
  const profileKey = user.role === 'doctor' ? 'doctor' : 'patient';
  const patch = input[profileKey];
  if (patch) {
    for (const [key, value] of Object.entries(patch)) user.set(`${profileKey}.${key}`, value);
  }
  await user.save();
  res.json(await loadUser(user.id));
});

authRouter.post('/me/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = validate(changePasswordSchema, req.body);
  const user = await UserModel.findById(currentUserId(req)).select('+passwordHash');
  if (!user) throw notFound('User');
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest('Your current password is incorrect');
  }
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.status(204).end();
});
