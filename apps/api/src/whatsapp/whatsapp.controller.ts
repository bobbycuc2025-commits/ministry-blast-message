import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private whatsappService: WhatsAppService) {}

  @Get('status')
  async getStatus() {
    const status = await this.whatsappService.getStatus();
    const isReady = this.whatsappService.isClientReady();
    const qrCode = this.whatsappService.getQRCode();

    return {
      success: true,
      status,
      isReady,
      qrCode: qrCode || null,
      message: isReady 
        ? 'WhatsApp is connected and ready' 
        : qrCode 
          ? 'Please scan QR code to connect'
          : 'Initializing WhatsApp...'
    };
  }

  @Post('disconnect')
  async disconnect() {
    await this.whatsappService.disconnect();
    return {
      success: true,
      message: 'WhatsApp disconnected successfully'
    };
  }

  @Get('qr')
  async getQRCode() {
    const qrCode = this.whatsappService.getQRCode();
    const isReady = this.whatsappService.isClientReady();

    if (isReady) {
      return {
        success: true,
        connected: true,
        message: 'WhatsApp is already connected'
      };
    }

    if (!qrCode) {
      return {
        success: false,
        message: 'QR code not available yet. Please wait...'
      };
    }

    return {
      success: true,
      connected: false,
      qrCode,
      message: 'Scan this QR code with WhatsApp on your phone'
    };
  }
}