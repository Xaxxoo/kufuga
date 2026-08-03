import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminGuard, JwtAuthGuard } from './auth/auth.guard';
import { AlertEntity, DeviceEntity, FarmEntity, ReadingEntity } from './database/entities';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReadController {
  constructor(@InjectRepository(FarmEntity) private readonly farms: Repository<FarmEntity>, @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>, @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>, @InjectRepository(AlertEntity) private readonly alerts: Repository<AlertEntity>) {}
  @Get('farms') async farmsList() { return this.farms.find({ relations: { devices: true }, order: { createdAt: 'DESC' } }); }
  @Get('fleet') async fleet() {
    const devices = await this.devices.find({ relations: { farm: true } });
    return Promise.all(devices.map(async (device) => ({ device: { id: device.id, farmId: device.farmId, label: device.label, country: device.country }, farm: { id: device.farm.id, region: device.farm.region }, latest: await this.readings.findOne({ where: { deviceId: device.id }, order: { ts: 'DESC' } }), alertCount: await this.alerts.count({ where: { deviceId: device.id, acknowledged: false } }) })));
  }
}
