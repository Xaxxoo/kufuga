import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { telemetryReadingSchema, type TelemetryReading } from '@kufuga/shared';
import mqtt, { type MqttClient } from 'mqtt';
import { Repository } from 'typeorm';
import { config } from './config';
import { DeviceEntity, ReadingEntity } from './database/entities';
import { AlertingService } from './notifications/alerting.service';

@Injectable()
export class MqttIngestService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttIngestService.name);
  private client?: MqttClient;
  private queue: Array<{ reading: TelemetryReading; device: DeviceEntity }> = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    private readonly alerting: AlertingService,
  ) {}

  onModuleInit(): void {
    this.client = mqtt.connect(config.mqttUrl, { clientId: config.mqttClientId, username: config.mqttUsername, password: config.mqttPassword, reconnectPeriod: 3000 });
    this.client.on('connect', () => this.client?.subscribe('farm/telemetry'));
    this.client.on('message', (_topic, payload) => { void this.receive(payload.toString()); });
    this.client.on('error', (error) => this.logger.warn(`MQTT: ${error.message}`));
    this.flushTimer = setInterval(() => { void this.flush(); }, 1000);
  }

  onModuleDestroy(): void { this.flushTimer && clearInterval(this.flushTimer); this.client?.end(); }

  private async receive(payload: string): Promise<void> {
    let input: unknown;
    try { input = JSON.parse(payload); } catch { this.logger.warn('Rejected non-JSON telemetry payload'); return; }
    const parsed = telemetryReadingSchema.safeParse(input);
    if (!parsed.success) { this.logger.warn(`Rejected invalid telemetry: ${parsed.error.message}`); return; }
    const device = await this.devices.findOne({ where: { id: parsed.data.deviceId }, relations: { farm: true } });
    if (!device) { this.logger.warn(`Rejected telemetry for unknown device ${parsed.data.deviceId}`); return; }
    this.queue.push({ reading: parsed.data, device });
    if (this.queue.length >= 100) await this.flush();
  }

  private async flush(): Promise<void> {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    const entities = batch.map(({ reading }) => {
      const entity = this.readings.create();
      Object.assign(entity, reading);
      return entity;
    });
    await this.readings.insert(entities);
    for (const { reading, device } of batch) await this.alerting.processReading(reading, device);
  }
}
