import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './auth/auth.guard';
import { DeviceEntity, FarmEntity, PolicyEntity } from './database/entities';

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(
    @InjectRepository(PolicyEntity) private readonly policies: Repository<PolicyEntity>,
    @InjectRepository(FarmEntity) private readonly farms: Repository<FarmEntity>,
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
  ) {}

  @Get(':id/policies')
  async list(@Param('id') farmId: string) {
    await this.farms.findOneByOrFail({ id: farmId });
    const policies = await this.policies.find({ where: { farmId }, order: { createdAt: 'DESC' } });
    const devices = await this.devices.find({ where: { farmId }, select: ['id', 'label'] });
    const labels = new Map(devices.map((device) => [device.id, device.label]));
    return policies.map((policy) => ({ ...policy, deviceLabel: labels.get(policy.deviceId) ?? policy.deviceId }));
  }
}
