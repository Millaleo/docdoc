import { Router } from 'express';
import { Role } from '@prisma/client';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { prisma } from '../services/prisma.js';

const router = Router();
router.use(requireAuth, allowRoles(Role.STAFF_OPERATOR, Role.STAFF_CLINICAL, Role.ADMIN_SYSTEM));

router.get('/families', async (req, res) => {
  const q = req.query.q?.toString();
  const families = await prisma.family.findMany({
    where: q
      ? {
          OR: [
            { id: { contains: q } },
            { holder: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    include: { holder: true, members: true, subscription: { include: { plan: true } } },
  });
  res.json(families);
});

router.get('/audit', async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(logs);
});

export default router;
