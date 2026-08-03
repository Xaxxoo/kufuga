export async function api<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`/api/proxy${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } }); if (!response.ok) throw new Error((await response.text()) || 'Request failed'); return response.json() as Promise<T>; }
export interface FleetRow { device: { id: string; farmId: string; label: string; country: string }; farm: { id: string; region: string }; latest: { ts: number; tempC: number; humidityPct: number; nh3Ppm: number; alert: boolean } | null; alertCount: number; }
export interface Farm { id: string; ownerName: string; region: string; flockSize: number; birdType: string; devices?: Array<{ id: string; label: string }> }
export interface Reading { ts: number; tempC: number; humidityPct: number; nh3Ppm: number; alert: boolean }
export interface Alert { id: string; deviceId: string; ts: number; kind: string; value: number; acknowledged: boolean }
export interface Anchor { id: string; deviceId?: string; periodStart: number; periodEnd: number; readingCount: number; sha256: string; stellarTxHash: string; ledger: string }
