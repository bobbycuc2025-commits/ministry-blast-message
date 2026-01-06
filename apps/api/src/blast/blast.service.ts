import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SmsService } from '../sms/sms.service';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

export interface Contact {
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  customFields?: Record<string, any>;
}

export interface BlastJob {
  id: string;
  contacts: Contact[];
  message: string;
  channel: 'whatsapp' | 'sms';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  total: number;
  results: BlastResult[];
  createdAt: Date;
  antiSpamConfig: AntiSpamConfig;
}

export interface BlastResult {
  contact: Contact;
  status: 'success' | 'failed' | 'skipped';
  timestamp: Date;
  error?: string;
}

export interface AntiSpamConfig {
  minDelayMs: number;
  maxDelayMs: number;
  batchSize: number;
  batchDelayMs: number;
  maxMessagesPerHour: number;
  maxMessagesPerDay: number;
  skipWeekends?: boolean;
  allowedHoursStart?: number; // 9 = 9 AM
  allowedHoursEnd?: number;   // 21 = 9 PM
}

@Injectable()
export class BlastService {
  private readonly logger = new Logger(BlastService.name);
  private jobs: Map<string, BlastJob> = new Map();
  private isPaused = false;
  private currentJobId: string | null = null;
  
  // Anti-spam tracking
  private messagesSentLastHour: number = 0;
  private messagesSentToday: number = 0;
  private lastResetHour: Date = new Date();
  private lastResetDay: Date = new Date();

  constructor(
    private databaseService: DatabaseService,
    private whatsappService: WhatsAppService,
    private smsService: SmsService
  ) {
    // Reset counters periodically
    setInterval(() => this.resetCounters(), 60000); // Every minute
  }

  private resetCounters() {
    const now = new Date();
    
    // Reset hourly counter
    if (now.getTime() - this.lastResetHour.getTime() >= 3600000) {
      this.messagesSentLastHour = 0;
      this.lastResetHour = now;
      this.logger.log('📊 Hourly message counter reset');
    }
    
    // Reset daily counter
    if (now.getDate() !== this.lastResetDay.getDate()) {
      this.messagesSentToday = 0;
      this.lastResetDay = now;
      this.logger.log('📊 Daily message counter reset');
    }
  }

  private getDefaultAntiSpamConfig(): AntiSpamConfig {
    return {
      minDelayMs: 3000,        // 3 seconds minimum between messages
      maxDelayMs: 8000,        // 8 seconds maximum between messages
      batchSize: 10,           // Send 10 messages per batch
      batchDelayMs: 60000,     // 1 minute delay between batches
      maxMessagesPerHour: 40,  // Max 40 messages per hour
      maxMessagesPerDay: 200,  // Max 200 messages per day
      skipWeekends: false,     // Don't skip weekends by default
      allowedHoursStart: 9,    // Start at 9 AM
      allowedHoursEnd: 21      // End at 9 PM
    };
  }

  async parseExcel(buffer: Buffer): Promise<Contact[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return this.normalizeContacts(data);
  }

  async parseCsv(text: string): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => resolve(this.normalizeContacts(results.data)),
        error: (error) => reject(error)
      });
    });
  }

  private normalizeContacts(data: any[]): Contact[] {
    return data.map(row => {
      const contact: Contact = {
        name: this.findField(row, ['name', 'full_name', 'fullname', 'contact_name']),
        phone: this.normalizePhone(this.findField(row, ['phone', 'mobile', 'telephone', 'cell', 'whatsapp'])),
        email: this.findField(row, ['email', 'e-mail', 'mail']),
        birthday: this.findField(row, ['birthday', 'dob', 'date_of_birth', 'birth_date']),
        customFields: {}
      };

      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!['name', 'phone', 'email', 'birthday'].some(f => lowerKey.includes(f))) {
          contact.customFields![key] = row[key];
        }
      });

      return contact;
    }).filter(c => c.name && c.phone);
  }

  private findField(row: any, possibleNames: string[]): string {
    for (const name of possibleNames) {
      const keys = Object.keys(row);
      const key = keys.find(k => k.toLowerCase() === name || k.toLowerCase().includes(name));
      if (key && row[key]) return String(row[key]).trim();
    }
    return '';
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('234') && cleaned.length === 10) {
      cleaned = '234' + cleaned;
    }
    return cleaned;
  }

  async createBlast(
    contacts: Contact[], 
    message: string, 
    channel: 'whatsapp' | 'sms',
    customAntiSpam?: Partial<AntiSpamConfig>
  ): Promise<string> {
    const jobId = `blast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const antiSpamConfig = {
      ...this.getDefaultAntiSpamConfig(),
      ...customAntiSpam
    };

    const job: BlastJob = {
      id: jobId,
      contacts,
      message,
      channel,
      status: 'pending',
      progress: 0,
      total: contacts.length,
      results: [],
      createdAt: new Date(),
      antiSpamConfig
    };

    this.jobs.set(jobId, job);
    
    this.processBlast(jobId).catch(err => {
      this.logger.error(`Blast ${jobId} failed:`, err);
      job.status = 'failed';
    });

    return jobId;
  }

  private async processBlast(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    this.currentJobId = jobId;
    job.status = 'running';
    
    const config = job.antiSpamConfig;
    let batchCount = 0;

    for (let i = 0; i < job.contacts.length; i++) {
      // Check if paused
      if (this.isPaused) {
        job.status = 'paused';
        this.logger.warn(`⏸️  Blast ${jobId} paused`);
        while (this.isPaused) {
          await this.sleep(1000);
        }
        job.status = 'running';
        this.logger.log(`▶️  Blast ${jobId} resumed`);
      }

      // Check hourly limit
      if (this.messagesSentLastHour >= config.maxMessagesPerHour) {
        this.logger.warn(`⚠️  Hourly limit reached (${config.maxMessagesPerHour}). Waiting 1 hour...`);
        await this.sleep(3600000); // Wait 1 hour
        this.messagesSentLastHour = 0;
      }

      // Check daily limit
      if (this.messagesSentToday >= config.maxMessagesPerDay) {
        this.logger.warn(`⚠️  Daily limit reached (${config.maxMessagesPerDay}). Pausing until tomorrow...`);
        job.status = 'paused';
        return;
      }

      // Check allowed hours
      const currentHour = new Date().getHours();
      if (currentHour < config.allowedHoursStart || currentHour >= config.allowedHoursEnd) {
        this.logger.warn(`⚠️  Outside allowed hours (${config.allowedHoursStart}:00-${config.allowedHoursEnd}:00). Pausing...`);
        job.status = 'paused';
        return;
      }

      // Check weekends
      if (config.skipWeekends) {
        const day = new Date().getDay();
        if (day === 0 || day === 6) {
          this.logger.warn(`⚠️  Weekend detected. Skipping...`);
          job.status = 'paused';
          return;
        }
      }

      const contact = job.contacts[i];
      
      try {
        // Send message
        if (job.channel === 'whatsapp') {
          const personalizedMessage = this.personalizeMessage(job.message, contact);
          await this.whatsappService.sendMessage(contact.phone, personalizedMessage);
        } else {
          const personalizedMessage = this.personalizeMessage(job.message, contact);
          await this.smsService.sendSms(contact.phone, personalizedMessage);
        }

        job.results.push({
          contact,
          status: 'success',
          timestamp: new Date()
        });

        this.messagesSentLastHour++;
        this.messagesSentToday++;
        
        this.logger.log(`✅ Message sent to ${contact.name} (${i + 1}/${job.total})`);
      } catch (error) {
        job.results.push({
          contact,
          status: 'failed',
          timestamp: new Date(),
          error: error.message
        });
        
        this.logger.error(`❌ Failed to send to ${contact.name}:`, error.message);
      }

      job.progress = i + 1;
      batchCount++;

      // Random delay between messages (anti-spam)
      const delay = this.getRandomDelay(config.minDelayMs, config.maxDelayMs);
      this.logger.log(`⏳ Waiting ${delay}ms before next message...`);
      await this.sleep(delay);

      // Batch delay (additional protection)
      if (batchCount >= config.batchSize && i < job.contacts.length - 1) {
        this.logger.log(`⏸️  Batch complete (${config.batchSize} messages). Waiting ${config.batchDelayMs}ms...`);
        await this.sleep(config.batchDelayMs);
        batchCount = 0;
      }
    }

    job.status = 'completed';
    this.currentJobId = null;
    
    this.logger.log(`✅ Blast ${jobId} completed! Sent: ${job.results.filter(r => r.status === 'success').length}/${job.total}`);
    
    // Convert successful contacts to members
    await this.convertLeadsToMembers(job.results.filter(r => r.status === 'success').map(r => r.contact));
  }

  private personalizeMessage(template: string, contact: Contact): string {
    return template
      .replace(/\{\{name\}\}/g, contact.name)
      .replace(/\{\{phone\}\}/g, contact.phone)
      .replace(/\{\{email\}\}/g, contact.email || '');
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async convertLeadsToMembers(contacts: Contact[]) {
    for (const contact of contacts) {
      try {
        await this.databaseService.upsertMember({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          birthday: contact.birthday,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      } catch (error) {
        this.logger.error(`Failed to convert ${contact.name} to member:`, error);
      }
    }
  }

  pauseBlast(): void {
    this.isPaused = true;
    this.logger.log('⏸️  Blast paused by user');
  }

  resumeBlast(): void {
    this.isPaused = false;
    this.logger.log('▶️  Blast resumed by user');
  }

  getJob(jobId: string): BlastJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): BlastJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getCurrentStats() {
    return {
      messagesSentLastHour: this.messagesSentLastHour,
      messagesSentToday: this.messagesSentToday,
      isPaused: this.isPaused,
      currentJobId: this.currentJobId
    };
  }

  async sendBirthdayMessages() {
    const upcoming = await this.databaseService.getUpcomingBirthdays(1);
    
    for (const member of upcoming) {
      if (member.daysUntil === 0) {
        const message = `🎉 Happy Birthday ${member.name}! 🎂\n\nMay this special day bring you joy, blessings, and wonderful memories. We're grateful to have you as part of our church family!\n\n🙏 God bless you abundantly!`;
        
        try {
          await this.whatsappService.sendMessage(member.phone, message);
          this.logger.log(`Birthday message sent to ${member.name}`);
          await this.sleep(5000); // 5 second delay between birthday messages
        } catch (error) {
          this.logger.error(`Failed to send birthday message to ${member.name}:`, error);
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}