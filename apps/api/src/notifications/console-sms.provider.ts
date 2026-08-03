import { Injectable, Logger } from '@nestjs/common';
import type { SmsProvider } from './sms.provider';

@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);
  async sendSms(phone: string, message: string): Promise<{ providerMessageId?: string }> {
    this.logger.log(`SMS to ${phone}: ${message}`);
    return { providerMessageId: `console-${Date.now()}` };
  }
}
