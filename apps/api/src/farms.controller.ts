import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './auth/auth.guard';
import { DeviceEntity } from './database/entities';

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmsController {
  constructor(@InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>) {}
  @Get(':id/devices') getDevices(@Param('id') id: string) {
    return this.devices.find({ where: { farmId: id }, select: ['id', 'farmId', 'label', 'simNumber', 'country', 'calibrationR0', 'createdAt'] });
  }
}
