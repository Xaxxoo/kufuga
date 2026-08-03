import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './auth/auth.guard';
import { AnchorBatchEntity, DeviceEntity, ReadingEntity } from './database/entities';
import { ReadingsQueryDto } from './api.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    @InjectRepository(AnchorBatchEntity) private readonly anchors: Repository<AnchorBatchEntity>,
  ) {}

  @Get(':id/readings')
  async readingsFor(@Param('id') id: string, @Query() query: ReadingsQueryDto) {
    const from = Number(query.from ?? 0);
    const to = Number(query.to ?? Math.floor(Date.now() / 1000));
    if (query.resolution === 'raw') return this.readings.createQueryBuilder('r').where('r.deviceId = :id', { id }).andWhere('r.ts BETWEEN :from AND :to', { from, to }).orderBy('r.ts', 'ASC').getMany();
    const bucket = query.resolution === 'day' ? 86400 : 3600;
    return this.readings.createQueryBuilder('r').select(`FLOOR(r.ts / :bucket) * :bucket`, 'ts').addSelect('AVG(r.tempC)', 'tempC').addSelect('AVG(r.humidityPct)', 'humidityPct').addSelect('AVG(r.nh3Ppm)', 'nh3Ppm').addSelect('COUNT(*)', 'readingCount').where('r.deviceId = :id', { id }).andWhere('r.ts BETWEEN :from AND :to', { from, to }).setParameter('bucket', bucket).groupBy('FLOOR(r.ts / :bucket)').orderBy('ts', 'ASC').getRawMany();
  }

  @Get(':id/latest')
  latest(@Param('id') id: string) { return this.readings.findOne({ where: { deviceId: id }, order: { ts: 'DESC' } }); }

  @Get(':id/anchors')
  anchorsFor(@Param('id') id: string) { return this.anchors.find({ where: { deviceId: id }, order: { periodStart: 'DESC' } }); }
}
