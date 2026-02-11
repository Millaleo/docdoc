import { ActorType } from '@prisma/client';
import { prisma } from './prisma.js';

type AuditInput = {
  actorType: ActorType;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
};

export const writeAudit = async (input: AuditInput) => {
  await prisma.auditLog.create({ data: input });
};
