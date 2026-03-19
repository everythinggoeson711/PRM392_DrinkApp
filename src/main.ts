import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình THƯ MỤC UPLOADS (Giữ nguyên của bạn)
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // 2. Cấu hình FULL QUYỀN CORS (Bỏ mọi rào cản)
  app.enableCors({
    origin: true, // Cho phép tất cả các nguồn gửi request tới
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Cho phép tất cả các phương thức HTTP
    credentials: true, // Cho phép gửi Cookie, Authorization Header (Bearer Token)
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With', // Cho phép các Header phổ biến
  });

  // 3. Cấu hình VALIDATION (Giữ nguyên của bạn)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Cấu hình SWAGGER (Giữ nguyên của bạn)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Drink Order Backend API')
    .setDescription('API for Android Drink Order application')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Lắng nghe Port
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api/docs`);
}
bootstrap();