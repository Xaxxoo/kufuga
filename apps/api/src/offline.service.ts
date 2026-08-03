import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from './config';
import { DeviceEntity, ReadingEntity } from './database/entities';
import { AlertingService } from './notifications/alerting.service';

@Injectable()
export class OfflineService {
  private readonly logger = new Logger(OfflineService.name);
  constructor(
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    private readonly alerting: AlertingService,
  ) {}

  @Cron('*/5 * * * *')
  async flagOffline(): Promise<void> {
    const cutoff = Math.floor(Date.now() / 1000) - config.offlineAfterMinutes * 60;
    for (const device of await this.devices.find()) {
      if (device.createdAt.getTime() / 1000 >= cutoff) continue;
      const latest = await this.readings.findOne({ where: { deviceId: device.id }, order: { ts: 'DESC' } });
      if (latest && Number(latest.ts) >= cutoff) continue;
      await this.alerting.createSystemAlert(device, 'DEVICE_OFFLINE', config.offlineAfterMinutes);
    }
    this.logger.debug('Offline device scan complete');
  }
}
