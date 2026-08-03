import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { evaluateReading, type Alert, type TelemetryReading } from '@kufuga/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, IsNull, Repository } from 'typeorm';
import { config } from '../config';
import { AlertEntity, DeviceEntity, FarmEntity, ReadingEntity, SmsDeliveryEntity } from '../database/entities';
import { SMS_PROVIDER, type SmsProvider } from './sms.provider';

const COOLDOWN_SECONDS = 60 * 60;

@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);

  constructor(
    @InjectRepository(AlertEntity) private readonly alerts: Repository<AlertEntity>,
    @InjectRepository(SmsDeliveryEntity) private readonly deliveries: Repository<SmsDeliveryEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(FarmEntity) private readonly farms: Repository<FarmEntity>,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
  ) {}

  async processReading(reading: TelemetryReading, device: DeviceEntity): Promise<void> {
    const candidates = evaluateReading(reading, device.farm.birdType, 1);
    for (const candidate of candidates) await this.createIfOutsideCooldown(candidate, device);
  }

  async createSystemAlert(device: DeviceEntity, kind: Alert['kind'], value: number, ts = Math.floor(Date.now() / 1000)): Promise<void> {
    await this.createIfOutsideCooldown({ id: '', deviceId: device.id, ts, kind, value, acknowledged: false }, device);
  }

  private async createIfOutsideCooldown(candidate: Alert, device: DeviceEntity): Promise<void> {
    const existing = await this.alerts.findOne({ where: { deviceId: device.id, kind: candidate.kind, ts: MoreThanOrEqual(candidate.ts - COOLDOWN_SECONDS) } });
    if (existing) return;
    const alert = this.alerts.create({ deviceId: device.id, ts: candidate.ts, kind: candidate.kind, value: candidate.value, acknowledged: false, escalatedAt: null });
    const saved = await this.alerts.save(alert);
    await this.dispatch(saved, device, 'initial');
  }

  private messageFor(device: DeviceEntity, kind: Alert['kind'], value: number, escalation = false): string {
    const prefix = escalation ? 'ESCALATION ' : '';
    const condition = { NH3_DANGER: 'Ammonia high', TEMP_HIGH: 'Temperature high', TEMP_LOW: 'Temperature low', HUMIDITY_HIGH: 'Humidity high', DEVICE_OFFLINE: 'Device offline' }[kind];
    const formatted = kind === 'NH3_DANGER' ? `${value.toFixed(0)}ppm` : kind === 'DEVICE_OFFLINE' ? `${value.toFixed(0)}min` : `${value.toFixed(1)}${kind.startsWith('HUMIDITY') ? '%' : 'C'}`;
    const action = kind === 'NH3_DANGER' ? 'Open ventilation and turn litter.' : kind === 'DEVICE_OFFLINE' ? 'Check power and network.' : 'Inspect the house environment.';
    return `${prefix}ALERT ${device.label}: ${condition} (${formatted}). ${action}`;
  }

  private async dispatch(alert: AlertEntity, device: DeviceEntity, deliveryType: 'initial' | 'escalation'): Promise<void> {
    const message = this.messageFor(device, alert.kind, alert.value, deliveryType === 'escalation');
    const delivery = await this.deliveries.save(this.deliveries.create({ alertId: alert.id, alert, farmId: device.farmId, phone: device.farm.phone, deliveryType, status: 'pending', message, sentAt: null, error: null, attempts: 0 }));
    try {
      await this.sms.sendSms(device.farm.phone, message);
      await this.deliveries.update(delivery.id, { status: 'sent', sentAt: new Date(), attempts: 1 });
    } catch (error) {
      await this.deliveries.update(delivery.id, { status: 'failed', error: error instanceof Error ? error.message : String(error), attempts: 1 });
      this.logger.error(`SMS delivery failed for ${alert.id}`);
    }
  }

  @Cron('*/5 * * * *')
  async escalateUnacknowledged(): Promise<void> {
    const cutoff = Math.floor(Date.now() / 1000) - 30 * 60;
    const candidates = await this.alerts.find({ where: { acknowledged: false, escalatedAt: IsNull() }, relations: { device: { farm: true } } });
    for (const alert of candidates) {
      if (alert.ts > cutoff || alert.kind === 'DEVICE_OFFLINE') continue;
      await this.alerts.update(alert.id, { escalatedAt: new Date() });
      await this.dispatch(alert, alert.device, 'escalation');
    }
  }

  @Cron('0 21 * * *')
  async sendNightlyDigests(): Promise<void> {
    const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    for (const farm of await this.farms.find({ relations: { devices: true } })) {
      const deviceIds = farm.devices.map((device) => device.id);
      if (!deviceIds.length) continue;
      const summary = await this.readings.createQueryBuilder('r').select('AVG(r.tempC)', 'avgTemp').addSelect('MAX(r.nh3Ppm)', 'maxNh3').where('r.deviceId IN (:...deviceIds)', { deviceIds }).andWhere('r.ts >= :since', { since }).getRawOne<{ avgTemp: string | null; maxNh3: string | null }>();
      const alertCount = await this.alerts.createQueryBuilder('a').where('a.deviceId IN (:...deviceIds)', { deviceIds }).andWhere('a.ts >= :since', { since }).getCount();
      const message = `Kufuga ${farm.ownerName}: avg temp ${Number(summary?.avgTemp ?? 0).toFixed(1)}C, max NH3 ${Number(summary?.maxNh3 ?? 0).toFixed(0)}ppm, ${alertCount} alert(s).`;
      const delivery = await this.deliveries.save(this.deliveries.create({ alertId: null, alert: null, farmId: farm.id, phone: farm.phone, deliveryType: 'digest', status: 'pending', message, sentAt: null, error: null, attempts: 0 }));
      try {
        await this.sms.sendSms(farm.phone, message);
        await this.deliveries.update(delivery.id, { status: 'sent', sentAt: new Date(), attempts: 1 });
      } catch (error) {
        await this.deliveries.update(delivery.id, { status: 'failed', error: error instanceof Error ? error.message : String(error), attempts: 1 });
      }
    }
  }
}
