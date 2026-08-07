'use client';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { useMemo } from 'react';
import { api, type Reading } from '../lib/api';
import { Button, Card } from './ui';
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function DeviceCharts({ deviceId, label }: { deviceId: string; label: string }) {
  const readings = useQuery({
    queryKey: ['web-readings', deviceId],
    queryFn: () => api<Reading[]>(`/devices/${deviceId}/readings?from=${Math.floor(Date.now() / 1000) - 86400 * 30}&to=${Math.floor(Date.now() / 1000)}&resolution=day`),
  });

  const data = useMemo(() => (readings.data ?? []).map((row) => ({
    ...row,
    time: new Date(row.ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  })), [readings.data]);

  const download = () => {
    const csv = ['ts,tempC,humidityPct,nh3Ppm,alert', ...(readings.data ?? []).map((row) => `${row.ts},${row.tempC},${row.humidityPct},${row.nh3Ppm},${row.alert}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.replaceAll(' ', '-')}-readings.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{label} \u00b7 30-day trend</h2>
          <p className="text-sm text-text-secondary">Raw data export available for audits</p>
        </div>
        <Button className="flex items-center gap-2 bg-surface-hover dark:bg-surface-hover" onClick={download}><Download className="h-4 w-4" /> CSV</Button>
      </div>
      <div className="h-72 w-full">
        {readings.isLoading ? (
          <div className="flex h-full items-center justify-center text-text-secondary">Loading readings\u2026</div>
        ) : (
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                }}
              />
              <Legend />
              {/* Safe temperature range band */}
              <ReferenceArea y1={22} y2={30} fill="var(--color-status-safe-bg)" fillOpacity={0.4} label={{ value: 'Safe range', position: 'insideTopLeft', fill: 'var(--color-text-muted)', fontSize: 10 }} />
              <Line type="monotone" dataKey="tempC" name="Temp \u00b0C" stroke="var(--color-status-warn)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="humidityPct" name="Humidity %" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="nh3Ppm" name="NH\u2083 ppm" stroke="var(--color-status-danger)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
