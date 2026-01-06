import { Module } from '@nestjs/common';
import { BlastService } from './blast.service';
import { BlastController } from './blast.controller';
import { BirthdayScheduler } from './birthday.scheduler';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { SmsModule } from '../sms/sms.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [WhatsAppModule, SmsModule, DatabaseModule],
  controllers: [BlastController],
  providers: [BlastService, BirthdayScheduler],
  exports: [BlastService]
})
export class BlastModule {}