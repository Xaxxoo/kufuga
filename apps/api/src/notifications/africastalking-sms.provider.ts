import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { config } from '../config';
import type { SmsProvider } from './sms.provider';

@Injectable()
export class AfricasTalkingSmsProvider implements SmsProvider {
  async sendSms(phone: string, message: string): Promise<{ providerMessageId?: string }> {
    if (!config.africasTalkingUsername || !config.africasTalkingApiKey) throw new InternalServerErrorException('Africa\'s Talking credentials are not configured');
    const body = new URLSearchParams({ username: config.africasTalkingUsername, to: phone, message });
    if (config.africasTalkingFrom) body.set('from', config.africasTalkingFrom);
    const response = await fetch('https://api.africastalking.com/version1/messaging', { method: 'POST', headers: { apiKey: config.africasTalkingApiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) throw new Error(`Africa's Talking returned HTTP ${response.status}`);
    const data = await response.json() as { SMSMessageData?: { Recipients?: Array<{ messageId?: string; status?: string }> } };
    const recipient = data.SMSMessageData?.Recipients?.[0];
    if (recipient?.status && recipient.status.toLowerCase() !== 'success') throw new Error(`Africa's Talking SMS status: ${recipient.status}`);
    return { providerMessageId: recipient?.messageId };
  }
}
