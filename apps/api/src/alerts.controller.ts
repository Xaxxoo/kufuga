import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './auth/auth.guard';
import { AlertEntity } from './database/entities';
import { SinceQueryDto } from './api.dto';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(@InjectRepository(AlertEntity) private readonly alerts: Repository<AlertEntity>) {}
  @Get() list(@Query() query: SinceQueryDto) {
    const since = Number(query.since ?? 0);
    return this.alerts.createQueryBuilder('a').where('a.ts >= :since', { since }).orderBy('a.ts', 'DESC').getMany();
  }
  @Post(':id/ack') async acknowledge(@Param('id') id: string) {
    await this.alerts.update(id, { acknowledged: true });
    return this.alerts.findOneByOrFail({ id });
  }
}
