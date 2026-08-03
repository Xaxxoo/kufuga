import { describe, expect, it } from 'vitest';
import { batchMemoHash, makeManageDataInputs } from './anchor-planner.js';

describe('anchor planner', () => {
  it('uses the first 28 hash bytes and deterministic batch memo', () => {
    const hash = '0123456789abcdef'.repeat(8);
    const candidates = [{ deviceId: 'device-1', periodStart: 1700000000, periodEnd: 1700003600, sha256: hash, readingCount: 1 }];
    expect(makeManageDataInputs(candidates)[0].name).toBe('ph:device-1:1700000000');
    expect(makeManageDataInputs(candidates)[0].value.toString('hex')).toBe(hash.slice(0, 56));
    expect(batchMemoHash(candidates)).toHaveLength(64);
  });
});
