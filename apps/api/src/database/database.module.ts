import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { apiEntities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: apiEntities,
      synchronize: false,
      autoLoadEntities: false,
    }),
    TypeOrmModule.forFeature(apiEntities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
