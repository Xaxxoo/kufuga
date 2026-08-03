import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const unixTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('farms')
export class FarmEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() ownerName!: string;
  @Column() phone!: string;
  @Column() region!: string;
  @Column('integer') flockSize!: number;
  @Column({ type: 'varchar' }) birdType!: 'broiler' | 'layer';
  @OneToMany(() => DeviceEntity, (device) => device.farm) devices!: DeviceEntity[];
  @CreateDateColumn() createdAt!: Date;
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) phone!: string;
  @Column() pinHash!: string;
  @Column({ type: 'varchar', default: 'farmer' }) role!: 'farmer' | 'admin';
  @Column({ nullable: true }) farmId!: string | null;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() farmId!: string;
  @ManyToOne(() => FarmEntity, (farm) => farm.devices, { onDelete: 'CASCADE' }) farm!: FarmEntity;
  @Column() label!: string;
  @Column() simNumber!: string;
  @Column({ type: 'varchar' }) country!: 'KE' | 'GH';
  @Column('double precision') calibrationR0!: number;
  @Column() mqttUsername!: string;
  @Column() mqttPassword!: string;
  @CreateDateColumn() createdAt!: Date;
  @OneToMany(() => ReadingEntity, (reading) => reading.device) readings!: ReadingEntity[];
  @OneToMany(() => AlertEntity, (alert) => alert.device) alerts!: AlertEntity[];
}

@Entity('readings')
@Index('IDX_readings_device_ts', ['deviceId', 'ts'])
export class ReadingEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() deviceId!: string;
  @ManyToOne(() => DeviceEntity, (device) => device.readings, { onDelete: 'CASCADE' }) device!: DeviceEntity;
  @Column('bigint', { transformer: unixTransformer }) ts!: number;
  @Column('double precision') tempC!: number;
  @Column('double precision') humidityPct!: number;
  @Column('double precision') nh3Ppm!: number;
  @Column() alert!: boolean;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('alerts')
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() deviceId!: string;
  @ManyToOne(() => DeviceEntity, (device) => device.alerts, { onDelete: 'CASCADE' }) device!: DeviceEntity;
  @Column('bigint', { transformer: unixTransformer }) ts!: number;
  @Column({ type: 'varchar' }) kind!: 'NH3_DANGER' | 'TEMP_HIGH' | 'TEMP_LOW' | 'HUMIDITY_HIGH' | 'DEVICE_OFFLINE';
  @Column('double precision') value!: number;
  @Column({ default: false }) acknowledged!: boolean;
}

@Entity('anchor_batches')
export class AnchorBatchEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() deviceId!: string;
  @Column('bigint', { transformer: unixTransformer }) periodStart!: number;
  @Column('bigint', { transformer: unixTransformer }) periodEnd!: number;
  @Column('integer') readingCount!: number;
  @Column({ length: 64 }) sha256!: string;
  @Column() stellarTxHash!: string;
  @Column() ledger!: string;
  @Column({ type: 'bigint', transformer: unixTransformer }) anchoredAt!: number;
}

export const apiEntities = [FarmEntity, UserEntity, DeviceEntity, ReadingEntity, AlertEntity, AnchorBatchEntity];
