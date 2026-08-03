import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnchorBatchEntity, AlertEntity, DeviceEntity, FarmEntity, PolicyEntity, ReadingEntity } from './database/entities';
import { AnchorVerificationService } from './anchor-verification.service';

@Controller('public/investors')
export class PublicInvestorController {
  constructor(@InjectRepository(FarmEntity) private readonly farms: Repository<FarmEntity>, @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>, @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>, @InjectRepository(AlertEntity) private readonly alerts: Repository<AlertEntity>, @InjectRepository(AnchorBatchEntity) private readonly anchors: Repository<AnchorBatchEntity>, @InjectRepository(PolicyEntity) private readonly policies: Repository<PolicyEntity>, private readonly verification: AnchorVerificationService) {}
  @Get('portfolio') async portfolio() {
    const now = Math.floor(Date.now() / 1000); const since = now - 30 * 86400; const farms = await this.farms.find({ relations: { devices: true } });
    return Promise.all(farms.map(async (farm, index) => { const deviceIds = farm.devices.map((device) => device.id); const readings = deviceIds.length ? await this.readings.createQueryBuilder('r').where('r.deviceId IN (:...ids)', { ids: deviceIds }).andWhere('r.ts >= :since', { since }).getMany() : []; const anchors = deviceIds.length ? await this.anchors.createQueryBuilder('a').where('a.deviceId IN (:...ids)', { ids: deviceIds }).getMany() : []; const alertCount = deviceIds.length ? await this.alerts.createQueryBuilder('a').where('a.deviceId IN (:...ids)', { ids: deviceIds }).andWhere('a.ts >= :since', { since }).getCount() : 0; const policies = await this.policies.find({ where: { farmId: farm.id }, select: ['id', 'peril', 'threshold', 'consecutivePeriods', 'payoutAmount', 'status'] }); return { id: `farm-${index + 1}`, region: farm.region, birdType: farm.birdType, flockSize: farm.flockSize, uptimePct: deviceIds.length ? Math.round((new Set(readings.map((reading) => reading.deviceId)).size / deviceIds.length) * 100) : 0, compliancePct: readings.length ? Math.round((readings.filter((reading) => !reading.alert).length / readings.length) * 100) : 0, alertCount, verifiedDays: anchors.length ? Math.min(30, Math.ceil((now - Math.min(...anchors.map((anchor) => anchor.periodStart))) / 86400)) : 0, policies }; }));
  }
  @Get('anchors') async anchorList() { return this.anchors.find({ order: { periodStart: 'DESC' }, take: 100 }); }
  @Get('anchors/:batchId/verify') async verify(@Param('batchId') batchId: string) { const batch = await this.anchors.findOneBy({ id: batchId }); return batch ? this.verification.verify(batch.deviceId, batch.id) : { verified: false, txUrl: '' }; }
}
