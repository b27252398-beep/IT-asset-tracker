const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function personalizeData() {
  console.log('Personalizing database for final presentation...');

  // 1. Create Krish (The Creator/Student)
  const krish = await prisma.employee.upsert({
    where: { email: 'krish@university.edu' },
    update: {},
    create: {
      name: 'Krish Limbachiya',
      email: 'krish@university.edu',
      department: 'Engineering',
      role: 'Lead Developer (Student)',
      status: 'Active',
      systemRole: 'SUPER_ADMIN'
    }
  });

  // 2. Create the Professor
  const professor = await prisma.employee.upsert({
    where: { email: 'professor@university.edu' },
    update: {},
    create: {
      name: 'Professor John Smith',
      email: 'professor@university.edu',
      department: 'Computer Science',
      role: 'Project Evaluator',
      status: 'Active',
      systemRole: 'EMPLOYEE'
    }
  });

  // 3. Create a Teammate
  const teammate = await prisma.employee.upsert({
    where: { email: 'jane.doe@university.edu' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'jane.doe@university.edu',
      department: 'Engineering',
      role: 'Frontend Developer',
      status: 'Active',
      systemRole: 'IT_SUPPORT'
    }
  });

  // 4. Assign a High-End MacBook Pro to the Professor
  // First, let's create the asset
  const macbook = await prisma.asset.upsert({
    where: { assetTag: 'FYP-MAC-001' },
    update: { employeeId: professor.id, status: 'ASSIGNED' },
    create: {
      assetTag: 'FYP-MAC-001',
      serialNumber: 'APPLE-M3-PRO-999',
      name: 'MacBook Pro 16" M3 Max (128GB RAM)',
      category: 'LAPTOP',
      status: 'ASSIGNED',
      location: 'Faculty Office',
      employeeId: professor.id
    }
  });

  // Also add an audit log for the assignment so it shows on the dashboard
  await prisma.auditLog.create({
    data: {
      action: 'ASSIGN',
      details: 'Assigned high-end MacBook to Professor for FYP Evaluation',
      performedBy: 'Krish Limbachiya',
      asset: { connect: { id: macbook.id } },
      timestamp: new Date()
    }
  });

  console.log('Successfully added Krish, Professor Smith, Jane Doe, and assigned a MacBook Pro!');
}

personalizeData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
