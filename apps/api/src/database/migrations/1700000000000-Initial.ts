import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1700000000000 implements MigrationInterface {
  name = 'Initial1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TABLE "farms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerName" character varying NOT NULL, "phone" character varying NOT NULL, "region" character varying NOT NULL, "flockSize" integer NOT NULL, "birdType" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_farms_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying NOT NULL, "pinHash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'farmer', "farmId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_phone" UNIQUE ("phone"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farmId" uuid NOT NULL, "label" character varying NOT NULL, "simNumber" character varying NOT NULL, "country" character varying NOT NULL, "calibrationR0" double precision NOT NULL, "mqttUsername" character varying NOT NULL, "mqttPassword" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_devices_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "readings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" uuid NOT NULL, "ts" bigint NOT NULL, "tempC" double precision NOT NULL, "humidityPct" double precision NOT NULL, "nh3Ppm" double precision NOT NULL, "alert" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_readings_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_readings_device_ts" ON "readings" ("deviceId", "ts")`);
    await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" uuid NOT NULL, "ts" bigint NOT NULL, "kind" character varying NOT NULL, "value" double precision NOT NULL, "acknowledged" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_alerts_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "anchor_batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" uuid NOT NULL, "periodStart" bigint NOT NULL, "periodEnd" bigint NOT NULL, "readingCount" integer NOT NULL, "sha256" character varying(64) NOT NULL, "stellarTxHash" character varying NOT NULL, "ledger" character varying NOT NULL, "anchoredAt" bigint NOT NULL, CONSTRAINT "PK_anchor_batches_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_devices_farm" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "readings" ADD CONSTRAINT "FK_readings_device" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_alerts_device" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "anchor_batches"`);
    await queryRunner.query(`DROP TABLE "alerts"`);
    await queryRunner.query(`DROP INDEX "IDX_readings_device_ts"`);
    await queryRunner.query(`DROP TABLE "readings"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "farms"`);
  }
}
