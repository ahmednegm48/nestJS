import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT) , ()=>{
    console.log(`App is running on http://127.0.0.1:${process.env.PORT}`)
  });
}
await bootstrap();
