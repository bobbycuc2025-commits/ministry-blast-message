import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlastService } from './blast.service';
import { DatabaseService } from '../database/database.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class BirthdayScheduler {
  private readonly logger = new Logger(BirthdayScheduler.name);

  constructor(
    private blastService: BlastService,
    private databaseService: DatabaseService,
    private whatsappService: WhatsAppService
  ) {}

  // Run every day at 8:00 AM
  @Cron('0 8 * * *')
  async handleBirthdayMessages() {
    this.logger.log('Running birthday message scheduler...');
    
    try {
      await this.blastService.sendBirthdayMessages();
      this.logger.log('Birthday messages sent successfully');
    } catch (error) {
      this.logger.error('Failed to send birthday messages:', error);
    }
  }

  // Run every Sunday at 10:00 AM to send upcoming birthdays
  @Cron('0 10 * * 0')
  async handleWeeklyBirthdayReminders() {
    this.logger.log('Sending weekly birthday reminders...');
    
    try {
      const upcoming = await this.databaseService.getUpcomingBirthdays(7);
      
      if (upcoming.length === 0) {
        this.logger.log('No upcoming birthdays this week');
        return;
      }

      const message = this.createWeeklyBirthdayMessage(upcoming);
      
      // Send to church admins (get from settings)
      const admins = await this.getChurchAdmins();
      
      for (const admin of admins) {
        await this.whatsappService.sendMessage(admin.phone, message);
      }

      this.logger.log(`Weekly birthday reminder sent to ${admins.length} admins`);
    } catch (error) {
      this.logger.error('Failed to send weekly birthday reminders:', error);
    }
  }

  // Send anniversary messages on the 1st of every month
  @Cron('0 9 1 * *')
  async handleMonthlyAnniversaries() {
    this.logger.log('Checking for membership anniversaries...');
    
    try {
      const members = await this.databaseService.getMembers({ status: 'active' });
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      for (const member of members) {
        if (!member.join_date) continue;

        const joinDate = new Date(member.join_date);
        const joinMonth = joinDate.getMonth() + 1;
        const joinDay = joinDate.getDate();

        if (joinMonth === currentMonth && joinDay === currentDay) {
          const years = today.getFullYear() - joinDate.getFullYear();
          
          if (years > 0) {
            const message = `🎊 Happy ${years} Year${years > 1 ? 's' : ''} Anniversary ${member.name}! 🎊\n\n` +
              `It's been ${years} wonderful year${years > 1 ? 's' : ''} since you joined our church family. ` +
              `Thank you for being a faithful member and making our community stronger!\n\n` +
              `🙏 May God continue to bless you abundantly!`;

            await this.whatsappService.sendMessage(member.phone, message);
            this.logger.log(`Anniversary message sent to ${member.name} (${years} years)`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to send anniversary messages:', error);
    }
  }

  // Send attendance reminder every Saturday at 5:00 PM
  @Cron('0 17 * * 6')
  async handleWeekendServiceReminder() {
    this.logger.log('Sending weekend service reminder...');
    
    try {
      const members = await this.databaseService.getMembers({ status: 'active' });
      
      const message = `🔔 Service Reminder\n\n` +
        `Hello! This is a friendly reminder about our Sunday service tomorrow.\n\n` +
        `⏰ Time: 9:00 AM\n` +
        `📍 Location: Church Address\n\n` +
        `We look forward to worshipping with you!\n\n` +
        `🙏 God bless!`;

      for (const member of members) {
        try {
          await this.whatsappService.sendMessage(member.phone, message);
          await this.sleep(2000); // Rate limiting
        } catch (error) {
          this.logger.error(`Failed to send reminder to ${member.name}:`, error);
        }
      }

      this.logger.log(`Weekend service reminder sent to ${members.length} members`);
    } catch (error) {
      this.logger.error('Failed to send weekend service reminders:', error);
    }
  }

  // Send prayer request follow-ups (can be triggered manually)
  async sendPrayerFollowUp(memberPhone: string, prayerRequest: string) {
    const message = `💙 Prayer Follow-up\n\n` +
      `We've been keeping you in our prayers regarding: "${prayerRequest}"\n\n` +
      `We wanted to check in and see how things are going. ` +
      `If you'd like to share any updates or need continued prayer support, please let us know.\n\n` +
      `You're always in our thoughts and prayers! 🙏`;

    await this.whatsappService.sendMessage(memberPhone, message);
  }

  private createWeeklyBirthdayMessage(upcoming: any[]): string {
    let message = `🎂 Upcoming Birthdays This Week 🎂\n\n`;
    
    const groupedByDay = upcoming.reduce((acc, member) => {
      if (!acc[member.daysUntil]) {
        acc[member.daysUntil] = [];
      }
      acc[member.daysUntil].push(member);
      return acc;
    }, {});

    Object.keys(groupedByDay).sort((a, b) => Number(a) - Number(b)).forEach(days => {
      const dayText = days === '0' ? 'Today' : days === '1' ? 'Tomorrow' : `In ${days} days`;
      message += `${dayText}:\n`;
      groupedByDay[days].forEach(member => {
        message += `  • ${member.name} (${member.birthday})\n`;
      });
      message += '\n';
    });

    message += `Please remember to wish them a happy birthday! 🎉`;
    
    return message;
  }

  private async getChurchAdmins(): Promise<any[]> {
    // This should fetch from settings/database
    // For now, return hardcoded admins
    const members = await this.databaseService.getMembers();
    return members.filter(m => m.role === 'admin' || m.is_admin === 'true');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}