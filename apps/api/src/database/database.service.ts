import { Injectable, Logger } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private sheets: sheets_v4.Sheets;
  private auth: JWT;
  private spreadsheetId: string;

  async initialize(credentials: any, spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    
    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.logger.log('Google Sheets Database initialized');
  }

  async createSheet(title: string, headers: string[]) {
    const request = {
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: { title }
            }
          }
        ]
      }
    };

    await this.sheets.spreadsheets.batchUpdate(request);
    await this.appendData(title, [headers]);
  }

  async appendData(sheetName: string, data: any[][]) {
    const range = `${sheetName}!A:Z`;
    
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: data }
    });
  }

  async getData(sheetName: string, range?: string): Promise<any[][]> {
    const fullRange = range || `${sheetName}!A:Z`;
    
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: fullRange
    });

    return response.data.values || [];
  }

  async updateData(sheetName: string, range: string, data: any[][]) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: data }
    });
  }

  async findRow(sheetName: string, searchColumn: number, searchValue: string): Promise<number | null> {
    const data = await this.getData(sheetName);
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][searchColumn] === searchValue) {
        return i + 1; // Sheet rows are 1-indexed
      }
    }
    
    return null;
  }

  async upsertMember(member: {
    name: string;
    phone: string;
    email?: string;
    birthday?: string;
    joinDate?: string;
    status: string;
  }) {
    const sheetName = 'Church Members';
    const existingRow = await this.findRow(sheetName, 1, member.phone);

    const rowData = [
      member.name,
      member.phone,
      member.email || '',
      member.birthday || '',
      member.joinDate || new Date().toISOString().split('T')[0],
      member.status
    ];

    if (existingRow) {
      await this.updateData(sheetName, `A${existingRow}:F${existingRow}`, [rowData]);
    } else {
      await this.appendData(sheetName, [rowData]);
    }
  }

  async getUpcomingBirthdays(days: number = 7): Promise<any[]> {
    const data = await this.getData('Church Members');
    const headers = data[0];
    const birthdayIndex = headers.indexOf('Birthday');
    
    if (birthdayIndex === -1) return [];

    const today = new Date();
    const upcoming = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const birthday = row[birthdayIndex];
      
      if (!birthday) continue;

      const [month, day] = birthday.split('-').map(Number);
      const thisYear = new Date(today.getFullYear(), month - 1, day);
      const nextYear = new Date(today.getFullYear() + 1, month - 1, day);
      
      const nextBirthday = thisYear >= today ? thisYear : nextYear;
      const daysUntil = Math.floor((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil >= 0 && daysUntil <= days) {
        upcoming.push({
          name: row[0],
          phone: row[1],
          email: row[2],
          birthday: birthday,
          daysUntil
        });
      }
    }

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  async getMembers(filter?: { status?: string }): Promise<any[]> {
    const data = await this.getData('Church Members');
    if (data.length === 0) return [];

    const headers = data[0];
    const members = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const member: any = {};
      
      headers.forEach((header, idx) => {
        member[header.toLowerCase().replace(' ', '_')] = row[idx] || '';
      });

      if (!filter || !filter.status || member.status === filter.status) {
        members.push(member);
      }
    }

    return members;
  }
}