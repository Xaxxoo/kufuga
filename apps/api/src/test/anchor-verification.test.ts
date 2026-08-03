import { describe, expect, it } from 'vitest';
import { matchesAnchorProof } from '../anchor-verification.service';

describe('mocked Horizon anchor verification', () => {
  it('accepts a transaction with the expected manage_data proof', () => {
    const hash = '0123456789abcdef'.repeat(8);
    expect(matchesAnchorProof({ memo_type: 'hash', memo_bytes: 'bWVtbw==' }, [{ type: 'manage_data', name: 'ph:device-1:1700000000', value: Buffer.from(hash.slice(0, 56), 'hex').toString('base64') }], 'device-1', 1700000000, hash)).toBe(true);
  });

  it('rejects a transaction with the wrong operation key', () => {
    const hash = '0123456789abcdef'.repeat(8);
    expect(matchesAnchorProof({ memo_type: 'hash', memo_bytes: 'bWVtbw==' }, [{ type: 'manage_data', name: 'ph:other-device:1700000000', value: Buffer.from(hash.slice(0, 56), 'hex').toString('base64') }], 'device-1', 1700000000, hash)).toBe(false);
  });
});
