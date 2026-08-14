import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('Mini Project API')
    .setDescription('The API description for my NestJS project')
    .setVersion('1.0')
    .build();

  // 3. Create and mount the interactive UI
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 


  // Serve the public directory folder layout statically
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  await app.listen(3000);
}
bootstrap();