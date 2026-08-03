import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { AlertingService } from '../notifications/alerting.service';
import type { SmsProvider } from '../notifications/sms.provider';
import type { AlertEntity, DeviceEntity, FarmEntity, ReadingEntity, SmsDeliveryEntity } from '../database/entities';

class MemoryRepository<T extends { id?: string }> {
  readonly rows: T[] = [];
  create(value: Partial<T> = {}): T { return { ...value } as T; }
  async findOne(options: { where: Record<string, unknown> }): Promise<T | null> {
    return this.rows.find((row) => Object.entries(options.where).every(([key, condition]) => {
      const value = (row as Record<string, unknown>)[key];
      if (condition && typeof condition === 'object' && '_value' in condition) return Number(value) >= Number((condition as { _value: number })._value);
      return value === condition;
    })) ?? null;
  }
  async save(value: T): Promise<T> {
    if (!value.id) value.id = `id-${this.rows.length + 1}`;
    this.rows.push(value);
    return value;
  }
  async update(id: string, changes: Partial<T>): Promise<void> {
    const row = this.rows.find((candidate) => candidate.id === id);
    if (row) Object.assign(row, changes);
  }
}

describe('heatwave alerting integration', () => {
  it('sends exactly one TEMP_HIGH SMS per house in each cooldown window', async () => {
    const alerts = new MemoryRepository<AlertEntity>();
    const deliveries = new MemoryRepository<SmsDeliveryEntity>();
    const sms: SmsProvider & { messages: Array<{ phone: string; message: string }> } = {
      messages: [],
      async sendSms(phone, message) { this.messages.push({ phone, message }); return {}; },
    };
    const service = new AlertingService(
      alerts as never,
      deliveries as never,
      new MemoryRepository<ReadingEntity>() as never,
      new MemoryRepository<DeviceEntity>() as never,
      new MemoryRepository<FarmEntity>() as never,
      sms,
    );
    const devices = [1, 2].map((house) => ({
      id: `sim-device-${house}`,
      label: `House ${house}`,
      farmId: `farm-${house}`,
      farm: { birdType: 'broiler', phone: `+25470000000${house}` },
    } as DeviceEntity));

    for (const device of devices) {
      for (const ts of [0, 1800, 3601, 5400]) {
        await service.processReading({ deviceId: device.id, ts, tempC: 40, humidityPct: 80, nh3Ppm: 30, alert: true }, device);
      }
    }

    const tempMessages = sms.messages.filter(({ message }) => message.includes('Temperature high'));
    expect(tempMessages).toHaveLength(4);
    for (const device of devices) {
      expect(tempMessages.filter(({ message }) => message.includes(device.label))).toHaveLength(2);
    }
  });
});
