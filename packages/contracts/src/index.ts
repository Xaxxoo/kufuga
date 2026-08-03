import { Contract, Keypair, Networks, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';

export interface RegisterBatchInput { farm: string; device: string; periodStart: number; periodEnd: number; readingCount: number; sha256: string; }
export interface SorobanBindingConfig { rpcUrl: string; contractId: string; secretKey: string; }

const stringVal = (value: string): xdr.ScVal => xdr.ScVal.scvString(value);
const u64Val = (value: number): xdr.ScVal => xdr.ScVal.scvU64(xdr.Uint64.fromString(String(value)));
const u32Val = (value: number): xdr.ScVal => xdr.ScVal.scvU32(value);
const bytes32Val = (hex: string): xdr.ScVal => xdr.ScVal.scvBytes(Buffer.from(hex, 'hex'));

/** TypeScript binding for batch_registry.register_batch. */
export class BatchRegistryClient {
  private readonly server: Server;
  private readonly keypair: Keypair;
  private readonly contract: Contract;

  constructor(private readonly config: SorobanBindingConfig) {
    this.server = new Server(config.rpcUrl);
    this.keypair = Keypair.fromSecret(config.secretKey);
    this.contract = new Contract(config.contractId);
  }

  async registerBatch(input: RegisterBatchInput): Promise<{ hash: string; ledger?: number }> {
    const account = await this.server.getAccount(this.keypair.publicKey());
    const transaction = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
      .addOperation(this.contract.call('register_batch', stringVal(input.farm), stringVal(input.device), u64Val(input.periodStart), u64Val(input.periodEnd), u32Val(input.readingCount), bytes32Val(input.sha256)))
      .setTimeout(180)
      .build();
    const prepared = await this.server.prepareTransaction(transaction);
    prepared.sign(this.keypair);
    const submitted = await this.server.sendTransaction(prepared);
    if (submitted.status === 'ERROR') throw new Error(`Soroban register_batch failed: ${submitted.errorResult ?? 'unknown error'}`);
    const result = await this.server.pollTransaction(submitted.hash, { attempts: 10 });
    return { hash: submitted.hash, ledger: result.status === 'SUCCESS' ? result.ledger : undefined };
  }
}
