import { Role } from '@prisma/client';
import { prisma } from './prisma.js';

export const isStaff = (role: Role) => role !== Role.USER_EXTERNAL;

export const assertFamilyAccess = async (
  userId: string,
  role: Role,
  familyId: string,
  capability: 'canChat' | 'canCreateTicket' | 'canViewDocs' | 'any' = 'any',
) => {
  if (isStaff(role)) return true;

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) return false;
  if (family.holderUserId === userId) return true;

  const link = await prisma.familyUser.findUnique({ where: { familyId_userId: { familyId, userId } } });
  if (!link) return false;
  if (capability === 'any') return true;
  return link[capability];
};
