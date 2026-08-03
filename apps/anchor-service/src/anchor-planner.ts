import { createHash } from 'node:crypto';

export interface AnchorCandidate { deviceId: string; periodStart: number; periodEnd: number; sha256: string; readingCount: number; }
export interface ManageDataInput { name: string; value: Buffer; }

export function makeManageDataInputs(candidates: readonly AnchorCandidate[]): ManageDataInput[] {
  return candidates.map((candidate) => ({ name: `ph:${candidate.deviceId}:${candidate.periodStart}`, value: Buffer.from(candidate.sha256, 'hex').subarray(0, 28) }));
}

export function batchMemoHash(candidates: readonly AnchorCandidate[]): string {
  return createHash('sha256').update(candidates.map((candidate) => candidate.sha256).join('')).digest('hex');
}
