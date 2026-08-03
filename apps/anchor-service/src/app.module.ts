import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnchorWorkerService } from './anchor-worker.service.js';
import { DatabaseModule } from './database.module.js';
import { apiEntities } from '@kufuga/db';

@Module({ imports: [DatabaseModule, ScheduleModule.forRoot(), TypeOrmModule.forFeature(apiEntities)], providers: [AnchorWorkerService] })
export class AppModule {}
