import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './client';

export const useFarm = (token: string | null, farmId: string | null) => useQuery({ queryKey: ['farm', farmId], queryFn: () => api.getFarm(token!, farmId!), enabled: Boolean(token && farmId) });
export const useDevices = (token: string | null, farmId: string | null) => useQuery({ queryKey: ['devices', farmId], queryFn: () => api.getDevices(token!, farmId!), enabled: Boolean(token && farmId) });
export const useLatest = (token: string | null, deviceId: string) => useQuery({ queryKey: ['latest', deviceId], queryFn: () => api.getLatest(token!, deviceId), enabled: Boolean(token) });
export const useReadings = (token: string | null, deviceId: string, range: '24h' | '7d' | '30d', resolution: 'raw' | 'hour' | 'day' = 'raw') => useQuery({ queryKey: ['readings', deviceId, range, resolution], queryFn: () => api.getReadings(token!, deviceId, range, resolution), enabled: Boolean(token) });
export const useAlerts = (token: string | null, since = 0) => useQuery({ queryKey: ['alerts', since], queryFn: () => api.getAlerts(token!, since), enabled: Boolean(token) });
export const useAcknowledgeAlert = (token: string | null) => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.acknowledgeAlert(token!, id), onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }) }); };
export const useAnchors = (token: string | null, deviceId: string) => useQuery({ queryKey: ['anchors', deviceId], queryFn: () => api.getAnchors(token!, deviceId), enabled: Boolean(token) });
export const useVerifyAnchor = (token: string | null, deviceId: string, batchId: string) => useQuery({ queryKey: ['verify-anchor', deviceId, batchId], queryFn: () => api.verifyAnchor(token!, deviceId, batchId), enabled: Boolean(token && batchId) });
export const usePolicies = (token: string | null, farmId: string | null) => useQuery({ queryKey: ['policies', farmId], queryFn: () => api.getPolicies(token!, farmId!), enabled: Boolean(token && farmId) });
