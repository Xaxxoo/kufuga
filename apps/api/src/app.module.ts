import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AlertsController } from './alerts.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { apiEntities, AlertEntity, DeviceEntity, ReadingEntity } from './database/entities';
import { DevicesController } from './devices.controller';
import { FarmsController } from './farms.controller';
import { MqttIngestService } from './mqtt-ingest.service';
import { OfflineService } from './offline.service';
import { NotificationsModule } from './notifications/notifications.module';
import { AnchorVerificationService } from './anchor-verification.service';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot(), AuthModule, NotificationsModule, TypeOrmModule.forFeature(apiEntities)],
  controllers: [FarmsController, DevicesController, AlertsController, AdminController],
  providers: [MqttIngestService, OfflineService, AnchorVerificationService],
})
export class AppModule {}
