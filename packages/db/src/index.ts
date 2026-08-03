import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

const unixTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('farms')
export class FarmEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('varchar') ownerName!: string;
  @Column('varchar') phone!: string;
  @Column('varchar') region!: string;
  @Column('integer') flockSize!: number;
  @Column({ type: 'varchar' }) birdType!: 'broiler' | 'layer';
  @OneToMany(() => DeviceEntity, (device) => device.farm) devices!: DeviceEntity[];
  @CreateDateColumn() createdAt!: Date;
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', unique: true }) phone!: string;
  @Column('varchar') pinHash!: string;
  @Column({ type: 'varchar', default: 'farmer' }) role!: 'farmer' | 'admin';
  @Column({ type: 'uuid', nullable: true }) farmId!: string | null;
  @Column({ type: 'varchar', nullable: true }) pushToken!: string | null;
  @Column({ type: 'varchar', nullable: true }) pushPlatform!: 'ios' | 'android' | null;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') farmId!: string;
  @ManyToOne(() => FarmEntity, (farm) => farm.devices, { onDelete: 'CASCADE' }) farm!: FarmEntity;
  @Column('varchar') label!: string;
  @Column('varchar') simNumber!: string;
  @Column({ type: 'varchar' }) country!: 'KE' | 'GH';
  @Column('double precision') calibrationR0!: number;
  @Column('varchar') mqttUsername!: string;
  @Column('varchar') mqttPassword!: string;
  @CreateDateColumn() createdAt!: Date;
  @OneToMany(() => ReadingEntity, (reading) => reading.device) readings!: ReadingEntity[];
  @OneToMany(() => AlertEntity, (alert) => alert.device) alerts!: AlertEntity[];
}

@Entity('readings')
@Index('IDX_readings_device_ts', ['deviceId', 'ts'])
export class ReadingEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') deviceId!: string;
  @ManyToOne(() => DeviceEntity, (device) => device.readings, { onDelete: 'CASCADE' }) device!: DeviceEntity;
  @Column('bigint', { transformer: unixTransformer }) ts!: number;
  @Column('double precision') tempC!: number;
  @Column('double precision') humidityPct!: number;
  @Column('double precision') nh3Ppm!: number;
  @Column('boolean') alert!: boolean;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('alerts')
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') deviceId!: string;
  @ManyToOne(() => DeviceEntity, (device) => device.alerts, { onDelete: 'CASCADE' }) device!: DeviceEntity;
  @Column('bigint', { transformer: unixTransformer }) ts!: number;
  @Column({ type: 'varchar' }) kind!: 'NH3_DANGER' | 'TEMP_HIGH' | 'TEMP_LOW' | 'HUMIDITY_HIGH' | 'DEVICE_OFFLINE';
  @Column('double precision') value!: number;
  @Column({ type: 'boolean', default: false }) acknowledged!: boolean;
  @Column({ type: 'timestamptz', nullable: true }) escalatedAt!: Date | null;
  @OneToMany(() => SmsDeliveryEntity, (delivery) => delivery.alert) deliveries!: SmsDeliveryEntity[];
}

@Entity('sms_deliveries')
export class SmsDeliveryEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', nullable: true }) alertId!: string | null;
  @ManyToOne(() => AlertEntity, (alert) => alert.deliveries, { nullable: true, onDelete: 'CASCADE' }) alert!: AlertEntity | null;
  @Column({ type: 'uuid', nullable: true }) farmId!: string | null;
  @Column('varchar') phone!: string;
  @Column({ type: 'varchar' }) deliveryType!: 'initial' | 'escalation' | 'digest';
  @Column({ type: 'varchar', default: 'pending' }) status!: 'pending' | 'sent' | 'failed';
  @Column('text') message!: string;
  @Column({ type: 'timestamptz', nullable: true }) sentAt!: Date | null;
  @Column({ type: 'text', nullable: true }) error!: string | null;
  @Column({ type: 'integer', default: 0 }) attempts!: number;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('anchor_batches')
@Index('UQ_anchor_batches_device_period', ['deviceId', 'periodStart'], { unique: true })
export class AnchorBatchEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') deviceId!: string;
  @Column('bigint', { transformer: unixTransformer }) periodStart!: number;
  @Column('bigint', { transformer: unixTransformer }) periodEnd!: number;
  @Column('integer') readingCount!: number;
  @Column({ type: 'varchar', length: 64 }) sha256!: string;
  @Column('varchar') stellarTxHash!: string;
  @Column('varchar') ledger!: string;
  @Column({ type: 'bigint', transformer: unixTransformer }) anchoredAt!: number;
}

export const apiEntities = [FarmEntity, UserEntity, DeviceEntity, ReadingEntity, AlertEntity, SmsDeliveryEntity, AnchorBatchEntity];
