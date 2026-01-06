import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import * as fs from 'fs';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    const spreadsheetId = this.configService.get('GOOGLE_SPREADSHEET_ID');
    const credentialsPath = this.configService.get('GOOGLE_CREDENTIALS_PATH');
    
    if (!spreadsheetId) {
      console.log('⚠️  GOOGLE_SPREADSHEET_ID not set - Database features disabled');
      console.log('   Add it to apps/api/.env to enable Google Sheets integration');
      return;
    }
    
    let credentials;
    
    try {
      if (credentialsPath && fs.existsSync(credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      } else if (this.configService.get('GOOGLE_CREDENTIALS')) {
        const base64Creds = this.configService.get('GOOGLE_CREDENTIALS');
        credentials = JSON.parse(Buffer.from(base64Creds, 'base64').toString());
      } else {
        console.log('⚠️  Google credentials not found - Database features disabled');
        console.log('   Add google-credentials.json to apps/api/config/');
        return;
      }
      
      await this.databaseService.initialize(credentials, spreadsheetId);
      
      // Try to access the sheet first before creating
      try {
        await this.databaseService.getData('Church Members');
        console.log('✅ Google Sheets connected successfully');
      } catch (error) {
        // Sheet doesn't exist, try to create it
        console.log('📝 Creating required sheets in Google Sheets...');
        await this.ensureRequiredSheets();
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize database:', error.message);
      console.log('');
      console.log('🔧 TO FIX GOOGLE SHEETS ERROR:');
      console.log('   1. Make sure you SHARED the spreadsheet with the service account email');
      console.log('   2. The service account email is in your google-credentials.json file');
      console.log('   3. Open your Google Sheet → Click Share → Add the email with Editor access');
      console.log('   4. Restart the server after sharing');
      console.log('');
      console.log('   OR manually create these sheets in your spreadsheet:');
      console.log('   - "Church Members" with headers: Name | Phone | Email | Birthday | Join Date | Status | Role | Notes');
      console.log('   - "Blast History" with headers: ID | Date | Time | Channel | Message | Total | Successful | Failed | Created By');
      console.log('');
    }
  }

  private async ensureRequiredSheets() {
    const sheets = ['Church Members', 'Blast History'];
    const headers = {
      'Church Members': ['Name', 'Phone', 'Email', 'Birthday', 'Join Date', 'Status', 'Role', 'Notes'],
      'Blast History': ['ID', 'Date', 'Time', 'Channel', 'Message', 'Total', 'Successful', 'Failed', 'Created By']
    };
    
    for (const sheetName of sheets) {
      try {
        await this.databaseService.getData(sheetName);
        console.log(`✅ Sheet "${sheetName}" already exists`);
      } catch (error) {
        console.log(`📝 Creating sheet: ${sheetName}`);
        try {
          await this.databaseService.createSheet(sheetName, headers[sheetName]);
          console.log(`✅ Created sheet: ${sheetName}`);
        } catch (createError) {
          console.error(`❌ Failed to create sheet "${sheetName}":`, createError.message);
          throw createError;
        }
      }
    }
  }
}