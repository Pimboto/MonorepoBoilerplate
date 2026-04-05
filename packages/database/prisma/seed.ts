import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo user (Better Auth manages real users, this is for dev/testing)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cocostudio.dev' },
    update: {},
    create: {
      id: 'seed-demo-user-001',
      name: 'Demo User',
      email: 'demo@cocostudio.dev',
      emailVerified: true,
    },
  });

  console.log('Created demo user:', { id: demoUser.id, email: demoUser.email });

  // Create demo collections
  const portfolioCollection = await prisma.collection.upsert({
    where: { id: 'seed-collection-001' },
    update: {},
    create: {
      id: 'seed-collection-001',
      name: 'Portfolio',
      description: 'My portfolio collection',
      userId: demoUser.id,
    },
  });

  const inspirationCollection = await prisma.collection.upsert({
    where: { id: 'seed-collection-002' },
    update: {},
    create: {
      id: 'seed-collection-002',
      name: 'Inspiration',
      description: 'Design inspiration and references',
      userId: demoUser.id,
    },
  });

  console.log('Created collections:', {
    portfolio: portfolioCollection.name,
    inspiration: inspirationCollection.name,
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
