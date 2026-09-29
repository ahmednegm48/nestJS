import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join, resolve } from 'node:path';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';

const currentDir = resolve('./src/mail');

@Module({
  imports:[MailerModule.forRootAsync({
    imports:[ConfigModule],
    useFactory: async (configService:ConfigService) =>({
      transport:{
        service:"gmail",
        auth:{
          user:configService.get<string>("EMAIL"),
          pass:configService.get<string>("PASSWORD"),
        },
      },
        defaults:{
          from:`"No Reply"<${configService.get<string>("EMAIL")}>`
        },
        template:{
          dir: join(currentDir , "templates"),
          adapter:new EjsAdapter(),
        },
    }),
    inject: [ConfigService],
  })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
