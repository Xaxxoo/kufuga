import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { hashReadings, type TelemetryReading } from '@kufuga/shared';
import { BatchRegistryClient } from '@kufuga/contracts-sdk';
import { AnchorBatchEntity, DeviceEntity, ReadingEntity } from '@kufuga/db';
import { Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { config } from './config.js';
import { batchMemoHash, makeManageDataInputs, type AnchorCandidate } from './anchor-planner.js';

const HOUR = 3600;
const MAX_OPERATIONS = 100;

@Injectable()
export class AnchorWorkerService implements OnModuleInit {
  private readonly logger = new Logger(AnchorWorkerService.name);
  private readonly server = new Horizon.Server(config.horizonUrl);
  private keypair!: Keypair;

  constructor(
    @InjectRepository(DeviceEntity) private readonly devices: Repository<DeviceEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
    @InjectRepository(AnchorBatchEntity) private readonly anchors: Repository<AnchorBatchEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureServiceAccount();
    await this.anchorMissedPeriods();
  }

  @Cron('0 * * * *')
  async anchorHourly(): Promise<void> { await this.anchorMissedPeriods(); }

  private async ensureServiceAccount(): Promise<void> {
    if (config.secretKey) {
      this.keypair = Keypair.fromSecret(config.secretKey);
      return;
    }
    this.keypair = Keypair.random();
    const response = await fetch(`${config.friendbotUrl}/?addr=${encodeURIComponent(this.keypair.publicKey())}`);
    if (!response.ok) throw new Error(`Friendbot funding failed with HTTP ${response.status}`);
    this.logger.log(`Created ephemeral Stellar TESTNET service account ${this.keypair.publicKey()}`);
  }

  private async anchorMissedPeriods(): Promise<void> {
    const closedPeriodEnd = Math.floor(Date.now() / HOUR) * HOUR;
    const candidates: AnchorCandidate[] = [];
    for (const device of await this.devices.find()) {
      const first = await this.readings.findOne({ where: { deviceId: device.id }, order: { ts: 'ASC' } });
      if (!first) continue;
      const latest = await this.anchors.findOne({ where: { deviceId: device.id }, order: { periodStart: 'DESC' } });
      let periodStart = latest ? latest.periodStart + HOUR : Math.floor(first.ts / HOUR) * HOUR;
      while (periodStart < closedPeriodEnd) {
        const periodEnd = periodStart + HOUR;
        const exists = await this.anchors.findOne({ where: { deviceId: device.id, periodStart } });
        if (!exists) {
          const rows = await this.readings.createQueryBuilder('r').where('r.deviceId = :deviceId', { deviceId: device.id }).andWhere('r.ts >= :periodStart AND r.ts < :periodEnd', { periodStart, periodEnd }).orderBy('r.ts', 'ASC').getMany();
          if (rows.length) candidates.push({ deviceId: device.id, farmId: device.farmId, periodStart, periodEnd, readingCount: rows.length, sha256: hashReadings(rows.map((row) => this.toTelemetry(row))) });
        }
        periodStart += HOUR;
      }
    }
    for (let offset = 0; offset < candidates.length; offset += MAX_OPERATIONS) await this.submitCandidates(candidates.slice(offset, offset + MAX_OPERATIONS));
  }

  private toTelemetry(row: ReadingEntity): TelemetryReading {
    return { deviceId: row.deviceId, ts: Number(row.ts), tempC: row.tempC, humidityPct: row.humidityPct, nh3Ppm: row.nh3Ppm, alert: row.alert };
  }

  private async submitCandidates(candidates: AnchorCandidate[]): Promise<void> {
    if (!candidates.length) return;
    const txHash = await this.withRetry(async () => {
      const account = await this.server.loadAccount(this.keypair.publicKey());
      const network = config.horizonUrl.includes('testnet') ? Networks.TESTNET : Networks.PUBLIC;
      const memoHash = candidates.length === 1 ? candidates[0].sha256 : batchMemoHash(candidates);
      const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: network });
      for (const operation of makeManageDataInputs(candidates)) transaction.addOperation(Operation.manageData({ name: operation.name, value: operation.value }));
      transaction.addMemo(Memo.hash(Buffer.from(memoHash, 'hex'))).setTimeout(180);
      const built = transaction.build();
      built.sign(this.keypair);
      const result = await this.server.submitTransaction(built);
      return { hash: result.hash, ledger: result.ledger ?? 0 };
    });
    await this.anchors.insert(candidates.map((candidate) => this.anchors.create({ deviceId: candidate.deviceId, periodStart: candidate.periodStart, periodEnd: candidate.periodEnd, readingCount: candidate.readingCount, sha256: candidate.sha256, stellarTxHash: txHash.hash, ledger: String(txHash.ledger), anchoredAt: Math.floor(Date.now() / 1000) })));
    await this.registerBatches(candidates);
  }

  private async registerBatches(candidates: readonly AnchorCandidate[]): Promise<void> {
    if (!config.batchRegistryContractId || !config.secretKey) return;
    const client = new BatchRegistryClient({ rpcUrl: config.rpcUrl, contractId: config.batchRegistryContractId, secretKey: config.secretKey });
    for (const candidate of candidates) {
      await this.withRetry(() => client.registerBatch({ farm: candidate.farmId, device: candidate.deviceId, periodStart: candidate.periodStart, periodEnd: candidate.periodEnd, readingCount: candidate.readingCount, sha256: candidate.sha256 }));
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 4; attempt++) {
      try { return await operation(); } catch (error) { lastError = error; if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt)); }
    }
    throw lastError;
  }
}
