import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminCredentials1720000000000 implements MigrationInterface {
  name = 'AdminCredentials1720000000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "passwordHash" character varying`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordHash"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
  }
}
