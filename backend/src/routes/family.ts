import { Router } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../services/prisma.js';
import { assertFamilyAccess } from '../services/access.js';

const router = Router();
router.use(requireAuth);

router.post('/create', validate(z.object({ planId: z.string().optional(), maxMembers: z.number().min(1).max(10).optional() })), async (req, res) => {
  const family = await prisma.family.create({
    data: {
      holderUserId: req.user!.id,
      planId: req.body.planId,
      maxMembers: req.body.maxMembers ?? 5,
      users: { create: { userId: req.user!.id } },
    },
  });
  res.status(201).json(family);
});

router.get('/', async (req, res) => {
  const families = await prisma.family.findMany({
    where: { OR: [{ holderUserId: req.user!.id }, { users: { some: { userId: req.user!.id } } }] },
    include: { members: true, subscription: { include: { plan: { include: { benefits: true } } } } },
  });
  res.json(families);
});

router.post('/:familyId/members', validate(z.object({ displayName: z.string(), type: z.enum(['ACTIVE', 'PASSIVE']).default('ACTIVE'), age: z.number().optional(), birthYear: z.number().optional(), sex: z.string().optional(), keyNotes: z.string().optional(), emergencyContact: z.string().optional() })), async (req, res) => {
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, req.params.familyId, 'any');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const family = await prisma.family.findUnique({ where: { id: req.params.familyId }, include: { members: true } });
  if (!family) return res.status(404).json({ error: 'Family not found' });
  if (family.members.length >= family.maxMembers) return res.status(400).json({ error: 'Max members reached' });

  const member = await prisma.familyMember.create({ data: { familyId: req.params.familyId, ...req.body } });
  res.status(201).json(member);
});

router.post('/:familyId/invites', validate(z.object({ invitedEmail: z.string().email().optional() })), async (req, res) => {
  const family = await prisma.family.findUnique({ where: { id: req.params.familyId } });
  if (!family || family.holderUserId !== req.user!.id) return res.status(403).json({ error: 'Only titular can invite' });

  const token = randomBytes(20).toString('hex');
  const invite = await prisma.familyInvite.create({
    data: {
      familyId: req.params.familyId,
      token,
      invitedEmail: req.body.invitedEmail,
      expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      createdById: req.user!.id,
    },
  });
  res.status(201).json({ inviteToken: invite.token, inviteLink: `https://docdoccontigo.cl/invite/${token}` });
});

router.post('/invites/accept', validate(z.object({ token: z.string() })), async (req, res) => {
  const invite = await prisma.familyInvite.findUnique({ where: { token: req.body.token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid invite' });

  await prisma.$transaction([
    prisma.familyUser.upsert({
      where: { familyId_userId: { familyId: invite.familyId, userId: req.user!.id } },
      update: {},
      create: { familyId: invite.familyId, userId: req.user!.id },
    }),
    prisma.familyInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);

  res.json({ ok: true, familyId: invite.familyId });
});

export default router;
