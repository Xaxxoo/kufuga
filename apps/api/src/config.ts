export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://kufuga:kufuga@localhost:5432/kufuga',
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
  mqttUrl: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
  mqttUsername: process.env.MQTT_USERNAME,
  mqttPassword: process.env.MQTT_PASSWORD,
  mqttClientId: process.env.MQTT_CLIENT_ID ?? 'kufuga-api',
  offlineAfterMinutes: Number(process.env.OFFLINE_AFTER_MINUTES ?? 30),
  smsProvider: process.env.SMS_PROVIDER ?? 'console',
  africasTalkingUsername: process.env.AT_USERNAME ?? '',
  africasTalkingApiKey: process.env.AT_API_KEY ?? '',
  africasTalkingFrom: process.env.AT_FROM ?? '',
};
