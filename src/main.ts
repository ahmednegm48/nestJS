import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor.js';
import * as express from "express";
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use("/uploads", express.static(join(import.meta.dirname , ".." , "uploads")))
  app.useGlobalInterceptors(new TransformInterceptor(),new LoggingInterceptor())
  await app.listen(Number(process.env.PORT) , ()=>{
    console.log(`App is running on http://127.0.0.1:${process.env.PORT}`)
  });
}
await bootstrap();
