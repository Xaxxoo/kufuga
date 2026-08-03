import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export interface AuthResponse { accessToken: string; user: { id: string; phone: string; role: string; farmId: string | null }; }
export interface Device { id: string; farmId: string; label: string; simNumber: string; country: 'KE' | 'GH'; calibrationR0: number; createdAt: string; }
export interface Farm { id: string; ownerName: string; phone: string; region: string; flockSize: number; birdType: 'broiler' | 'layer'; }
export interface Reading { id?: string; deviceId: string; ts: number; tempC: number; humidityPct: number; nh3Ppm: number; alert: boolean; }
export interface Alert { id: string; deviceId: string; ts: number; kind: string; value: number; acknowledged: boolean; deliveries?: Array<{ status: string; deliveryType: string; sentAt?: string }> }
export interface AnchorBatch { id: string; deviceId: string; periodStart: number; periodEnd: number; readingCount: number; sha256: string; stellarTxHash: string; ledger: string; anchoredAt: number; }
export interface Policy { id: string; farmId: string; deviceId: string; peril: 'TempHigh'; threshold: number; consecutivePeriods: number; payoutAmount: number; premium: number; status: 'active' | 'paid' | 'cancelled'; deviceLabel?: string; }

async function request<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
  if (!response.ok) throw new Error((await response.text()) || `API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const login = (phone: string, pin: string) => request<AuthResponse>('/auth/login', undefined, { method: 'POST', body: JSON.stringify({ phone, pin }) });
export const register = (body: { ownerName: string; phone: string; pin: string; region: string; flockSize: number; birdType: 'broiler' | 'layer' }) => request<AuthResponse>('/auth/register', undefined, { method: 'POST', body: JSON.stringify(body) });
export const registerPushToken = (token: string, pushToken: string) => request<{ registered: true }>('/auth/push-token', token, { method: 'POST', body: JSON.stringify({ token: pushToken, platform: Platform.OS === 'ios' ? 'ios' : 'android' }) });
export const getFarm = (token: string, farmId: string) => request<Farm>(`/farms/${farmId}`, token);
export const getDevices = (token: string, farmId: string) => request<Device[]>(`/farms/${farmId}/devices`, token);
export const getLatest = (token: string, deviceId: string) => request<Reading | null>(`/devices/${deviceId}/latest`, token);
export const getReadings = (token: string, deviceId: string, range: '24h' | '7d' | '30d', resolution: 'raw' | 'hour' | 'day' = 'raw') => {
  const seconds = range === '24h' ? 86400 : range === '7d' ? 604800 : 2592000;
  return request<Reading[]>(`/devices/${deviceId}/readings?from=${Math.floor(Date.now() / 1000) - seconds}&to=${Math.floor(Date.now() / 1000)}&resolution=${resolution}`, token);
};
export const getAlerts = (token: string, since = 0) => request<Alert[]>(`/alerts?since=${since}`, token);
export const acknowledgeAlert = (token: string, id: string) => request<Alert>(`/alerts/${id}/ack`, token, { method: 'POST' });
export const getAnchors = (token: string, deviceId: string) => request<AnchorBatch[]>(`/devices/${deviceId}/anchors`, token);
export const verifyAnchor = (token: string, deviceId: string, batchId: string) => request<{ verified: boolean; txUrl: string }>(`/devices/${deviceId}/anchors/${batchId}/verify`, token);
export const getPolicies = (token: string, farmId: string) => request<Policy[]>(`/farms/${farmId}/policies`, token);
