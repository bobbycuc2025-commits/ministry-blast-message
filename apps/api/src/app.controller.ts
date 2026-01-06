import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Ministry Messenger API',
      version: '1.0.0',
      endpoints: {
        blast: '/blast',
        health: '/health'
      }
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}