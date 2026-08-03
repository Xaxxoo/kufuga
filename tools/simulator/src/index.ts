import mqtt, { type MqttClient } from 'mqtt';
import { telemetryReadingSchema, type TelemetryReading } from '@kufuga/shared';

const TELEMETRY_TOPIC = 'farm/telemetry';
const CYCLE_SECONDS = 5 * 60;
const MAX_BUFFER = 48;

interface Options {
  devices: number;
  speed: number;
  scenario?: string;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { devices: 1, speed: 1 };
  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    if (argument === '--devices') options.devices = Math.max(1, Number(argv[++i] ?? 1));
    if (argument === '--speed') options.speed = Math.max(0.1, Number.parseFloat(argv[++i]?.replace(/x$/i, '') ?? '1'));
    if (argument === '--scenario') options.scenario = argv[++i];
  }
  if (!Number.isFinite(options.devices) || !Number.isFinite(options.speed)) {
    throw new Error('Usage: pnpm sim --devices 5 --speed 60x [--scenario heatwave]');
  }
  return options;
}

function readingFor(deviceIndex: number, ts: number, scenario?: string): TelemetryReading {
  const dayPhase = ((ts % 86400) / 86400) * Math.PI * 2;
  const houseOffset = (deviceIndex % 5) * 0.7;
  const heatwaveOffset = scenario === 'heatwave' ? 7 : 0;
  const spike = Math.random() < 0.05;
  const tempC = 27 + houseOffset + Math.sin(dayPhase - Math.PI / 2) * 5 + heatwaveOffset + (spike ? 8 : 0);
  const humidityPct = Math.min(95, Math.max(35, 65 - Math.sin(dayPhase) * 9 + (spike ? 12 : 0)));
  const litterAgeDays = Math.max(0, Math.floor(ts / 86400) % 42);
  const nh3Ppm = Math.max(2, 5 + litterAgeDays * 0.35 + Math.random() * 2 + (spike ? 24 : 0));
  return {
    deviceId: `sim-device-${String(deviceIndex + 1).padStart(3, '0')}`,
    ts,
    tempC: Number(tempC.toFixed(6)),
    humidityPct: Number(humidityPct.toFixed(6)),
    nh3Ppm: Number(nh3Ppm.toFixed(6)),
    alert: nh3Ppm >= 25 || tempC > 35 || tempC < 20 || humidityPct > 75,
  };
}

function publish(client: MqttClient, reading: TelemetryReading): void {
  client.publish(TELEMETRY_TOPIC, JSON.stringify(telemetryReadingSchema.parse(reading)));
}

function flushCatchUp(client: MqttClient, buffer: TelemetryReading[]): void {
  const count = Math.min(6, buffer.length);
  for (let i = 0; i < count; i++) publish(client, buffer.shift()!);
  if (count > 0) console.log(`published catch-up batch of ${count} reading(s)`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;
  const client = mqtt.connect(brokerUrl, { username, password, reconnectPeriod: 1000 });
  const buffers = Array.from({ length: options.devices }, () => [] as TelemetryReading[]);
  let connected = false;
  let simulatedTs = Math.floor(Date.now() / 1000);

  client.on('connect', () => {
    connected = true;
    console.log(`connected to ${brokerUrl}; simulating ${options.devices} device(s) at ${options.speed}x`);
  });
  client.on('close', () => { connected = false; });
  client.on('error', (error) => console.error(`MQTT error: ${error.message}`));

  const cycle = (): void => {
    simulatedTs += CYCLE_SECONDS;
    for (let index = 0; index < options.devices; index++) {
      const reading = readingFor(index, simulatedTs, options.scenario);
      const connectivityGap = Math.random() < 0.1;
      const buffer = buffers[index];
      if (!connected || connectivityGap) {
        if (buffer.length === MAX_BUFFER) buffer.shift();
        buffer.push(reading);
        console.log(`${reading.deviceId} offline; buffered ${buffer.length}/${MAX_BUFFER}`);
        continue;
      }
      while (buffer.length > 0) flushCatchUp(client, buffer);
      publish(client, reading);
      if (reading.alert) console.log(`${reading.deviceId} alert: ${JSON.stringify(reading)}`);
    }
  };

  cycle();
  setInterval(cycle, (CYCLE_SECONDS * 1000) / options.speed);
  process.once('SIGINT', () => { client.end(); process.exit(0); });
}

main();
