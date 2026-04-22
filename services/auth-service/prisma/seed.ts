import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';

if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const sqliteFile = process.env.DATABASE_URL.slice('file:'.length);
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), sqliteFile).replace(/\\/g, '/')}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Indian locations...');

  // 1. Create a dummy host user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'host@nextgen.com' },
    update: {},
    create: {
      email: 'host@nextgen.com',
      name: 'Super Host India',
      passwordHash,
      hostProfile: {
        create: {
          bio: 'I bring the best hidden gems of India to the world.',
        }
      }
    },
    include: { hostProfile: true }
  });

  if (!user.hostProfile) {
    throw new Error('Host profile generation failed');
  }

  // 2. Clear old demo properties if needed
  await prisma.property.deleteMany({
    where: { hostId: user.hostProfile.id }
  });

  // 3. Insert Indian Properties
  const properties = [
    {
      hostId: user.hostProfile.id,
      title: 'Modern Loft in Koregaon Park',
      description: 'Designer duplex with terrace',
      location: 'Pune',
      price: 8200,
      size: '2 bedrooms',
      features: 'WiFi, Balcony',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Beach House in Calangute',
      description: 'Seconds from the shore',
      location: 'Goa',
      price: 11000,
      size: '3 bedrooms, Pool',
      features: 'Beachfront, WiFi',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Sea-view Flat in Bandra',
      description: 'Steps from Bandstand promenade',
      location: 'Mumbai',
      price: 13500,
      size: '2 bedrooms',
      features: 'Sea view, Gym',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Heritage Haveli in Pink City',
      description: 'Royal stay with traditional artisan decor',
      location: 'Jaipur',
      price: 9000,
      size: '4 bedrooms, Courtyard',
      features: 'Royal heritage, Custom tours',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Houseboat on Dal Lake',
      description: 'Peaceful stay on water surrounded by mountains',
      location: 'Srinagar',
      price: 15000,
      size: '2 bedrooms',
      features: 'Boat ride, Mountain views',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Backwaters Retreat',
      description: 'Scenic villa amidst lush green palm trees',
      location: 'Kerala',
      price: 7500,
      size: '2 bedrooms',
      features: 'Backwater view, Ayurveda massage',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80'])
    },
    {
      hostId: user.hostProfile.id,
      title: 'Himalayan Cabin stay',
      description: 'Cozy wooden cabin near the Rohtang Pass',
      location: 'Manali',
      price: 6800,
      size: '1 bedroom',
      features: 'Mountain view, Fireplace',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=900&q=80'])
    }
  ];

  for (const property of properties) {
    const createdProp = await prisma.property.create({ data: property });
    console.log(`Created property: ${createdProp.title}`);

    // Create 3 mock bookings per property to generate analytics data
    const booking = await prisma.booking.create({
      data: {
        userId: user.id, // Booked by the host for demo purposes
        propertyId: createdProp.id,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
        totalPrice: createdProp.price * 2,
        status: "CONFIRMED"
      }
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: createdProp.price * 2,
        status: "COMPLETED",
        method: "CREDIT_CARD"
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
