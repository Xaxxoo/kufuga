import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { AdminGuard, JwtAuthGuard } from './auth/auth.guard';
import { ProvisionDeviceDto } from './auth/dto';
import { DeviceEntity } from './database/entities';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(@InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>) {}
  @Post('devices') async provision(@Body() dto: ProvisionDeviceDto) {
    const mqttUsername = `device-${randomBytes(6).toString('hex')}`;
    const mqttPassword = randomBytes(18).toString('base64url');
    const device = await this.devices.save(this.devices.create({ ...dto, calibrationR0: dto.calibrationR0 ?? 10, mqttUsername, mqttPassword }));
    return { device: { id: device.id, farmId: device.farmId, label: device.label, simNumber: device.simNumber, country: device.country, calibrationR0: device.calibrationR0, createdAt: device.createdAt }, mqtt: { username: mqttUsername, password: mqttPassword } };
  }
}
