#!/usr/bin/env bash
set -euo pipefail

: "${STELLAR_SOURCE_ACCOUNT:?Set STELLAR_SOURCE_ACCOUNT to a Stellar CLI identity}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cargo build --release --target wasm32-unknown-unknown
REGISTRY_WASM="target/wasm32-unknown-unknown/release/kufuga_batch_registry.wasm"
COVER_WASM="target/wasm32-unknown-unknown/release/kufuga_parametric_cover.wasm"

REGISTRY_ID="$(stellar contract deploy --wasm "$REGISTRY_WASM" --source-account "$STELLAR_SOURCE_ACCOUNT" --network testnet)"
COVER_ID="$(stellar contract deploy --wasm "$COVER_WASM" --source-account "$STELLAR_SOURCE_ACCOUNT" --network testnet)"

echo "BATCH_REGISTRY_CONTRACT_ID=$REGISTRY_ID"
echo "PARAMETRIC_COVER_CONTRACT_ID=$COVER_ID"
echo "Initialize registry: stellar contract invoke --id $REGISTRY_ID --source-account $STELLAR_SOURCE_ACCOUNT --network testnet -- init --anchor <ANCHOR_PUBLIC_KEY>"
echo "Initialize cover: stellar contract invoke --id $COVER_ID --source-account $STELLAR_SOURCE_ACCOUNT --network testnet -- init --registry $REGISTRY_ID --oracle <ORACLE_PUBLIC_KEY> --usdc <TESTNET_USDC_CONTRACT_ID>"
