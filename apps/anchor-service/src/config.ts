export const config = {
  horizonUrl: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
  rpcUrl: process.env.STELLAR_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  batchRegistryContractId: process.env.BATCH_REGISTRY_CONTRACT_ID,
  friendbotUrl: process.env.STELLAR_FRIENDBOT_URL ?? 'https://friendbot.stellar.org',
  secretKey: process.env.STELLAR_SECRET_KEY,
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://kufuga:kufuga@localhost:5432/kufuga',
  cron: process.env.ANCHOR_CRON ?? '0 * * * *',
};
