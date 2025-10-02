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
        description: 'Aprende a tocar guitarra desde cero. Clases personalizadas.',
        detailedDescription: 'Ofrezco clases de guitarra personalizadas para todos los niveles, desde principiantes hasta avanzados. Aprenderás teoría musical, técnica, acordes, escalas y tus canciones favoritas. Incluye material didáctico y seguimiento personalizado. Perfecto para quienes quieren aprender un instrumento de forma divertida y efectiva.',
        duration: 2,
        location: 'Madrid Centro',
        availability: 'tarde',
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
        description: 'Servicio profesional de limpieza para tu casa.',
        detailedDescription: 'Servicio completo de limpieza del hogar con productos ecológicos. Incluye limpieza de todas las habitaciones, baños, cocina, ventanas y superficies. Profesionales con experiencia y material propio. Resultados garantizados y atención al detalle. Ideal para mantener tu hogar impecable sin esfuerzo.',
        duration: 4,
        location: 'Madrid',
        availability: 'mañana',
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
        detailedDescription: 'Desarrollo web completo con React, Next.js, Node.js y bases de datos modernas. Diseño responsive, SEO optimizado y rendimiento excepcional. Incluye hosting, dominio y mantenimiento durante 3 meses. Perfecto para empresas y emprendedores que buscan presencia digital profesional.',
        duration: 8,
        location: 'Remoto',
        availability: 'flexible',
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
        description: 'Rutinas de ejercicio personalizadas para tus objetivos fitness.',
        detailedDescription: 'Entrenamiento personal adaptado a tus necesidades y objetivos. Planes de ejercicio personalizados, seguimiento nutricional básico y motivación constante. Sesiones de 1 hora con ejercicios funcionales, cardio y fuerza. Resultados visibles en 4 semanas. Ideal para principiantes y avanzados.',
        duration: 1,
        location: 'Madrid Norte',
        availability: 'mañana-tarde',
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
    // Additional completed exchanges to match ratings
    prisma.exchange.create({
      data: {
        requestedById: user2.id,
        offeredById: user1.id,
        serviceId: service4.id, // Entrenamiento Personal (segundo intercambio)
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
        state: 'COMPLETED',
        exchangedTime: 1.5, // 1.5 horas
      },
    }),
    prisma.exchange.create({
      data: {
        requestedById: user1.id,
        offeredById: user2.id,
        serviceId: service2.id, // Limpieza del Hogar
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
        state: 'COMPLETED',
        exchangedTime: 2.0, // 2 horas
      },
    }),
    prisma.exchange.create({
      data: {
        requestedById: user2.id,
        offeredById: user1.id,
        serviceId: service3.id, // Desarrollo Web
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Hace 4 días
        state: 'COMPLETED',
        exchangedTime: 3.0, // 3 horas
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
    // Additional ratings for different services
    prisma.rating.create({
      data: {
        userId: user1.id,
        serviceId: service2.id, // Limpieza del Hogar
        score: 4,
        comment: 'Muy buen servicio de limpieza, puntual y eficiente',
      },
    }),
    prisma.rating.create({
      data: {
        userId: user2.id,
        serviceId: service3.id, // Desarrollo Web
        score: 5,
        comment: 'Excelente desarrollador, código limpio y bien documentado',
      },
    }),
  ]);

  console.log('✅ Valoraciones creadas:', ratings.length);

  // Crear mensajes de prueba para intercambios
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        exchangeId: exchanges[0].id, // Primer intercambio
        content: 'Hola! Me interesa tu servicio de limpieza. ¿Estarías disponible el próximo fin de semana?',
        senderId: user1.id,
      },
    }),
    prisma.message.create({
      data: {
        exchangeId: exchanges[0].id, // Primer intercambio
        content: '¡Hola! Sí, estoy disponible el sábado por la mañana. ¿Te parece bien?',
        senderId: user2.id,
      },
    }),
    prisma.message.create({
      data: {
        exchangeId: exchanges[0].id, // Primer intercambio
        content: 'Perfecto! Confirmamos entonces para el sábado a las 10:00 AM.',
        senderId: user1.id,
      },
    }),
    prisma.message.create({
      data: {
        exchangeId: exchanges[1].id, // Segundo intercambio
        content: 'Hola! ¿Podrías ayudarme con el desarrollo web?',
        senderId: user2.id,
      },
    }),
    prisma.message.create({
      data: {
        exchangeId: exchanges[1].id, // Segundo intercambio
        content: '¡Por supuesto! ¿Qué tipo de proyecto necesitas?',
        senderId: user1.id,
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
        description: 'Sesiones de yoga para todos los niveles.',
        detailedDescription: 'Clases de yoga adaptadas a tu nivel y necesidades. Practicaremos asanas, pranayama y meditación para mejorar tu flexibilidad, fuerza y bienestar mental. Incluye esterilla y bloques. Ambiente relajado y acogedor. Ideal para liberar estrés y conectar cuerpo y mente.',
        duration: 1,
        location: 'Valencia',
        availability: 'mañana',
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
        description: 'Diagnóstico y reparación de problemas técnicos.',
        detailedDescription: 'Servicio completo de diagnóstico y reparación de ordenadores. Soluciono problemas de hardware (pantallas, teclados, discos duros) y software (virus, sistemas operativos, drivers). Incluye limpieza interna y optimización del sistema. Presupuesto sin compromiso. Experiencia de 10 años en el sector.',
        duration: 2,
        location: 'Remoto',
        availability: 'flexible',
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
        description: 'Aprende a cocinar auténtica comida italiana.',
        detailedDescription: 'Clases prácticas de cocina italiana tradicional. Aprenderás a hacer pasta fresca desde cero, risotto cremoso, pizzas napolitanas y tiramisú auténtico. Incluye todos los ingredientes y recetas para llevar a casa. Ambiente divertido y familiar. No necesitas experiencia previa.',
        duration: 3,
        location: 'Sevilla',
        availability: 'tarde',
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
        description: 'Consultas legales generales y asesoramiento.',
        detailedDescription: 'Asesoría legal para particulares en temas generales: revisión de contratos, reclamaciones, trámites administrativos y consultas básicas. Abogado colegiado con 8 años de experiencia. Primera consulta gratuita. Lenguaje claro y accesible para que entiendas tus derechos y opciones.',
        duration: 1,
        location: 'Remoto',
        availability: 'flexible',
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
        description: 'Servicio profesional de pintura para espacios.',
        detailedDescription: 'Pintura de interiores con acabado profesional. Incluye preparación de superficies, protección de muebles, dos capas de pintura de calidad y limpieza final. Trabajo limpio y preciso. Colores a elegir. Ideal para renovar tu hogar sin complicaciones. Presupuesto gratuito.',
        duration: 8,
        location: 'Madrid',
        availability: 'mañana-tarde',
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
