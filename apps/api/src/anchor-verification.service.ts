import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashReadings, type TelemetryReading } from '@kufuga/shared';
import { AnchorBatchEntity, ReadingEntity } from '@kufuga/db';
import { Horizon } from '@stellar/stellar-sdk';
import { Repository } from 'typeorm';

export interface AnchorVerificationResult { verified: boolean; txUrl: string; }

export function matchesAnchorProof(
  transaction: { memo_type?: string; memo_bytes?: string; memo?: string },
  operations: Array<{ type: string; name?: string; value?: string }>,
  deviceId: string,
  periodStart: number,
  expectedHash: string,
): boolean {
  const matching = operations.find((operation) => operation.type === 'manage_data' && operation.name === `ph:${deviceId}:${periodStart}`);
  const onChainValue = matching?.value ? Buffer.from(matching.value, 'base64') : Buffer.alloc(0);
  return transaction.memo_type === 'hash' && Boolean(transaction.memo_bytes ?? transaction.memo) && onChainValue.subarray(0, 28).equals(Buffer.from(expectedHash, 'hex').subarray(0, 28));
}

@Injectable()
export class AnchorVerificationService {
  private readonly server = new Horizon.Server(process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org');
  constructor(
    @InjectRepository(AnchorBatchEntity) private readonly batches: Repository<AnchorBatchEntity>,
    @InjectRepository(ReadingEntity) private readonly readings: Repository<ReadingEntity>,
  ) {}

  async verify(deviceId: string, batchId: string): Promise<AnchorVerificationResult> {
    const batch = await this.batches.findOne({ where: { id: batchId, deviceId } });
    const txHash = batch?.stellarTxHash ?? '';
    const txUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
    if (!batch) return { verified: false, txUrl };
    try {
      const transaction = await this.withRetry(() => this.server.transactions().transaction(txHash).call());
      const operations = await this.withRetry(() => this.server.operations().forTransaction(txHash).call());
      const expected = Buffer.from(batch.sha256, 'hex');
      const key = `ph:${deviceId}:${batch.periodStart}`;
      const rows = await this.readings.createQueryBuilder('r').where('r.deviceId = :deviceId', { deviceId }).andWhere('r.ts >= :start AND r.ts < :end', { start: batch.periodStart, end: batch.periodEnd }).orderBy('r.ts', 'ASC').getMany();
      const recomputed = hashReadings(rows.map((row): TelemetryReading => ({ deviceId: row.deviceId, ts: Number(row.ts), tempC: row.tempC, humidityPct: row.humidityPct, nh3Ppm: row.nh3Ppm, alert: row.alert })));
      return { verified: matchesAnchorProof(transaction, operations.records.map((operation) => ({ type: operation.type, name: 'name' in operation ? operation.name : undefined, value: 'value' in operation ? String(operation.value) : undefined })), deviceId, batch.periodStart, expected.toString('hex')) && recomputed === batch.sha256, txUrl };
    } catch {
      return { verified: false, txUrl };
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try { return await operation(); } catch (error) { lastError = error; if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt)); }
    }
    throw lastError;
  }
}
