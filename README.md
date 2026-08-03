# Kufuga

Kufuga is an IoT + blockchain poultry-farm monitoring platform for farms in Kenya and Ghana: ESP32 nodes collect NH3, temperature, and humidity readings, send them over GSM/MQTT, the backend ingests them into Postgres, mobile dashboards visualize farm health, SMS alerts notify operators, and hourly batch hashes are anchored on Stellar to provide tamper-proof audit trails for farm financing and parametric insurance.

## Local development

Requirements: Node.js 20+, npm 10+, Docker, and (for firmware/contracts) PlatformIO and Rust.

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/anchor-service/.env.example apps/anchor-service/.env
cp apps/mobile/.env.example apps/mobile/.env
docker compose up -d
npm run build
```

Start the infrastructure with local Mosquitto and PostgreSQL (Docker is optional for development); Mosquitto is available on `localhost:1883` and Postgres on `localhost:5432` (`kufuga` / `kufuga`). The NestJS API lives in `apps/api`, uses TypeORM migrations with `synchronize: false`, and exposes Swagger at `http://localhost:3000/docs`.

```bash
cp apps/api/.env.example apps/api/.env
npm --workspace @kufuga/api run migration:run
npm --workspace @kufuga/api run start:dev
```

Create an admin account for the operations console, then start the web app:

```bash
npm --workspace @kufuga/api run seed:admin
cp apps/web/.env.example apps/web/.env.local
npm --workspace @kufuga/web run dev
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before `seed:admin` when overriding the
development defaults. Open `http://localhost:3001/admin` for the authenticated
operations console and `http://localhost:3001/investors` for the public,
anonymized investor view. The web app proxies API requests through same-origin
routes and stores the admin JWT in an httpOnly cookie.

Run the mobile app against that API with Expo:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000 npm --workspace @kufuga/mobile run start
pnpm sim --devices 5 --speed 60x
```

Use your computer's LAN IP from a physical phone; `localhost` inside a phone or emulator points to the phone/emulator itself. The mobile app keeps recent React Query data in AsyncStorage for low-bandwidth, read-only offline viewing and registers Expo push tokens through `POST /auth/push-token`.

For the dedicated integration database, ensure PostgreSQL is running, then use `npm --workspace @kufuga/api run test:integration`; the setup script creates and drops `poultry_stellar_test` without testcontainers.

The local telemetry stand-in publishes to Mosquitto with `pnpm sim --devices 5 --speed 60x`; add `--scenario heatwave` to exercise elevated temperature and humidity alerts. The ESP32 firmware can be built with PlatformIO from `firmware/sensor-node`.

Soroban contracts live in `contracts/`: `batch_registry` records authorized
hourly hashes and `parametric_cover` holds the MVP temperature-cover logic.
See `contracts/README.md` and `contracts/scripts/deploy-testnet.sh` for TESTNET
deployment. After deployment, set `BATCH_REGISTRY_CONTRACT_ID`,
`STELLAR_RPC_URL`, and `STELLAR_SECRET_KEY` in the anchor service so each
hourly batch is also registered on-chain. The API exposes farmer policy status
at `GET /farms/:id/policies`; the mobile Records screen and public investor
view display those statuses.

## How trust works

Every closed UTC hour, the anchor service takes the canonical, sorted JSON representation of each device's readings and computes a SHA-256 hash. It writes the first 28 bytes into a Stellar TESTNET `manage_data` operation under `ph:<deviceId>:<periodStartUnix>` and places a batch hash in the transaction's `MEMO_HASH`; the complete hash remains in Postgres in the `anchor_batches` record. The API verification endpoint recomputes the readings hash, checks the Stellar transaction and operation, and returns a Stellar Expert link, allowing lenders and insurers to detect changes to the audit trail without trusting the application database alone.
