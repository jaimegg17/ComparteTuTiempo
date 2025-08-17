const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const user1 = await prisma.user.upsert({
    where: { email: 'usuario1@test.com' },
    update: {},
    create: {
      email: 'usuario1@test.com',
      password: 'password123',
      name: 'Usuario Test 1',
      phoneNumber: '123456789',
      location: 'Madrid, España',
      bio: 'Usuario de prueba para desarrollo',
      skills: ['programacion', 'diseno'],
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'usuario2@test.com' },
    update: {},
    create: {
      email: 'usuario2@test.com',
      password: 'password123',
      name: 'Usuario Test 2',
      phoneNumber: '987654321',
      location: 'Barcelona, España',
      bio: 'Otro usuario de prueba',
      skills: ['musica', 'cocina'],
      role: 'USER',
    },
  });

  console.log('✅ Usuarios creados:', { user1: user1.id, user2: user2.id });

  // Crear servicios de prueba
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Clases de Guitarra',
        description: 'Aprende a tocar guitarra desde cero. Clases personalizadas para todos los niveles.',
        duration: 2,
        location: 'Madrid Centro',
        category: 'EDUCACION',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 15.0,
        userId: user1.id,
      },
    }),
    prisma.service.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Limpieza del Hogar',
        description: 'Servicio profesional de limpieza para tu casa. Incluye todas las habitaciones.',
        duration: 4,
        location: 'Madrid',
        category: 'HOGAR',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 12.0,
        userId: user2.id,
      },
    }),
    prisma.service.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Desarrollo Web',
        description: 'Creación de sitios web profesionales con las últimas tecnologías.',
        duration: 8,
        location: 'Remoto',
        category: 'TECNOLOGIA',
        type: 'VIRTUAL',
        status: 'ACTIVO',
        price: 25.0,
        userId: user1.id,
      },
    }),
    prisma.service.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: 'Entrenamiento Personal',
        description: 'Rutinas de ejercicio personalizadas para alcanzar tus objetivos fitness.',
        duration: 1,
        location: 'Madrid Norte',
        category: 'DEPORTES',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 18.0,
        userId: user2.id,
      },
    }),
  ]);

  console.log('✅ Servicios creados:', services.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
