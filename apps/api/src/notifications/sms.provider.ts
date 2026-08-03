export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export interface SmsProvider {
  sendSms(phone: string, message: string): Promise<{ providerMessageId?: string }>;
}
