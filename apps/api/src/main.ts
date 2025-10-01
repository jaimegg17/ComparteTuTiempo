import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UserUpsertInterceptor } from './common/auth/user-upsert.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3004'],
    credentials: true,
  });

  // Validación global deshabilitada temporalmente para testing
  // Global validation pipe con transform habilitado para query params
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Convierte tipos automáticamente (string → number)
    whitelist: false, // Deshabilitado temporalmente para evitar errores de validación
    forbidNonWhitelisted: false,
  }));

  // Interceptor global para upsert de usuarios - temporalmente deshabilitado
  // const prismaService = app.get('PrismaService');
  // app.useGlobalInterceptors(new UserUpsertInterceptor(prismaService));

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
