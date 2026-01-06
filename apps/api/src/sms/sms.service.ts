import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private provider: string;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get('SMS_PROVIDER') || 'termii';
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    if (this.provider === 'termii') {
      return this.sendViaTermii(phone, message);
    } else if (this.provider === 'twilio') {
      return this.sendViaTwilio(phone, message);
    } else {
      throw new Error(`Unknown SMS provider: ${this.provider}`);
    }
  }

  private async sendViaTermii(phone: string, message: string): Promise<boolean> {
    const apiKey = this.configService.get('TERMII_API_KEY');
    const senderId = this.configService.get('TERMII_SENDER_ID') || 'Ministry';

    if (!apiKey) {
      throw new Error('TERMII_API_KEY not configured');
    }

    try {
      const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to: this.formatPhone(phone),
        from: senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey
      });

      if (response.data.message === 'Successfully Sent') {
        this.logger.log(`SMS sent to ${phone} via Termii`);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to send SMS');
      }
    } catch (error) {
      this.logger.error(`Termii SMS failed for ${phone}:`, error.message);
      throw error;
    }
  }

  private async sendViaTwilio(phone: string, message: string): Promise<boolean> {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          To: this.formatPhone(phone),
          From: fromNumber,
          Body: message
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.status === 'queued' || response.data.status === 'sent') {
        this.logger.log(`SMS sent to ${phone} via Twilio`);
        return true;
      } else {
        throw new Error('Failed to send SMS via Twilio');
      }
    } catch (error) {
      this.logger.error(`Twilio SMS failed for ${phone}:`, error.message);
      throw error;
    }
  }

  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      // Add country code if needed (adjust for your country)
      if (!cleaned.startsWith('234') && cleaned.length === 10) {
        cleaned = '234' + cleaned;
      }
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  async getBalance(): Promise<any> {
    if (this.provider === 'termii') {
      return this.getTermiiBalance();
    } else if (this.provider === 'twilio') {
      return this.getTwilioBalance();
    }
    return { balance: 0, currency: 'N/A' };
  }

  private async getTermiiBalance(): Promise<any> {
    const apiKey = this.configService.get('TERMII_API_KEY');
    
    try {
      const response = await axios.get(
        `https://api.ng.termii.com/api/get-balance?api_key=${apiKey}`
      );
      return {
        balance: response.data.balance,
        currency: response.data.currency
      };
    } catch (error) {
      this.logger.error('Failed to get Termii balance:', error);
      return { balance: 0, currency: 'NGN' };
    }
  }

  private async getTwilioBalance(): Promise<any> {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      const response = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      return {
        balance: response.data.balance,
        currency: response.data.currency
      };
    } catch (error) {
      this.logger.error('Failed to get Twilio balance:', error);
      return { balance: 0, currency: 'USD' };
    }
  }
}