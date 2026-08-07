'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react';
import { api, type Anchor } from '../lib/api';
import { Badge, Card, Table } from './ui';
import { ThemeToggle } from './theme-toggle';
import { formatPercent } from '@kufuga/ui/format';

interface Policy { id: string; peril: string; threshold: number; consecutivePeriods: number; payoutAmount: number; status: string }
interface Portfolio { id: string; region: string; birdType: string; flockSize: number; uptimePct: number; compliancePct: number; alertCount: number; verifiedDays: number; policies: Policy[] }

export function InvestorView() {
  const portfolio = useQuery({ queryKey: ['portfolio'], queryFn: () => api<Portfolio[]>('/public/investors/portfolio') });
  const anchors = useQuery({ queryKey: ['public-anchors'], queryFn: () => api<Anchor[]>('/public/investors/anchors') });

  // Compute aggregate stats
  const totalUptime = portfolio.data?.length ? formatPercent(portfolio.data.reduce((s, f) => s + f.uptimePct, 0) / portfolio.data.length) : '\u2014';
  const totalVerified = portfolio.data?.reduce((s, f) => s + f.verifiedDays, 0) ?? '\u2014';
  const totalAlerts = portfolio.data?.reduce((s, f) => s + f.alertCount, 0) ?? '\u2014';

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/investors" className="text-2xl font-black text-moss font-display">Kufuga</a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a href="/admin" className="text-sm font-semibold text-moss hover:underline focus-ring rounded">Operations login</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        {/* Hero with stat highlights */}
        <section className="max-w-3xl">
          <Badge tone="green">IoT-backed RWA infrastructure</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-ink font-display md:text-6xl">Evidence that makes poultry finance safer.</h1>
          <p className="mt-5 text-lg leading-8 text-text-secondary">Kufuga turns farm conditions into a continuous, independently verifiable operating record. Lenders and insurers can see uptime, animal-condition compliance, and a public anchor trail instead of relying on a paper snapshot.</p>
        </section>

        {/* Stat highlights */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <div className="text-4xl font-black text-moss">{totalUptime}</div>
            <div className="mt-1 text-sm text-text-secondary">Average uptime</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-black text-moss">{totalVerified}</div>
            <div className="mt-1 text-sm text-text-secondary">Verified days</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-black text-ink" role="status">{totalAlerts}</div>
            <div className="mt-1 text-sm text-text-secondary">Alerts (30d)</div>
          </Card>
        </section>

        {/* Portfolio cards */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-moss" />
            <h2 className="text-2xl font-bold text-ink">Portfolio health</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(portfolio.data ?? []).map((farm) => (
              <Card key={farm.id} className="flex flex-col">
                <div className="text-sm text-text-secondary">{farm.region} \u00b7 {farm.birdType}</div>
                <div className="mt-2 text-2xl font-black text-ink">{farm.flockSize.toLocaleString()} birds</div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Uptime" value={`${farm.uptimePct}%`} highlight={farm.uptimePct >= 95} />
                  <Metric label="Compliance" value={`${farm.compliancePct}%`} highlight={farm.compliancePct >= 90} />
                  <Metric label="Alerts / 30d" value={String(farm.alertCount)} />
                  <Metric label="Verified days" value={String(farm.verifiedDays)} />
                </div>
                {farm.policies.length > 0 && (
                  <div className="mt-5 border-t border-line pt-4 text-sm">
                    <div className="font-bold text-moss">Parametric cover</div>
                    {farm.policies.map((policy) => (
                      <div key={policy.id} className="mt-2 flex justify-between gap-3">
                        <span className="text-text-secondary">{policy.peril === 'TempHigh' ? 'Heat protection' : policy.peril} \u00b7 {policy.consecutivePeriods} periods</span>
                        <Badge tone={policy.status === 'active' ? 'green' : 'amber'}>{policy.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Anchor explorer */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-ink">Anchor explorer</h2>
          <Card>
            <Table>
              <thead>
                <tr className="sticky top-0 z-10 border-b border-line bg-surface text-left text-xs uppercase text-text-secondary">
                  <th className="p-3">Period</th><th className="p-3">Readings</th><th className="p-3">Ledger</th><th className="p-3">Proof</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-surface-hover/50">
                {(anchors.data ?? []).map((anchor) => <AnchorRow key={anchor.id} anchor={anchor} />)}
              </tbody>
            </Table>
          </Card>
        </section>

        {/* Trust section */}
        <section className="rounded-2xl bg-green-900 p-7 text-white dark:bg-green-800">
          <h2 className="text-2xl font-bold">How the trust layer works</h2>
          <p className="mt-3 max-w-3xl leading-7 text-green-50/80">Sensors measure temperature, humidity, and ammonia. The API stores readings and alert history, while an hourly worker hashes each closed period and writes a compact proof to Stellar. A verifier can recompute the hash and compare it with the public ledger, creating a durable evidence layer for credit decisions and parametric insurance triggers.</p>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-text-secondary">{label}</div>
      <div className={`mt-1 flex items-center gap-1 font-bold ${highlight ? 'text-status-safe' : 'text-ink'}`}>
        {highlight && <TrendingUp className="h-3.5 w-3.5" />}
        {value}
      </div>
    </div>
  );
}

function AnchorRow({ anchor }: { anchor: Anchor }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const verify = async () => {
    const result = await api<{ verified: boolean; txUrl: string }>(`/public/investors/anchors/${anchor.id}/verify`);
    setVerified(result.verified);
  };
  return (
    <tr className="border-b border-line/70 transition hover:bg-surface-hover">
      <td className="p-3 text-ink">{new Date(anchor.periodStart * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      <td className="p-3">{anchor.readingCount}</td>
      <td className="p-3 text-text-secondary">{anchor.ledger}</td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          {verified === true && <span className="flex items-center gap-1 text-sm font-semibold text-status-safe"><CheckCircle2 className="h-4 w-4" /> Record verified</span>}
          {verified === false && <span className="text-sm text-status-danger">Could not verify</span>}
          <button onClick={() => void verify()} className="text-sm font-semibold text-moss hover:underline focus-ring rounded">Verify now</button>
          <a href={`https://stellar.expert/explorer/testnet/tx/${anchor.stellarTxHash}`} target="_blank" rel="noreferrer" aria-label="Open Stellar transaction" className="focus-ring rounded"><ExternalLink className="h-4 w-4 text-text-secondary hover:text-ink" /></a>
        </div>
      </td>
    </tr>
  );
}
