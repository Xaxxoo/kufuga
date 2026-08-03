#define TINY_GSM_RX_BUFFER 1024
#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <TinyGsmClient.h>
#include <esp_sleep.h>
#include <time.h>

#ifndef KU_DEFAULT_DEVICE_ID
#define KU_DEFAULT_DEVICE_ID "kufuga-esp32-001"
#endif
#ifndef KU_MQTT_HOST
#define KU_MQTT_HOST "192.168.4.2"
#endif
#ifndef KU_MQTT_PORT
#define KU_MQTT_PORT 1883
#endif
#ifndef KU_MQTT_USERNAME
#define KU_MQTT_USERNAME "device-user"
#endif
#ifndef KU_MQTT_PASSWORD
#define KU_MQTT_PASSWORD "device-password"
#endif
#ifndef KU_APN
#define KU_APN "internet"
#endif

constexpr uint8_t DHT_PIN = 4;
constexpr uint8_t DHT_TYPE = DHT22;
constexpr uint8_t NH3_PIN = 34; // ADC1; remains usable while Wi-Fi/GSM is active.
constexpr uint8_t BOOT_PIN = 0;
constexpr uint8_t MODEM_RX_PIN = 16;
constexpr uint8_t MODEM_TX_PIN = 17;
constexpr uint32_t SAMPLE_INTERVAL_SECONDS = 5 * 60;
constexpr uint8_t BATCH_SIZE = 6;
constexpr uint8_t MAX_BUFFERED_READINGS = 48;
constexpr float NH3_WARN_PPM = 15.0f;
constexpr float NH3_DANGER_PPM = 25.0f;
constexpr float HUMIDITY_MIN_PCT = 45.0f;
constexpr float HUMIDITY_MAX_PCT = 75.0f;
constexpr float LOAD_RESISTOR_KOHM = 47.0f;
constexpr float ADC_VCC_MV = 3300.0f;
constexpr float CLEAN_AIR_RS_R0 = 3.6f;
constexpr char TELEMETRY_TOPIC[] = "farm/telemetry";

struct Reading {
  char deviceId[32];
  uint32_t ts;
  float tempC;
  float humidityPct;
  float nh3Ppm;
  bool alert;
};

RTC_DATA_ATTR Reading rtcBuffer[MAX_BUFFERED_READINGS];
RTC_DATA_ATTR uint8_t rtcCount = 0;

DHT dht(DHT_PIN, DHT_TYPE);
Preferences preferences;
HardwareSerial SerialAT(1);
TinyGsm modem(SerialAT);
TinyGsmClient gsmClient(modem);
PubSubClient mqtt(gsmClient);

float temperatureMaxForWeek(uint8_t ageWeeks) {
  // Broiler targets, with a conservative layer-compatible fallback.
  constexpr float maxByWeek[] = {35, 32, 29, 26, 23, 22};
  return maxByWeek[constrain(ageWeeks, 1, 6) - 1];
}

float temperatureMinForWeek(uint8_t ageWeeks) {
  constexpr float minByWeek[] = {32, 29, 26, 23, 21, 20};
  return minByWeek[constrain(ageWeeks, 1, 6) - 1];
}

float readSensorResistanceKohm() {
  const uint32_t millivolts = analogReadMilliVolts(NH3_PIN);
  if (millivolts == 0 || millivolts >= ADC_VCC_MV) return 1000.0f;
  return (static_cast<float>(millivolts) * LOAD_RESISTOR_KOHM) /
         (ADC_VCC_MV - static_cast<float>(millivolts));
}

float readNh3Ppm() {
  const float r0 = preferences.getFloat("r0", 10.0f);
  const float ratio = max(readSensorResistanceKohm() / max(r0, 0.001f), 0.001f);
  // MQ-137 NH3 curve approximation; R0 is measured in the device's clean air.
  constexpr float curveSlope = -0.263f;
  constexpr float curveIntercept = 0.42f;
  return max(powf(10.0f, (log10f(ratio) - curveIntercept) / curveSlope), 0.0f);
}

uint32_t unixNow() {
  const time_t current = time(nullptr);
  return current > 0 ? static_cast<uint32_t>(current) : millis() / 1000;
}

bool isAlert(float tempC, float humidityPct, float nh3Ppm) {
  return nh3Ppm >= NH3_DANGER_PPM || tempC > temperatureMaxForWeek(KU_BIRD_AGE_WEEKS) ||
         tempC < temperatureMinForWeek(KU_BIRD_AGE_WEEKS) || humidityPct > HUMIDITY_MAX_PCT;
}

Reading makeReading(float tempC, float humidityPct, float nh3Ppm) {
  Reading reading{};
  strlcpy(reading.deviceId, KU_DEFAULT_DEVICE_ID, sizeof(reading.deviceId));
  reading.ts = unixNow();
  reading.tempC = tempC;
  reading.humidityPct = humidityPct;
  reading.nh3Ppm = nh3Ppm;
  reading.alert = isAlert(tempC, humidityPct, nh3Ppm);
  return reading;
}

void bufferReading(const Reading &reading) {
  if (rtcCount == MAX_BUFFERED_READINGS) {
    memmove(&rtcBuffer[0], &rtcBuffer[1], sizeof(Reading) * (MAX_BUFFERED_READINGS - 1));
    rtcCount--;
  }
  rtcBuffer[rtcCount++] = reading;
}

bool publishReading(const Reading &reading) {
  JsonDocument document;
  document["deviceId"] = reading.deviceId;
  document["ts"] = reading.ts;
  document["tempC"] = reading.tempC;
  document["humidityPct"] = reading.humidityPct;
  document["nh3Ppm"] = reading.nh3Ppm;
  document["alert"] = reading.alert;
  String payload;
  serializeJson(document, payload);
  return mqtt.publish(TELEMETRY_TOPIC, payload.c_str());
}

bool connectMqtt() {
  if (!modem.isNetworkConnected() && !modem.waitForNetwork(30000L)) return false;
  if (!modem.isGprsConnected() && !modem.gprsConnect(KU_APN, "", "")) return false;
  mqtt.setServer(KU_MQTT_HOST, KU_MQTT_PORT);
  if (!mqtt.connected() && !mqtt.connect(KU_DEFAULT_DEVICE_ID, KU_MQTT_USERNAME, KU_MQTT_PASSWORD)) {
    return false;
  }
  return true;
}

bool flushBuffer() {
  while (rtcCount > 0) {
    const uint8_t countThisBatch = min<uint8_t>(rtcCount, BATCH_SIZE);
    for (uint8_t i = 0; i < countThisBatch; i++) {
      if (!publishReading(rtcBuffer[i])) return false;
      mqtt.loop();
    }
    memmove(&rtcBuffer[0], &rtcBuffer[countThisBatch], sizeof(Reading) * (rtcCount - countThisBatch));
    rtcCount -= countThisBatch;
  }
  return true;
}

void calibrateR0() {
  Serial.println("Calibration mode: sampling clean air for 60 seconds...");
  const uint32_t started = millis();
  double totalResistance = 0;
  uint32_t samples = 0;
  while (millis() - started < 60000UL) {
    totalResistance += readSensorResistanceKohm();
    samples++;
    delay(250);
  }
  const float r0 = static_cast<float>((totalResistance / max<uint32_t>(samples, 1)) / CLEAN_AIR_RS_R0);
  preferences.putFloat("r0", r0);
  Serial.printf("Calibration complete. Persisted R0=%.4f kOhm\n", r0);
}

void sleepUntilNextCycle() {
  mqtt.disconnect();
  modem.gprsDisconnect();
  esp_sleep_enable_timer_wakeup(static_cast<uint64_t>(SAMPLE_INTERVAL_SECONDS) * 1000000ULL);
  Serial.flush();
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  pinMode(BOOT_PIN, INPUT_PULLUP);
  analogReadResolution(12);
  preferences.begin("kufuga", false);
  dht.begin();
  SerialAT.begin(9600, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);

  if (digitalRead(BOOT_PIN) == LOW) {
    calibrateR0();
    sleepUntilNextCycle();
  }

  const float tempC = dht.readTemperature();
  const float humidityPct = dht.readHumidity();
  const float nh3Ppm = readNh3Ppm();
  if (isnan(tempC) || isnan(humidityPct)) {
    Serial.println("DHT22 read failed; retaining the previous buffer and sleeping.");
    sleepUntilNextCycle();
  }

  const Reading reading = makeReading(tempC, humidityPct, nh3Ppm);
  Serial.printf("Reading: %.2fC %.2f%% RH %.2fppm NH3 alert=%s\n", tempC, humidityPct, nh3Ppm,
                reading.alert ? "true" : "false");

  if (reading.alert) {
    if (!connectMqtt() || !publishReading(reading)) {
      Serial.println("Connectivity unavailable; buffering the current reading.");
      bufferReading(reading);
    } else if (!flushBuffer()) {
      Serial.println("Catch-up buffer could not be fully flushed; retaining unsent readings.");
    }
  } else {
    bufferReading(reading);
    if (rtcCount >= BATCH_SIZE && (!connectMqtt() || !flushBuffer())) {
      Serial.println("Connectivity unavailable; retaining the RTC buffer.");
    }
  }
  sleepUntilNextCycle();
}

void loop() {}
