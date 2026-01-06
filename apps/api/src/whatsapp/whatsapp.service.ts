import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: Client;
  private isReady = false;
  private qrCode: string = '';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp:', error.message);
      this.logger.warn('⚠️  WhatsApp features disabled. Install Chrome or set CHROME_PATH in .env');
    }
  }

  private async initialize() {
    this.logger.log('🔄 Initializing WhatsApp Web...');

    // Try to find local Chrome installation
    const chromePath = this.findChromePath();
    
    const puppeteerConfig: any = {
      headless: this.configService.get('WHATSAPP_HEADLESS') !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    // Use local Chrome if found
    if (chromePath) {
      this.logger.log(`✅ Using Chrome at: ${chromePath}`);
      puppeteerConfig.executablePath = chromePath;
    } else {
      this.logger.log('⚠️  No local Chrome found, using Puppeteer Chromium');
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: puppeteerConfig
    });

    // QR Code event
    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      this.logger.log('');
      this.logger.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
      this.logger.log('');
      qrcode.generate(qr, { small: true });
      this.logger.log('');
      this.logger.log('💡 Open WhatsApp on your phone → Linked Devices → Link a Device');
      this.logger.log('');
    });

    // Loading event
    this.client.on('loading_screen', (percent) => {
      this.logger.log(`⏳ Loading WhatsApp... ${percent}%`);
    });

    // Authenticated event
    this.client.on('authenticated', () => {
      this.logger.log('✅ WhatsApp authenticated successfully!');
    });

    // Auth failure event
    this.client.on('auth_failure', (msg) => {
      this.logger.error('❌ WhatsApp authentication failed:', msg);
      this.logger.log('💡 Delete .wwebjs_auth folder and try again');
    });

    // Ready event
    this.client.on('ready', () => {
      this.isReady = true;
      this.logger.log('');
      this.logger.log('✅✅✅ WhatsApp is READY! You can now send messages. ✅✅✅');
      this.logger.log('');
    });

    // Disconnected event
    this.client.on('disconnected', (reason) => {
      this.logger.warn('⚠️ WhatsApp disconnected:', reason);
      this.isReady = false;
    });

    // Initialize client
    await this.client.initialize();
  }

  private findChromePath(): string | null {
    const { platform } = process;
    const possiblePaths = {
      win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
      ],
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ],
      linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ]
    };

    const fs = require('fs');
    const paths = possiblePaths[platform] || [];

    for (const path of paths) {
      if (path && fs.existsSync(path)) {
        return path;
      }
    }

    // Check environment variable
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
      return process.env.CHROME_PATH;
    }

    return null;
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready. Please scan QR code first.');
    }

    try {
      const formattedPhone = this.formatPhone(phone);
      const chatId = `${formattedPhone}@c.us`;
      
      await this.client.sendMessage(chatId, message);
      this.logger.log(`✅ Message sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send message to ${phone}:`, error.message);
      throw error;
    }
  }

  async sendMessageWithImage(phone: string, message: string, imageUrl: string): Promise<boolean> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      const formattedPhone = this.formatPhone(phone);
      const chatId = `${formattedPhone}@c.us`;
      
      await this.client.sendMessage(chatId, message);
      this.logger.log(`✅ Image message sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send image to ${phone}:`, error.message);
      throw error;
    }
  }

  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('234') && cleaned.length === 10) {
      cleaned = '234' + cleaned;
    }
    
    return cleaned;
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  getQRCode(): string {
    return this.qrCode;
  }

  async getStatus(): Promise<string> {
    if (!this.client) return 'Not initialized';
    if (!this.isReady) return 'Waiting for QR code scan';
    
    try {
      const state = await this.client.getState();
      return state || 'Connected';
    } catch (error) {
      return 'Error getting status';
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.logger.log('WhatsApp client disconnected');
    }
  }
}