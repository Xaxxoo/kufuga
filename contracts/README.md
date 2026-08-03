# Kufuga Soroban contracts

The `batch_registry` contract stores one immutable record per `(device,
period_start)` and accepts writes only from the configured anchor-service
Stellar account. `parametric_cover` escrows testnet USDC premiums, stores one
temperature policy per device, and pays the farm address after an oracle-signed
set of consecutive period claims satisfies the threshold. Temperatures are
fixed-point integers in degrees Celsius multiplied by 100 (for example, 35.00°C
is `3500`).

Trust assumptions are deliberately limited: Stellar protects the registry from
database tampering and replay, but it does not know whether a sensor was honest.
The anchor service is therefore both the authorized registry writer and the
oracle that signs compact claims containing each period's maximum temperature
and the corresponding batch hash. The cover contract checks that the claimed
hash exists in the registry, that requested periods are consecutive, and that
the oracle authorized the transaction. It cannot independently reconstruct raw
readings or detect a compromised sensor, oracle key, or backend. Testnet USDC
and friendbot funding are for development only; no production insurance claim
should rely on this MVP without audited contracts, key rotation, liquidity,
legal review, and an independent oracle.

## Build and deploy

Install the [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
and set `STELLAR_SOURCE_ACCOUNT` to a configured CLI identity. The helper below
builds both WASM artifacts and deploys them to TESTNET. It prints contract IDs;
save them in the anchor service environment and initialize the contracts with
the service account, registry address, oracle account, and a testnet USDC token
contract address.

```bash
./scripts/deploy-testnet.sh
```

The TypeScript binding in `packages/contracts` is consumed by the anchor worker
when `BATCH_REGISTRY_CONTRACT_ID`, `STELLAR_RPC_URL`, and
`STELLAR_SECRET_KEY` are configured. The worker submits a registry call for
each database batch after its hourly manage-data anchor succeeds.
