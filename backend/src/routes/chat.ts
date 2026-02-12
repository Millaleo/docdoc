import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../services/prisma.js';
import { assertFamilyAccess } from '../services/access.js';

const router = Router();
router.use(requireAuth);

router.get('/conversations', async (req, res) => {
  const conversations = req.user!.role === Role.USER_EXTERNAL
    ? await prisma.conversation.findMany({ where: { family: { users: { some: { userId: req.user!.id } } } }, orderBy: { createdAt: 'desc' } })
    : await prisma.conversation.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(conversations);
});

router.post('/conversations', validate(z.object({ familyId: z.string(), memberId: z.string().optional(), subject: z.string().optional(), tag: z.string().optional() })), async (req, res) => {
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, req.body.familyId, 'canChat');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  const conversation = await prisma.conversation.create({ data: req.body });
  res.status(201).json(conversation);
});

router.get('/conversations/:id/messages', async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, conversation.familyId, 'canChat');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const messages = await prisma.message.findMany({ where: { conversationId: req.params.id }, orderBy: { createdAt: 'asc' } });
  res.json(messages);
});

router.post('/conversations/:id/messages', validate(z.object({ text: z.string().optional(), attachmentPath: z.string().optional(), attachmentMime: z.string().optional() })), async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, conversation.familyId, 'canChat');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const msg = await prisma.message.create({
    data: {
      conversationId: req.params.id,
      senderUserId: req.user!.id,
      text: req.body.text,
      attachmentPath: req.body.attachmentPath,
      attachmentMime: req.body.attachmentMime,
    },
  });
  res.status(201).json(msg);
});

router.post('/admin/conversations/:id/assign', allowRoles(Role.STAFF_OPERATOR, Role.STAFF_CLINICAL, Role.ADMIN_SYSTEM), validate(z.object({ staffUserId: z.string(), tag: z.string().optional() })), async (req, res) => {
  const updated = await prisma.conversation.update({
    where: { id: req.params.id },
    data: { assignedStaffId: req.body.staffUserId, tag: req.body.tag },
  });
  res.json(updated);
});

export default router;
