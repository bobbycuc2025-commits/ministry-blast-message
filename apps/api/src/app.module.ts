import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { DatabaseModule } from './database/database.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { SmsModule } from './sms/sms.module';
import { BlastModule } from './blast/blast.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
      }
    }),
    DatabaseModule,
    WhatsAppModule,
    SmsModule,
    BlastModule
  ]
})
export class AppModule {}