import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthModule } from './auth/auth.module.js';
import { MailModule } from './mail/mail.module.js';
import { LoggerMiddleware } from './common/middlewares/logger.middleware.js';
import { AuthController } from './auth/auth.controller.js';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath:'./config/.env',
    isGlobal:true,
  }),
  MongooseModule.forRootAsync({
    imports:[ConfigModule],
    useFactory: async (configService:ConfigService)=>({
      uri: configService.get<string>('DB_URI'),
      onConnectionCreate : (connection:Connection)=>{
        connection.on("connected", ()=> console.log("Connected to the Database"))
      }
    }),
    inject:[ConfigService]
  }),
  AuthModule,
  MailModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
