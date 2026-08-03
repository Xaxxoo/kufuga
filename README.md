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

The TypeScript packages are intentionally empty scaffolds. Start the infrastructure with `docker compose up`; Mosquitto is available on `localhost:1883` and Postgres on `localhost:5432` (`kufuga` / `kufuga`).

The local telemetry stand-in publishes to Mosquitto with `pnpm sim --devices 5 --speed 60x`; add `--scenario heatwave` to exercise elevated temperature and humidity alerts. The ESP32 firmware can be built with PlatformIO from `firmware/sensor-node`.
