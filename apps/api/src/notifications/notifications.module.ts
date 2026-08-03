import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { AlertEntity, DeviceEntity, FarmEntity, SmsDeliveryEntity } from '../database/entities';
import { AfricasTalkingSmsProvider } from './africastalking-sms.provider';
import { ConsoleSmsProvider } from './console-sms.provider';
import { AlertingService } from './alerting.service';
import { SMS_PROVIDER } from './sms.provider';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEntity, SmsDeliveryEntity, DeviceEntity, FarmEntity])],
  providers: [ConsoleSmsProvider, AfricasTalkingSmsProvider, AlertingService, { provide: SMS_PROVIDER, inject: [ConsoleSmsProvider, AfricasTalkingSmsProvider], useFactory: (consoleProvider: ConsoleSmsProvider, africaProvider: AfricasTalkingSmsProvider) => config.smsProvider === 'africastalking' ? africaProvider : consoleProvider }],
  exports: [AlertingService],
})
export class NotificationsModule {}
