import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlertDeliveries1710000000000 implements MigrationInterface {
  name = 'AlertDeliveries1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "pushToken" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "pushPlatform" character varying`);
    await queryRunner.query(`ALTER TABLE "alerts" ADD "escalatedAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`CREATE TABLE "sms_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alertId" uuid, "farmId" uuid, "phone" character varying NOT NULL, "deliveryType" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "message" text NOT NULL, "sentAt" TIMESTAMP WITH TIME ZONE, "error" text, "attempts" integer NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_sms_deliveries_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "sms_deliveries" ADD CONSTRAINT "FK_sms_deliveries_alert" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "sms_deliveries" ADD CONSTRAINT "FK_sms_deliveries_farm" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE`);
    await queryRunner.query(`CREATE INDEX "IDX_sms_deliveries_alert" ON "sms_deliveries" ("alertId")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_anchor_batches_device_period" ON "anchor_batches" ("deviceId", "periodStart")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pushPlatform"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pushToken"`);
    await queryRunner.query(`DROP INDEX "UQ_anchor_batches_device_period"`);
    await queryRunner.query(`DROP INDEX "IDX_sms_deliveries_alert"`);
    await queryRunner.query(`ALTER TABLE "sms_deliveries" DROP CONSTRAINT "FK_sms_deliveries_farm"`);
    await queryRunner.query(`ALTER TABLE "sms_deliveries" DROP CONSTRAINT "FK_sms_deliveries_alert"`);
    await queryRunner.query(`DROP TABLE "sms_deliveries"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "escalatedAt"`);
  }
}
