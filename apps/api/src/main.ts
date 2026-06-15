import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UserUpsertInterceptor } from './common/auth/user-upsert.interceptor';
import { PrismaService } from './common/prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global configuration
  app.setGlobalPrefix('api');
  
  // Configure static assets
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

  // Global validation pipe with transform enabled for query params
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically converts types (string → number)
    whitelist: true, // Removes properties that are not in the DTO
    forbidNonWhitelisted: true, // Throws when unknown properties are provided
    transformOptions: {
      enableImplicitConversion: true, // Automatically converts types
    },
  }));

  // Global interceptor for user upsert
  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new UserUpsertInterceptor(prismaService));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'ComparteTuTiempo API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'API for the time bank platform')
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
  
  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}`);
  logger.log(`Documentation available at http://localhost:${port}/docs`);
}

bootstrap();
