import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../services/prisma.js';

const router = Router();
router.use(requireAuth);

router.get('/subscription/:familyId', async (req, res) => {
  const subscription = await prisma.subscription.findUnique({
    where: { familyId: req.params.familyId },
    include: { plan: { include: { benefits: true } }, payments: true },
  });
  res.json(subscription);
});

router.get('/admin/plans', allowRoles(Role.STAFF_OPERATOR, Role.STAFF_CLINICAL, Role.ADMIN_SYSTEM), async (_req, res) => {
  const plans = await prisma.plan.findMany({ include: { benefits: true } });
  res.json(plans);
});

router.post('/admin/plans', allowRoles(Role.ADMIN_SYSTEM), validate(z.object({ name: z.string(), description: z.string().optional() })), async (req, res) => {
  const plan = await prisma.plan.create({ data: req.body });
  res.status(201).json(plan);
});

router.post('/admin/plans/:planId/benefits', allowRoles(Role.ADMIN_SYSTEM), validate(z.object({ title: z.string(), detail: z.string() })), async (req, res) => {
  const benefit = await prisma.planBenefit.create({ data: { planId: req.params.planId, ...req.body } });
  res.status(201).json(benefit);
});

export default router;
