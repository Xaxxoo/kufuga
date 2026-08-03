import { MigrationInterface, QueryRunner } from 'typeorm';

export class Policies1730000000000 implements MigrationInterface {
  name = 'Policies1730000000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farmId" uuid NOT NULL, "deviceId" uuid NOT NULL, "peril" character varying NOT NULL DEFAULT 'TempHigh', "threshold" integer NOT NULL, "consecutivePeriods" integer NOT NULL, "payoutAmount" bigint NOT NULL, "premium" bigint NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_policies_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_policies_farm_device" ON "policies" ("farmId", "deviceId")`);
    await queryRunner.query(`ALTER TABLE "policies" ADD CONSTRAINT "FK_policies_farm" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "policies" ADD CONSTRAINT "FK_policies_device" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "policies" DROP CONSTRAINT "FK_policies_device"`);
    await queryRunner.query(`ALTER TABLE "policies" DROP CONSTRAINT "FK_policies_farm"`);
    await queryRunner.query(`DROP INDEX "IDX_policies_farm_device"`);
    await queryRunner.query(`DROP TABLE "policies"`);
  }
}
