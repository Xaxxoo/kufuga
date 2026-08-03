import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { config } from './config';
import { AlertEntity, DeviceEntity, ReadingEntity } from './database/entities';

@Injectable()
export class OfflineService {
  private readonly logger = new Logger(OfflineService.name);
  constructor(
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    @InjectRepository(AlertEntity) private readonly alerts: Repository<AlertEntity>,
  ) {}

  @Cron('*/5 * * * *')
  async flagOffline(): Promise<void> {
    const cutoff = Math.floor(Date.now() / 1000) - config.offlineAfterMinutes * 60;
    for (const device of await this.devices.find()) {
      if (device.createdAt.getTime() / 1000 >= cutoff) continue;
      const latest = await this.readings.findOne({ where: { deviceId: device.id }, order: { ts: 'DESC' } });
      if (latest && Number(latest.ts) >= cutoff) continue;
      const existing = await this.alerts.findOne({ where: { deviceId: device.id, kind: 'DEVICE_OFFLINE', acknowledged: false, ts: MoreThanOrEqual(cutoff) } });
      if (!existing) await this.alerts.save(this.alerts.create({ deviceId: device.id, ts: Math.floor(Date.now() / 1000), kind: 'DEVICE_OFFLINE', value: config.offlineAfterMinutes, acknowledged: false }));
    }
    this.logger.debug('Offline device scan complete');
  }
}
