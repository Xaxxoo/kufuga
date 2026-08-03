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

For the dedicated integration database, ensure PostgreSQL is running, then use `npm --workspace @kufuga/api run test:integration`; the setup script creates and drops `poultry_stellar_test` without testcontainers.

The local telemetry stand-in publishes to Mosquitto with `pnpm sim --devices 5 --speed 60x`; add `--scenario heatwave` to exercise elevated temperature and humidity alerts. The ESP32 firmware can be built with PlatformIO from `firmware/sensor-node`.
