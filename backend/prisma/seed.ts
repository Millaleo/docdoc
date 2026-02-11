import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('Admin1234!', 12);
  const operatorPass = await bcrypt.hash('Operator1234!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@docdoccontigo.cl' },
    update: {},
    create: {
      email: 'admin@docdoccontigo.cl',
      fullName: 'Admin DocDoc',
      passwordHash: adminPass,
      role: Role.ADMIN_SYSTEM,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@docdoccontigo.cl' },
    update: {},
    create: {
      email: 'operator@docdoccontigo.cl',
      fullName: 'Operator DocDoc',
      passwordHash: operatorPass,
      role: Role.STAFF_OPERATOR,
      emailVerified: true,
    },
  });

  const familyPlan = await prisma.plan.upsert({
    where: { id: 'basic-plan' },
    update: {},
    create: {
      id: 'basic-plan',
      name: 'Plan Familiar Básico',
      description: 'Cobertura esencial para hasta 5 integrantes',
      benefits: {
        create: [
          { title: 'Canal prioritario', detail: 'Respuesta operativa en 24h hábiles.' },
          { title: 'Orientación clínica', detail: 'Canal de seguimiento clínico no diagnóstico.' },
        ],
      },
    },
  });

  const family = await prisma.family.upsert({
    where: { id: 'demo-family' },
    update: {},
    create: {
      id: 'demo-family',
      holderUserId: admin.id,
      planId: familyPlan.id,
      users: { create: [{ userId: admin.id }] },
      members: { create: [{ displayName: 'Paciente Demo', type: 'ACTIVE', age: 35, sex: 'F' }] },
    },
  });

  await prisma.subscription.upsert({
    where: { familyId: family.id },
    update: {},
    create: {
      familyId: family.id,
      planId: familyPlan.id,
      status: 'ACTIVE',
      renewalDate: new Date(Date.now() + 30 * 86400000),
      payments: { create: [{ amount: 19990, reference: 'seed-payment' }] },
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
