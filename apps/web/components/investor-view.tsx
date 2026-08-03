'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { api, type Anchor } from '../lib/api';
import { Badge, Card, Table } from './ui';

interface Policy { id: string; peril: string; threshold: number; consecutivePeriods: number; payoutAmount: number; status: string }
interface Portfolio { id: string; region: string; birdType: string; flockSize: number; uptimePct: number; compliancePct: number; alertCount: number; verifiedDays: number; policies: Policy[] }

export function InvestorView() {
  const portfolio = useQuery({ queryKey: ['portfolio'], queryFn: () => api<Portfolio[]>('/public/investors/portfolio') });
  const anchors = useQuery({ queryKey: ['public-anchors'], queryFn: () => api<Anchor[]>('/public/investors/anchors') });
  return <div className="min-h-screen">
    <header className="border-b border-line bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><a href="/investors" className="text-2xl font-black text-moss">Kufuga</a><a href="/admin" className="text-sm font-semibold text-moss hover:underline">Operations login</a></div></header>
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="max-w-3xl"><Badge tone="green">IoT-backed RWA infrastructure</Badge><h1 className="mt-4 text-4xl font-black tracking-tight text-ink md:text-6xl">Evidence that makes poultry finance safer.</h1><p className="mt-5 text-lg leading-8 text-slate-600">Kufuga turns farm conditions into a continuous, independently verifiable operating record. Lenders and insurers can see uptime, animal-condition compliance, and a Stellar anchor trail instead of relying on a paper snapshot.</p></section>
      <section><div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-moss" /><h2 className="text-2xl font-bold">Portfolio health</h2></div><div className="grid gap-4 md:grid-cols-3">{(portfolio.data ?? []).map((farm) => <Card key={farm.id}><div className="text-sm text-slate-500">{farm.region} · {farm.birdType}</div><div className="mt-2 text-2xl font-black">{farm.flockSize.toLocaleString()} birds</div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Uptime" value={`${farm.uptimePct}%`} /><Metric label="Compliance" value={`${farm.compliancePct}%`} /><Metric label="Alerts / 30d" value={String(farm.alertCount)} /><Metric label="Verified days" value={String(farm.verifiedDays)} /></div>{farm.policies.length > 0 && <div className="mt-5 border-t border-line pt-4 text-sm"><div className="font-bold text-moss">Parametric cover</div>{farm.policies.map((policy) => <div key={policy.id} className="mt-2 flex justify-between gap-3"><span>{policy.peril === 'TempHigh' ? 'Heat protection' : policy.peril} · {policy.consecutivePeriods} periods</span><span className="font-semibold capitalize">{policy.status}</span></div>)}</div>}</Card>)}</div></section>
      <section><h2 className="mb-4 text-2xl font-bold">Anchor explorer</h2><Card><Table><thead><tr className="border-b border-line text-left text-xs uppercase text-slate-500"><th className="p-3">Period</th><th className="p-3">Readings</th><th className="p-3">Ledger</th><th className="p-3">Proof</th></tr></thead><tbody>{(anchors.data ?? []).map((anchor) => <AnchorRow key={anchor.id} anchor={anchor} />)}</tbody></Table></Card></section>
      <section className="rounded-2xl bg-ink p-7 text-white"><h2 className="text-2xl font-bold">How the trust layer works</h2><p className="mt-3 max-w-3xl leading-7 text-emerald-50">Sensors measure temperature, humidity, and ammonia. The API stores readings and alert history, while an hourly worker hashes each closed period and writes a compact proof to Stellar. A verifier can recompute the hash and compare it with the public ledger, creating a durable evidence layer for credit decisions and parametric insurance triggers.</p></section>
    </main>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><div className="text-slate-500">{label}</div><div className="mt-1 font-bold text-ink">{value}</div></div>; }
function AnchorRow({ anchor }: { anchor: Anchor }) { const [verified, setVerified] = useState<boolean | null>(null); const verify = async () => { const result = await api<{ verified: boolean; txUrl: string }>(`/public/investors/anchors/${anchor.id}/verify`); setVerified(result.verified); }; return <tr className="border-b border-line/70"><td className="p-3">{new Date(anchor.periodStart * 1000).toLocaleString()}</td><td className="p-3">{anchor.readingCount}</td><td className="p-3">{anchor.ledger}</td><td className="p-3"><div className="flex items-center gap-3">{verified === true && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Verified</span>}{verified === false && <span className="text-sm text-red-600">Could not verify</span>}<button onClick={() => void verify()} className="text-sm font-semibold text-moss hover:underline">Verify now</button><a href={`https://stellar.expert/explorer/testnet/tx/${anchor.stellarTxHash}`} target="_blank" rel="noreferrer" aria-label="Open Stellar transaction"><ExternalLink className="h-4 w-4" /></a></div></td></tr>; }
