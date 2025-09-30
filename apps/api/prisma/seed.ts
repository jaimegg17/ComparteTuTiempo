const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const user1 = await prisma.user.upsert({
    where: { email: 'usuario1@test.com' },
    update: {},
    create: {
      id: 'auth0|test-user-1',
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
      id: 'auth0|test-user-2',
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

  // Crear intercambios de prueba
  const exchanges = await Promise.all([
    prisma.exchange.upsert({
      where: { id: 1 },
      update: {},
      create: {
        requestedById: user1.id,
        offeredById: user2.id,
        serviceId: 2, // Limpieza del Hogar
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
        state: 'PENDING',
        exchangedTime: 2.0, // 2 horas
      },
    }),
    prisma.exchange.upsert({
      where: { id: 2 },
      update: {},
      create: {
        requestedById: user2.id,
        offeredById: user1.id,
        serviceId: 1, // Clases de Guitarra
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        state: 'CONFIRMED',
        exchangedTime: 1.5, // 1.5 horas
      },
    }),
    prisma.exchange.upsert({
      where: { id: 3 },
      update: {},
      create: {
        requestedById: user1.id,
        offeredById: user2.id,
        serviceId: 4, // Entrenamiento Personal
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        state: 'COMPLETED',
        exchangedTime: 1.0, // 1 hora
      },
    }),
  ]);

  console.log('✅ Intercambios creados:', exchanges.length);

  // Crear valoraciones de prueba
  const ratings = await Promise.all([
    prisma.rating.upsert({
      where: { 
        userId_serviceId: {
          userId: user1.id,
          serviceId: 4, // Entrenamiento Personal
        }
      },
      update: {},
      create: {
        userId: user1.id,
        serviceId: 4,
        score: 5,
        comment: 'Excelente entrenamiento, muy profesional y motivador.',
      },
    }),
    prisma.rating.upsert({
      where: { 
        userId_serviceId: {
          userId: user2.id,
          serviceId: 1, // Clases de Guitarra
        }
      },
      update: {},
      create: {
        userId: user2.id,
        serviceId: 1,
        score: 4,
        comment: 'Muy buenas clases, aprendí mucho en poco tiempo.',
      },
    }),
  ]);

  console.log('✅ Valoraciones creadas:', ratings.length);

  // Crear mensajes de prueba
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hola! Me interesa tu servicio de limpieza. ¿Estarías disponible el próximo fin de semana?',
        senderId: user1.id,
        receiverId: user2.id,
      },
    }),
    prisma.message.create({
      data: {
        content: '¡Hola! Sí, estoy disponible el sábado por la mañana. ¿Te parece bien?',
        senderId: user2.id,
        receiverId: user1.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Perfecto! Confirmamos entonces para el sábado a las 10:00 AM.',
        senderId: user1.id,
        receiverId: user2.id,
      },
    }),
  ]);

  console.log('✅ Mensajes creados:', messages.length);

  // Crear comunidades de prueba
  const communities = await Promise.all([
    prisma.community.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Desarrolladores Madrid',
        description: 'Comunidad de desarrolladores en Madrid para intercambiar conocimientos técnicos.',
        isPrivate: false,
        creatorId: user1.id,
      },
    }),
    prisma.community.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Músicos Barcelona',
        description: 'Grupo de músicos en Barcelona para colaboraciones y aprendizaje.',
        isPrivate: false,
        creatorId: user2.id,
      },
    }),
  ]);

  console.log('✅ Comunidades creadas:', communities.length);

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
