import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { DeviceEntity, FarmEntity, ReadingEntity } from '../database/entities';

describe('API PostgreSQL integration', () => {
  let dataSource: DataSource;
  let farm: FarmEntity;
  let device: DeviceEntity;

  beforeAll(async () => {
    dataSource = AppDataSource;
    await dataSource.initialize();
    await dataSource.runMigrations();
    farm = await dataSource.getRepository(FarmEntity).save({ ownerName: 'Test Farmer', phone: '+254700000001', region: 'Nairobi', flockSize: 100, birdType: 'broiler' });
    device = await dataSource.getRepository(DeviceEntity).save({ farmId: farm.id, label: 'Test Node', simNumber: '+254700000002', country: 'KE', calibrationR0: 10, mqttUsername: 'test-user', mqttPassword: 'test-pass' });
  });

  afterAll(async () => { if (dataSource?.isInitialized) await dataSource.destroy(); });

  it('stores telemetry and reads latest data through the composite query path', async () => {
    const repository = dataSource.getRepository(ReadingEntity);
    await repository.insert([
      { deviceId: device.id, ts: 1700000000, tempC: 25, humidityPct: 60, nh3Ppm: 5, alert: false },
      { deviceId: device.id, ts: 1700000300, tempC: 26, humidityPct: 61, nh3Ppm: 6, alert: false },
    ]);
    const latest = await repository.findOne({ where: { deviceId: device.id }, order: { ts: 'DESC' } });
    expect(latest?.ts).toBe(1700000300);
    const grouped = await repository.createQueryBuilder('r').select('FLOOR(r.ts / 3600) * 3600', 'ts').addSelect('AVG(r.tempC)', 'tempC').where('r.deviceId = :id', { id: device.id }).groupBy('FLOOR(r.ts / 3600)').getRawMany();
    expect(grouped).toHaveLength(1);
    expect(Number(grouped[0].tempC)).toBe(25.5);
  });
});
