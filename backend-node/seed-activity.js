const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedActivity() {
  const days = 7;
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(12, 0, 0, 0); // Noon

    // Random number of assignments (1-5) and returns (0-3)
    const assignments = Math.floor(Math.random() * 5) + 1;
    const returns = Math.floor(Math.random() * 4);

    for (let j = 0; j < assignments; j++) {
      await prisma.auditLog.create({
        data: {
          action: 'ASSIGN',
          details: 'Assigned asset to employee',
          performedBy: 'System',
          timestamp: new Date(d.getTime() - Math.random() * 10000000),
          asset: { connect: { id: 'ast-001' } }
        }
      });
    }

    for (let k = 0; k < returns; k++) {
      await prisma.auditLog.create({
        data: {
          action: 'UNASSIGN',
          details: 'Asset returned by employee',
          performedBy: 'System',
          timestamp: new Date(d.getTime() - Math.random() * 10000000),
          asset: { connect: { id: 'ast-001' } }
        }
      });
    }
  }

  console.log('Successfully seeded activity data!');
}

seedActivity()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
