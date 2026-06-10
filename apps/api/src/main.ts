import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UserUpsertInterceptor } from './common/auth/user-upsert.interceptor';
import { PrismaService } from './common/prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración global
  app.setGlobalPrefix('api');
  
  // Configurar archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  const configuredOrigins = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3004',
    ...configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean),
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe con transform habilitado para query params
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Convierte tipos automáticamente (string → number)
    whitelist: true, // Elimina propiedades que no están en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transformOptions: {
      enableImplicitConversion: true, // Convierte tipos automáticamente
    },
  }));

  // Interceptor global para upsert de usuarios
  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new UserUpsertInterceptor(prismaService));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'ComparteTuTiempo API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'API para la plataforma de banco de tiempo')
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 API ejecutándose en http://localhost:${port}`);
  console.log(`📚 Documentación disponible en http://localhost:${port}/docs`);
}

bootstrap();
