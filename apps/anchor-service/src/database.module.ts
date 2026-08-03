import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config.js';
import { apiEntities } from '@kufuga/db';

@Module({
  imports: [TypeOrmModule.forRoot({ type: 'postgres', url: config.databaseUrl, entities: apiEntities, synchronize: false }), TypeOrmModule.forFeature(apiEntities)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
