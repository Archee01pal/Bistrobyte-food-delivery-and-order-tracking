import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activate class-validator processing blocks globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Drops unmapped request body arguments automatically
      transform: true,       // Casts payloads to match their designated TypeScript DTO structures
    }),
  );

  // Enable CORS headers for potential frontend cross-origin requests
  app.enableCors();

  const PORT = 3000;
  await app.listen(PORT);
  console.log(`\n🚀 Event Management Service Online at: http://localhost:${PORT}`);
}
bootstrap();