import { randomBytes, pbkdf2Sync } from 'crypto';

export class PhoneUtils {
  static formatNigerianPhone(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle various formats
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      // 08012345678 -> +2348012345678
      return `+234${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('234') && cleaned.length === 13) {
      // 2348012345678 -> +2348012345678
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+234') && cleaned.length === 14) {
      // Already formatted
      return cleaned;
    } else if (cleaned.length === 10 && !cleaned.startsWith('0')) {
      // 8012345678 -> +2348012345678
      return `+234${cleaned}`;
    }
    
    // Return as is if we can't format
    return phone;
  }

  static validateNigerianPhone(phone: string): boolean {
    const formatted = this.formatNigerianPhone(phone);
    // Validate Nigerian phone number pattern
    const nigeriaRegex = /^\+234[7-9][0-1]\d{8}$/;
    return nigeriaRegex.test(formatted);
  }

  static extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(\+?234[7-9][0-1]\d{8}|0[7-9][0-1]\d{8})/g;
    const matches = text.match(phoneRegex) || [];
    return [...new Set(matches.map(p => this.formatNigerianPhone(p)))];
  }
}

export class SecurityUtils {
  static generateSalt(length = 32): string {
    return randomBytes(length).toString('hex');
  }

  static hashPassword(password: string, salt: string): string {
    return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  static generateRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateId(): string {
    return randomBytes(16).toString('hex');
  }
}

export class DelayUtils {
  static async randomDelay(minMs = 5000, maxMs = 15000): Promise<void> {
    const delay = SecurityUtils.generateRandomDelay(minMs, maxMs);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  static async progressiveDelay(baseDelay: number, multiplier: number, attempt: number): Promise<void> {
    const delay = baseDelay * Math.pow(multiplier, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}