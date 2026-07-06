import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Trust reverse proxy (Cloudflare Tunnel / nginx) so req.ip and req.protocol are correct
  app.set('trust proxy', 1);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('VPS Panel API')
    .setDescription('Enterprise VPS Management Panel API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8006;
  await app.listen(port, '0.0.0.0');
  console.log(`VPS Panel backend listening on :${port}`);
}
bootstrap();
