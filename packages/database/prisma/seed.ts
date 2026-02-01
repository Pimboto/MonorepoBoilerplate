import { PrismaClient } from '@prisma/client';

// Prisma 7 reads DATABASE_URL automatically from environment
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Genres
  const sciFi = await prisma.genre.upsert({
    where: { name: 'Science Fiction' },
    update: {},
    create: { name: 'Science Fiction' },
  });

  const fantasy = await prisma.genre.upsert({
    where: { name: 'Fantasy' },
    update: {},
    create: { name: 'Fantasy' },
  });

  const mystery = await prisma.genre.upsert({
    where: { name: 'Mystery' },
    update: {},
    create: { name: 'Mystery' },
  });

  console.log('Created genres:', { sciFi, fantasy, mystery });

  // Create Authors
  const asimov = await prisma.author.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      firstName: 'Isaac',
      lastName: 'Asimov',
    },
  });

  const tolkien = await prisma.author.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      firstName: 'J.R.R.',
      lastName: 'Tolkien',
    },
  });

  const christie = await prisma.author.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      firstName: 'Agatha',
      lastName: 'Christie',
    },
  });

  console.log('Created authors:', { asimov, tolkien, christie });

  // Create Books
  const foundation = await prisma.book.upsert({
    where: { title: 'Foundation' },
    update: {},
    create: {
      title: 'Foundation',
      authorId: asimov.id,
      genreId: sciFi.id,
      publishDate: new Date('1951-05-01'),
    },
  });

  const lotr = await prisma.book.upsert({
    where: { title: 'The Lord of the Rings' },
    update: {},
    create: {
      title: 'The Lord of the Rings',
      authorId: tolkien.id,
      genreId: fantasy.id,
      publishDate: new Date('1954-07-29'),
    },
  });

  const murderOnTheOrientExpress = await prisma.book.upsert({
    where: { title: 'Murder on the Orient Express' },
    update: {},
    create: {
      title: 'Murder on the Orient Express',
      authorId: christie.id,
      genreId: mystery.id,
      publishDate: new Date('1934-01-01'),
    },
  });

  console.log('Created books:', {
    foundation,
    lotr,
    murderOnTheOrientExpress,
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
