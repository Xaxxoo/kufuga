import { Horizon } from '@stellar/stellar-sdk';
import { describe, expect, it } from 'vitest';

describe.skipIf(process.env.STELLAR_LIVE_TEST !== '1')('Stellar TESTNET live integration', () => {
  it('reaches Horizon TESTNET', async () => {
    const server = new Horizon.Server(process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org');
    const response = await fetch(`${process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'}/fee_stats`);
    expect(response.ok).toBe(true);
    expect(server).toBeDefined();
  });
});
