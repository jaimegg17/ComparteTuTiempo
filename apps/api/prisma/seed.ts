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
      timeCredits: 300, // 5 horas en minutos
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
      timeCredits: 240, // 4 horas en minutos
    },
  });

  console.log('✅ Usuarios creados:', { user1: user1.id, user2: user2.id });

  // Crear servicios de prueba
  const service1 = await prisma.service.create({
      data: {
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
    });
  
  const service2 = await prisma.service.create({
      data: {
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
    });
  
  const service3 = await prisma.service.create({
      data: {
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
    });
  
  const service4 = await prisma.service.create({
      data: {
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
    });

  console.log('✅ Servicios creados: 4');

  // Crear intercambios de prueba
  const exchanges = await Promise.all([
    prisma.exchange.create({
      data: {
        requestedById: user1.id,
        offeredById: user2.id,
        serviceId: service2.id, // Limpieza del Hogar
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
        state: 'PENDING',
        exchangedTime: 2.0, // 2 horas
      },
    }),
    prisma.exchange.create({
      data: {
        requestedById: user2.id,
        offeredById: user1.id,
        serviceId: service1.id, // Clases de Guitarra
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        state: 'CONFIRMED',
        exchangedTime: 1.5, // 1.5 horas
      },
    }),
    prisma.exchange.create({
      data: {
        requestedById: user1.id,
        offeredById: user2.id,
        serviceId: service4.id, // Entrenamiento Personal
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        state: 'COMPLETED',
        exchangedTime: 1.0, // 1 hora
      },
    }),
  ]);

  console.log('✅ Intercambios creados:', exchanges.length);

  // Crear valoraciones de prueba
  const ratings = await Promise.all([
    prisma.rating.create({
      data: {
        userId: user1.id,
        serviceId: service4.id,
        score: 5,
        comment: 'Excelente entrenamiento, muy profesional y motivador.',
      },
    }),
    prisma.rating.create({
      data: {
        userId: user2.id,
        serviceId: service1.id,
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

  // Crear más servicios variados
  const moreServices = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Clases de Yoga',
        description: 'Sesiones de yoga para todos los niveles. Mejora tu flexibilidad y bienestar.',
        duration: 60,
        location: 'Valencia',
        category: 'DEPORTES',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 12,
        userId: user1.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Reparación de Ordenadores',
        description: 'Diagnóstico y reparación de problemas de hardware y software.',
        duration: 120,
        location: 'Remoto',
        category: 'TECNOLOGIA',
        type: 'VIRTUAL',
        status: 'ACTIVO',
        price: 20,
        userId: user2.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Clases de Cocina Italiana',
        description: 'Aprende a cocinar auténtica comida italiana. Pasta fresca, risotto y más.',
        duration: 180,
        location: 'Sevilla',
        category: 'OTROS',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 30,
        userId: user1.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Asesoría Legal Básica',
        description: 'Consultas legales generales. Contratos, documentos y asesoramiento básico.',
        duration: 60,
        location: 'Remoto',
        category: 'OTROS',
        type: 'VIRTUAL',
        status: 'ACTIVO',
        price: 35,
        userId: user2.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Pintura de Interiores',
        description: 'Servicio de pintura profesional para habitaciones y espacios pequeños.',
        duration: 480,
        location: 'Madrid',
        category: 'HOGAR',
        type: 'PRESENCIAL',
        status: 'ACTIVO',
        price: 40,
        userId: user1.id,
      },
    }),
  ]);

  console.log('✅ Servicios adicionales creados:', moreServices.length);

  // Crear grupos
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Club de Lectura Madrid',
        description: 'Nos reunimos cada mes para discutir libros clásicos y contemporáneos.',
        type: 'PUBLICO',
        isPrivate: false,
        creatorId: user1.id,
      },
    }),
    prisma.group.create({
      data: {
        name: 'Programadores JavaScript',
        description: 'Grupo para compartir recursos y proyectos en JavaScript y frameworks modernos.',
        type: 'TRABAJO',
        isPrivate: false,
        creatorId: user1.id,
      },
    }),
    prisma.group.create({
      data: {
        name: 'Amantes del Running',
        description: 'Grupo para organizar carreras y entrenamientos conjuntos.',
        type: 'HOBBY',
        isPrivate: false,
        creatorId: user2.id,
      },
    }),
  ]);

  console.log('✅ Grupos creados:', groups.length);

  // Crear eventos
  const events = await Promise.all([
    prisma.event.create({
      data: {
        groupId: groups[0].id, // Club de Lectura
        title: 'Discusión: Don Quijote',
        description: 'Analizaremos los primeros capítulos de Don Quijote de la Mancha.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // En 10 días
        location: 'Café Literario, Madrid',
        capacity: 15,
      },
    }),
    prisma.event.create({
      data: {
        groupId: groups[1].id, // Programadores JS
        title: 'Workshop: React Hooks Avanzados',
        description: 'Aprenderemos a usar hooks personalizados y patrones avanzados en React.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días
        location: 'Online via Zoom',
        capacity: 30,
      },
    }),
    prisma.event.create({
      data: {
        groupId: groups[2].id, // Running
        title: 'Carrera 10K Parque del Retiro',
        description: 'Carrera matinal de 10 kilómetros por el Retiro. Todos los niveles bienvenidos.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En 14 días
        location: 'Parque del Retiro, Madrid',
        capacity: 50,
      },
    }),
  ]);

  console.log('✅ Eventos creados:', events.length);

  // Crear membresías
  const memberships = await Promise.all([
    prisma.membership.create({
      data: {
        userId: user1.id,
        groupId: groups[0].id,
        role: 'ADMIN',
        status: 'ACTIVA',
      },
    }),
    prisma.membership.create({
      data: {
        userId: user2.id,
        groupId: groups[0].id,
        role: 'MEMBER',
        status: 'ACTIVA',
      },
    }),
    prisma.membership.create({
      data: {
        userId: user1.id,
        groupId: groups[1].id,
        role: 'ADMIN',
        status: 'ACTIVA',
      },
    }),
    prisma.membership.create({
      data: {
        userId: user2.id,
        groupId: groups[2].id,
        role: 'ADMIN',
        status: 'ACTIVA',
      },
    }),
  ]);

  console.log('✅ Membresías creadas:', memberships.length);

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
