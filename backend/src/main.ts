import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Prefix all routes with /api
  app.setGlobalPrefix('api');

  // Configure Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('MMA API Documentation')
    .setDescription('The backend API documentation for the MMA Project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Firebase ID Token',
        in: 'header',
      },
      'JWT-auth', // This name must match @ApiBearerAuth('JWT-auth')
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(AppConfigService);
  const port = configService.port;

  await app.listen(port);
  console.log(`🚀 NestJS Server running on: http://localhost:${port}/api`);
  console.log(
    `📖 Swagger API documentation at: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
