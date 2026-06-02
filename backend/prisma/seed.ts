import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminEmail = 'admin@mma.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firebaseUid: 'admin-default-uid',
      email: adminEmail,
      fullName: 'System Administrator',
      phone: '0999999999',
      role: 'admin',
    },
  });
  console.log('Admin user seeded:', admin);

  // 2. Seed Routes
  let route1 = await prisma.route.findFirst({
    where: { origin: 'Hanoi', destination: 'Haiphong' },
  });
  if (!route1) {
    route1 = await prisma.route.create({
      data: {
        origin: 'Hanoi',
        destination: 'Haiphong',
        distanceKm: 120,
      },
    });
  }

  let route2 = await prisma.route.findFirst({
    where: { origin: 'Saigon', destination: 'Dalat' },
  });
  if (!route2) {
    route2 = await prisma.route.create({
      data: {
        origin: 'Saigon',
        destination: 'Dalat',
        distanceKm: 300,
      },
    });
  }
  console.log('Routes seeded:', [route1, route2]);

  // 3. Seed Vehicles
  let vehicle1 = await prisma.vehicle.findFirst({
    where: { name: 'Limousine 9s' },
  });
  if (!vehicle1) {
    vehicle1 = await prisma.vehicle.create({
      data: {
        name: 'Limousine 9s',
        totalSeats: 9,
        type: 'limousine',
        seatLayout: { rows: 3, cols: 3 },
      },
    });
  }

  let vehicle2 = await prisma.vehicle.findFirst({
    where: { name: 'Sleeper 40s' },
  });
  if (!vehicle2) {
    vehicle2 = await prisma.vehicle.create({
      data: {
        name: 'Sleeper 40s',
        totalSeats: 40,
        type: 'sleeper',
        seatLayout: { rows: 10, cols: 4 },
      },
    });
  }
  console.log('Vehicles seeded:', [vehicle1, vehicle2]);

  // 3b. Seed Vehicle Types
  const vehicleTypes = ['limousine', 'sleeper', 'standard'];
  for (const name of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Vehicle types seeded');

  // 4. Seed Trips
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const trip1Departure = new Date(tomorrow.setHours(8, 0, 0, 0));
  let trip1 = await prisma.trip.findFirst({
    where: {
      routeId: route1.id,
      vehicleId: vehicle1.id,
      departureAt: trip1Departure,
    },
  });
  if (!trip1) {
    trip1 = await prisma.trip.create({
      data: {
        routeId: route1.id,
        vehicleId: vehicle1.id,
        departureAt: trip1Departure,
        price: 150000.0,
        licensePlate: '29A-888.88',
        status: 'active',
      },
    });
  }

  const trip2Departure = new Date(tomorrow.setHours(22, 0, 0, 0));
  let trip2 = await prisma.trip.findFirst({
    where: {
      routeId: route2.id,
      vehicleId: vehicle2.id,
      departureAt: trip2Departure,
    },
  });
  if (!trip2) {
    trip2 = await prisma.trip.create({
      data: {
        routeId: route2.id,
        vehicleId: vehicle2.id,
        departureAt: trip2Departure,
        price: 350000.0,
        licensePlate: '51B-999.99',
        status: 'active',
      },
    });
  }
  console.log('Trips seeded:', [trip1, trip2]);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
