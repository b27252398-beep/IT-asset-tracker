const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTeammates() {
  console.log('Adding specific team members to the database...');

  const teammates = [
    { name: 'Dishant', email: 'dishant@university.edu', department: 'Engineering', role: 'Backend Developer' },
    { name: 'Jatin', email: 'jatin@university.edu', department: 'Design', role: 'UI/UX Designer' },
    { name: 'Rudra', email: 'rudra@university.edu', department: 'Engineering', role: 'DevOps Engineer' },
    { name: 'Aryan', email: 'aryan@university.edu', department: 'Marketing', role: 'Marketing Manager' },
    { name: 'Nisha', email: 'nisha@university.edu', department: 'HR', role: 'HR Specialist' },
    { name: 'Nishit', email: 'nishit@university.edu', department: 'Finance', role: 'Financial Analyst' }
  ];

  for (const person of teammates) {
    await prisma.employee.upsert({
      where: { email: person.email },
      update: {},
      create: {
        name: person.name,
        email: person.email,
        department: person.department,
        role: person.role,
        status: 'Active',
        systemRole: 'EMPLOYEE'
      }
    });
  }

  console.log('Successfully added Dishant, Jatin, Rudra, Aryan, Nisha, and Nishit!');
}

addTeammates()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
