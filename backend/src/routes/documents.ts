import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../services/prisma.js';
import { assertFamilyAccess } from '../services/access.js';

const router = Router();
router.use(requireAuth);

router.get('/documents/:familyId', async (req, res) => {
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, req.params.familyId, 'canViewDocs');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  const docs = await prisma.document.findMany({ where: { familyId: req.params.familyId }, orderBy: { createdAt: 'desc' } });
  res.json(docs);
});

router.post('/documents', validate(z.object({ familyId: z.string(), memberId: z.string().optional(), category: z.enum(['EXAM', 'PRESCRIPTION', 'INSTRUCTIONS', 'CERTIFICATE', 'OTHER']), title: z.string(), filePath: z.string(), mimeType: z.string().optional() })), async (req, res) => {
  const allowed = await assertFamilyAccess(req.user!.id, req.user!.role, req.body.familyId, 'canViewDocs');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  const doc = await prisma.document.create({ data: { ...req.body, uploadedById: req.user!.id } });
  res.status(201).json(doc);
});

router.post('/admin/documents', allowRoles(Role.STAFF_OPERATOR, Role.STAFF_CLINICAL, Role.ADMIN_SYSTEM), validate(z.object({ familyId: z.string(), memberId: z.string().optional(), category: z.enum(['EXAM', 'PRESCRIPTION', 'INSTRUCTIONS', 'CERTIFICATE', 'OTHER']), title: z.string(), filePath: z.string(), mimeType: z.string().optional() })), async (req, res) => {
  const doc = await prisma.document.create({ data: { ...req.body, uploadedById: req.user!.id } });
  res.status(201).json(doc);
});

export default router;
