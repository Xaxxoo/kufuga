import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config';
import { apiEntities } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  entities: apiEntities,
  migrations: ['src/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
