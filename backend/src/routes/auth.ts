import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { validate } from '../middleware/validate.js';
import { signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { requireAuth } from '../middleware/auth.js';
import { writeAudit } from '../services/audit.js';
import { ActorType, Role } from '@prisma/client';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, fullName } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role: Role.USER_EXTERNAL },
  });
  await writeAudit({
    actorType: ActorType.USER,
    actorId: user.id,
    action: 'AUTH_REGISTER',
    resourceType: 'User',
    resourceId: user.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return res.status(201).json({ id: user.id, email: user.email });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user.id, user.role, user.email);
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  await writeAudit({
    actorType: user.role === Role.USER_EXTERNAL ? ActorType.USER : ActorType.STAFF,
    actorId: user.id,
    action: 'AUTH_LOGIN',
    resourceType: 'Session',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });
router.post('/refresh', validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body;
  const session = await prisma.session.findUnique({ where: { refreshToken }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return res.status(401).json({ error: 'Invalid refresh token' });

  const nextRefresh = signRefreshToken(session.userId);
  await prisma.session.update({ where: { id: session.id }, data: { refreshToken: nextRefresh } });
  const accessToken = signAccessToken(session.user.id, session.user.role, session.user.email);
  return res.json({ accessToken, refreshToken: nextRefresh });
});

router.post('/logout', validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body;
  await prisma.session.deleteMany({ where: { refreshToken } });
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json({ user });
});

export default router;
