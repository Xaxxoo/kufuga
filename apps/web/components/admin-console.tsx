'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp, LogOut, Radio, Search, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api, type Alert, type Farm, type FleetRow } from '../lib/api';
import { Badge, Button, Card, Input, Table } from './ui';
import { DeviceCharts } from './device-charts';
import { ThemeToggle } from './theme-toggle';
import { useToast } from './toast';
import { formatTemp, formatPpm } from '@kufuga/ui/format';

async function getSession(): Promise<{ authenticated: boolean }> {
  const response = await fetch('/api/auth/session');
  return response.json() as Promise<{ authenticated: boolean }>;
}

function Login() {
  const client = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!response.ok) { setError('Invalid admin credentials'); return; }
    await client.invalidateQueries({ queryKey: ['session'] });
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <div className="text-3xl font-black text-moss font-display">Kufuga</div>
          <p className="mt-2 text-text-secondary">Operations console</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-ink">Email<Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1" /></label>
          <label className="block text-sm font-medium text-ink">Password<Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1" /></label>
          {error && <p className="text-sm text-status-danger">{error}</p>}
          <Button className="w-full" type="submit">Sign in</Button>
        </form>
      </Card>
    </main>
  );
}

type SortKey = 'label' | 'status' | 'tempC' | 'humidityPct';
type SortDir = 'asc' | 'desc';

function getStatus(row: FleetRow): 'offline' | 'alert' | 'online' {
  const offline = !row.latest || Date.now() / 1000 - row.latest.ts > 1800;
  if (offline) return 'offline';
  if (row.latest?.alert) return 'alert';
  return 'online';
}

const statusOrder: Record<string, number> = { offline: 0, alert: 1, online: 2 };

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return sortDir === 'asc' ? <ChevronUp className="ml-1 inline h-3 w-3" /> : <ChevronDown className="ml-1 inline h-3 w-3" />;
}

function FleetTable({ rows, onSelect }: { rows: FleetRow[]; onSelect: (row: FleetRow) => void }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('label');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = rows;
    if (q) {
      result = rows.filter((row) =>
        row.device.label.toLowerCase().includes(q) ||
        row.farm.region.toLowerCase().includes(q) ||
        row.device.country.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'label':
          cmp = a.device.label.localeCompare(b.device.label);
          break;
        case 'status':
          cmp = statusOrder[getStatus(a)] - statusOrder[getStatus(b)];
          break;
        case 'tempC':
          cmp = (a.latest?.tempC ?? -Infinity) - (b.latest?.tempC ?? -Infinity);
          break;
        case 'humidityPct':
          cmp = (a.latest?.humidityPct ?? -Infinity) - (b.latest?.humidityPct ?? -Infinity);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, search, sortKey, sortDir]);

  return (
    <>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder="Search devices or farms\u2026"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search fleet devices"
          className="w-full rounded-lg border border-line bg-surface py-2 pl-10 pr-3 text-sm text-ink placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
        />
      </div>
      <Table>
        <thead>
          <tr className="sticky top-0 z-10 border-b border-line bg-surface text-xs uppercase text-text-secondary">
            <th className="cursor-pointer select-none p-3" onClick={() => toggleSort('label')} aria-sort={sortKey === 'label' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              Device <SortIcon column="label" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="p-3">Farm</th>
            <th className="cursor-pointer select-none p-3" onClick={() => toggleSort('tempC')} aria-sort={sortKey === 'tempC' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              Latest <SortIcon column="tempC" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="p-3">Alerts</th>
            <th className="cursor-pointer select-none p-3" onClick={() => toggleSort('status')} aria-sort={sortKey === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              Status <SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => {
            const status = getStatus(row);
            return (
              <tr
                key={row.device.id}
                className="cursor-pointer border-b border-line/70 transition hover:bg-surface-hover"
                onClick={() => onSelect(row)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(row); } }}
              >
                <td className="p-3 font-semibold text-ink">{row.device.label}<div className="text-xs font-normal text-text-secondary">{row.device.country}</div></td>
                <td className="p-3 text-text-secondary">{row.farm.region}</td>
                <td className="p-3">{row.latest ? `${formatTemp(row.latest.tempC)} \u00b7 ${formatPpm(row.latest.nh3Ppm)} NH\u2083` : <span className="text-text-muted">No data</span>}</td>
                <td className="p-3">{row.alertCount}</td>
                <td className="p-3">{status === 'offline' ? <Badge tone="red"><WifiOff className="mr-1 h-3 w-3" /> Offline</Badge> : status === 'alert' ? <Badge tone="amber"><AlertTriangle className="mr-1 h-3 w-3" /> Alert</Badge> : <Badge tone="green">Online</Badge>}</td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-text-muted">No devices match your search.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

function ProvisionForm({ farms }: { farms: Farm[] }) {
  const toast = useToast();
  const [form, setForm] = useState({ farmId: farms[0]?.id ?? '', label: '', simNumber: '', country: 'KE' });
  const [result, setResult] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const response = await api<{ mqtt: { username: string; password: string }; device: { label: string } }>('/admin/devices', { method: 'POST', body: JSON.stringify(form) });
      setResult(`${response.device.label}: ${response.mqtt.username} / ${response.mqtt.password}`);
      toast.success(`Device "${response.device.label}" provisioned successfully`);
    } catch {
      toast.error('Failed to provision device');
    }
  }
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Provision device</h2>
      <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
        <select
          aria-label="Select farm"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          value={form.farmId}
          onChange={(event) => setForm({ ...form, farmId: event.target.value })}
        >
          {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.ownerName} {'\u00b7'} {farm.region}</option>)}
        </select>
        <Input required placeholder="House label" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
        <Input required placeholder="SIM number" value={form.simNumber} onChange={(event) => setForm({ ...form, simNumber: event.target.value })} />
        <Button type="submit">Issue credentials</Button>
      </form>
      {result && <p className="mt-4 rounded-lg bg-status-warn-bg p-3 text-sm text-status-warn">Save once {'\u2014'} MQTT credentials: <strong>{result}</strong></p>}
    </Card>
  );
}

const ALERTS_PER_PAGE = 20;

function AlertsFeed({ alerts }: { alerts: Alert[] }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const visible = alerts.filter((alert) => filter === 'all' || alert.kind === filter);
  const pageEnd = page * ALERTS_PER_PAGE;
  const paged = visible.slice(0, pageEnd);
  const hasMore = visible.length > pageEnd;

  // Group by date
  const grouped: Record<string, Alert[]> = {};
  for (const alert of paged) {
    const dateKey = new Date(alert.ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(alert);
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Alerts feed</h2>
        <select
          aria-label="Filter alerts by condition"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          value={filter}
          onChange={(event) => { setFilter(event.target.value); setPage(1); }}
        >
          <option value="all">All conditions</option>
          <option value="NH3_DANGER">NH{'\u2083'} danger</option>
          <option value="TEMP_HIGH">Temperature high</option>
          <option value="DEVICE_OFFLINE">Device offline</option>
        </select>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, dateAlerts]) => (
          <div key={date}>
            <div className="mb-2 text-xs font-semibold uppercase text-text-secondary">{date}</div>
            <div className="space-y-2">
              {dateAlerts.map((alert) => {
                const isDanger = alert.kind.includes('DANGER') || alert.kind.includes('OFFLINE');
                const tone = isDanger ? 'red' as const : 'amber' as const;
                return (
                  <div key={alert.id} className={`flex items-center justify-between rounded-lg p-3 ${alert.acknowledged ? 'bg-surface-hover' : 'bg-surface'} border-l-4 ${isDanger ? 'border-l-status-danger-border' : 'border-l-status-warn-border'}`}>
                    <div>
                      <div className={`font-semibold ${alert.acknowledged ? 'text-text-muted line-through' : 'text-ink'}`}>{alert.kind.replaceAll('_', ' ')}</div>
                      <div className="text-xs text-text-secondary">{new Date(alert.ts * 1000).toLocaleString()} {'\u00b7'} {alert.value.toFixed(1)}</div>
                    </div>
                    <Badge tone={tone} muted={alert.acknowledged}>{alert.acknowledged ? 'Acknowledged' : 'Open'}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-moss transition hover:border-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            Load more ({visible.length - pageEnd} remaining)
          </button>
        </div>
      )}
    </Card>
  );
}

export function AdminConsole() {
  const session = useQuery({ queryKey: ['session'], queryFn: getSession });
  const [section, setSection] = useState<'fleet' | 'farms' | 'alerts'>('fleet');
  const [selected, setSelected] = useState<FleetRow | null>(null);

  const enabled = Boolean(session.data?.authenticated);
  const fleet = useQuery({ queryKey: ['fleet'], queryFn: () => api<FleetRow[]>('/admin/fleet'), enabled, refetchInterval: 30_000 });
  const farms = useQuery({ queryKey: ['admin-farms'], queryFn: () => api<Farm[]>('/admin/farms'), enabled });
  const alerts = useQuery({ queryKey: ['admin-alerts'], queryFn: () => api<Alert[]>('/alerts?since=0'), enabled, refetchInterval: 30_000 });

  if (session.isLoading) return <div className="p-10 text-text-secondary">Loading session{'\u2026'}</div>;
  if (!enabled) return <Login />;

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); await session.refetch(); }

  const openAlertCount = alerts.data?.filter((a) => !a.acknowledged).length ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-2xl font-black text-moss font-display">Kufuga</div>
            <div className="text-xs text-text-secondary">Operations console</div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a className="text-sm text-moss hover:underline focus-ring rounded" href="/investors">Investor view</a>
            <Button className="flex items-center gap-2 bg-surface-hover dark:bg-surface-hover" onClick={logout}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <div className="text-sm text-text-secondary">Fleet devices</div>
            <div className="mt-2 text-3xl font-black text-ink" role="status" aria-live="polite">{fleet.data?.length ?? '\u2014'}</div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary">Open alerts</div>
            <div className={`mt-2 text-3xl font-black ${openAlertCount > 0 ? 'text-status-danger' : 'text-ink'}`} role="status" aria-live="polite">{openAlertCount}</div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary">API status</div>
            <div className="mt-2 flex items-center gap-2 text-lg font-bold text-status-safe"><Radio className="h-5 w-5" /> Live polling</div>
          </Card>
        </div>

        <nav className="flex gap-2 border-b border-line" role="tablist" aria-label="Console sections">
          {(['fleet', 'farms', 'alerts'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={section === tab}
              className={`px-4 py-3 font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${section === tab ? 'border-b-2 border-moss font-bold text-moss' : 'text-text-secondary hover:text-ink'}`}
              onClick={() => setSection(tab)}
            >
              {tab === 'farms' ? 'Farms & devices' : tab}
            </button>
          ))}
        </nav>

        {section === 'fleet' && (
          <>
            <Card>
              <h1 className="mb-4 text-xl font-bold text-ink">Live fleet</h1>
              <FleetTable rows={fleet.data ?? []} onSelect={setSelected} />
            </Card>
            {selected && <DeviceCharts deviceId={selected.device.id} label={selected.device.label} />}
          </>
        )}
        {section === 'farms' && <ProvisionForm farms={farms.data ?? []} />}
        {section === 'alerts' && <AlertsFeed alerts={alerts.data ?? []} />}
      </main>
    </div>
  );
}
