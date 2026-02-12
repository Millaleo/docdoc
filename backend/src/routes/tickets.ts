import { Router } from 'express';
import { Role, TicketStatus } from '@prisma/client';
import { z } from 'zod';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../services/prisma.js';
import { assertFamilyAccess } from '../services/access.js';

const router = Router();
router.use(requireAuth);

router.get('/tickets', async (req, res) => {
  const tickets = req.user!.role === Role.USER_EXTERNAL
    ? await prisma.ticket.findMany({ where: { family: { users: { some: { userId: req.user!.id } } } }, include: { events: true }, orderBy: { createdAt: 'desc' } })
    : await prisma.ticket.findMany({ include: { events: true }, orderBy: { createdAt: 'desc' } });
  res.json(tickets);
});

router.post('/tickets', validate(z.object({ familyId: z.string(), memberId: z.string().optional(), type: z.enum(['ADMIN', 'CLINICAL', 'PRESCRIPTION_REQUEST', 'LAB_ORDER_REQUEST', 'PROCEDURE', 'OTHER']), title: z.string(), description: z.string() })), async (req, res) => {
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, req.body.familyId, 'canCreateTicket');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const ticket = await prisma.ticket.create({
    data: {
      ...req.body,
      createdByUserId: req.user!.id,
      events: { create: { actorId: req.user!.id, eventType: 'STATUS_CHANGE', note: 'RECEIVED' } },
    },
    include: { events: true },
  });
  res.status(201).json(ticket);
});

router.get('/tickets/:id', async (req, res) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id }, include: { events: true } });
  if (!ticket) return res.status(404).json({ error: 'Not found' });
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, ticket.familyId, 'canCreateTicket');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  res.json(ticket);
});

router.patch('/admin/tickets/:id', allowRoles(Role.STAFF_OPERATOR, Role.STAFF_CLINICAL, Role.ADMIN_SYSTEM), validate(z.object({ status: z.nativeEnum(TicketStatus).optional(), assignedToId: z.string().optional(), resolutionNote: z.string().optional(), comment: z.string().optional() })), async (req, res) => {
  const data: any = {};
  if (req.body.status) data.status = req.body.status;
  if (req.body.assignedToId) data.assignedToId = req.body.assignedToId;
  if (req.body.resolutionNote) data.resolutionNote = req.body.resolutionNote;

  const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data });
  await prisma.ticketEvent.create({
    data: {
      ticketId: ticket.id,
      actorId: req.user!.id,
      eventType: req.body.status ? 'STATUS_CHANGE' : req.body.assignedToId ? 'ASSIGNMENT' : 'COMMENT',
      note: req.body.comment ?? req.body.status ?? req.body.resolutionNote,
    },
  });
  res.json(ticket);
});

export default router;
