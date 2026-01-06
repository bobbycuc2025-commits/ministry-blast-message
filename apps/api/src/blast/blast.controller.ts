import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlastService, Contact } from './blast.service';
import { DatabaseService } from '../database/database.service';

@Controller('blast')
export class BlastController {
  constructor(
    private blastService: BlastService,
    private databaseService: DatabaseService
  ) {}

  @Post('parse-contacts')
  @UseInterceptors(FileInterceptor('file'))
  async parseContacts(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let contacts: Contact[];

    const ext = file.originalname.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      contacts = await this.blastService.parseCsv(file.buffer.toString('utf-8'));
    } else if (ext === 'xlsx' || ext === 'xls') {
      contacts = await this.blastService.parseExcel(file.buffer);
    } else {
      throw new BadRequestException('Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV file');
    }

    return { 
      success: true,
      contacts, 
      count: contacts.length 
    };
  }

  @Post('import-from-sheet')
  async importFromSheet(@Body() body: { sheetUrl: string }) {
    const spreadsheetId = this.extractSpreadsheetId(body.sheetUrl);
    
    if (!spreadsheetId) {
      throw new BadRequestException('Invalid Google Sheet URL');
    }

    try {
      // Try to get data from a common sheet name
      let data;
      const possibleNames = ['Contacts', 'Sheet1', 'Leads', 'Members'];
      
      for (const name of possibleNames) {
        try {
          data = await this.databaseService.getData(name);
          if (data.length > 0) break;
        } catch (error) {
          continue;
        }
      }

      if (!data || data.length === 0) {
        throw new BadRequestException('No data found in sheet. Please ensure you have a sheet named "Contacts", "Sheet1", "Leads", or "Members"');
      }

      const headers = data[0];
      const contacts: Contact[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const contact: any = {};
        
        headers.forEach((header, idx) => {
          contact[header.toLowerCase()] = row[idx] || '';
        });

        if (contact.name && contact.phone) {
          contacts.push({
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            birthday: contact.birthday
          });
        }
      }

      return { 
        success: true,
        contacts, 
        count: contacts.length 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to import from Google Sheet');
    }
  }

  @Post('create')
  async createBlast(@Body() body: {
    contacts: Contact[];
    message: string;
    channel: 'whatsapp' | 'sms';
  }) {
    if (!body.contacts || body.contacts.length === 0) {
      throw new BadRequestException('No contacts provided');
    }

    if (!body.message || body.message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    if (!['whatsapp', 'sms'].includes(body.channel)) {
      throw new BadRequestException('Channel must be either "whatsapp" or "sms"');
    }

    const jobId = await this.blastService.createBlast(
      body.contacts,
      body.message,
      body.channel
    );

    return { 
      success: true,
      jobId, 
      status: 'queued',
      message: 'Blast job created successfully'
    };
  }

  @Get('job/:id')
  async getJob(@Param('id') id: string) {
    const job = this.blastService.getJob(id);
    
    if (!job) {
      throw new BadRequestException('Job not found');
    }

    return {
      success: true,
      ...job
    };
  }

  @Get('jobs')
  async getAllJobs() {
    const jobs = this.blastService.getAllJobs();
    return {
      success: true,
      jobs,
      count: jobs.length
    };
  }

  @Get('members')
  async getMembers() {
    try {
      const members = await this.databaseService.getMembers();
      return {
        success: true,
        members,
        count: members.length
      };
    } catch (error) {
      return {
        success: true,
        members: [],
        count: 0,
        message: 'No members yet. Members are automatically added when blasts are successfully delivered.'
      };
    }
  }

  @Get('birthdays/upcoming')
  async getUpcomingBirthdays() {
    try {
      const birthdays = await this.databaseService.getUpcomingBirthdays(30);
      return {
        success: true,
        birthdays,
        count: birthdays.length
      };
    } catch (error) {
      return {
        success: true,
        birthdays: [],
        count: 0
      };
    }
  }

  @Post('birthday/send-now')
  async sendBirthdayMessagesNow() {
    try {
      await this.blastService.sendBirthdayMessages();
      return { 
        success: true, 
        message: 'Birthday messages sent successfully' 
      };
    } catch (error) {
      throw new BadRequestException('Failed to send birthday messages: ' + error.message);
    }
  }

  private extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}