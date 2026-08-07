import { Activity, ArrowRight, CheckCircle2, Cloud, Database, FileCheck2, MessageSquare, ShieldCheck, Smartphone, Wifi } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const markets = ['Kenya', 'Ghana', 'Nigeria', 'Ethiopia', 'Rwanda'];
const steps = [
  { icon: Wifi, title: 'Sense every house', text: 'ESP32 nodes track ammonia, temperature, and humidity around the clock.' },
  { icon: Cloud, title: 'Respond early', text: 'Farm teams get simple dashboards and SMS alerts before conditions become losses.' },
  { icon: FileCheck2, title: 'Prove the record', text: 'Hourly fingerprints are anchored on Stellar for lending and parametric insurance.' },
];

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-bg text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-moss focus:px-4 focus:py-2 focus:text-white focus:outline-none">Skip to content</a>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight font-display focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 rounded-lg"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-white">K</span>Kufuga</a>
        <div className="hidden items-center gap-8 text-sm font-semibold text-text-secondary md:flex">
          <a href="#how-it-works" className="hover:text-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 rounded">How it works</a>
          <a href="#built-for" className="hover:text-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 rounded">Our markets</a>
          <a href="#trust" className="hover:text-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 rounded">Trust layer</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="/admin" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-moss shadow-sm hover:border-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2">Sign in</a>
        </div>
      </nav>

      <section id="main-content" className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-20">
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-mint blur-3xl dark:bg-green-900/30" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-bold text-moss"><Activity className="h-4 w-4" /> Smarter poultry. Stronger proof.</div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight font-display md:text-7xl">Know what&apos;s happening in every house.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary md:text-xl">Kufuga helps poultry farmers across Africa protect their flocks, act earlier, and build a trusted operating history for finance and insurance.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 font-bold text-white shadow-lg shadow-moss/20 transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2">Open operations console <ArrowRight className="h-4 w-4" /></a>
            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3.5 font-bold text-moss hover:border-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2">See how it works</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-text-secondary">{['Live alerts', 'Low-bandwidth ready', 'Stellar anchored'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-moss" />{item}</span>)}</div>
        </div>
        <DashboardMockup />
      </section>

      <section id="built-for" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-6 text-sm font-black uppercase tracking-[.2em] text-moss">Built for farms across Africa</div>
          <div className="flex flex-wrap gap-3">{markets.map((market) => <span key={market} className="rounded-full border border-line bg-bg px-5 py-2.5 text-sm font-bold text-ink">{market}</span>)}</div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <div className="text-sm font-black uppercase tracking-[.2em] text-moss">One connected farm record</div>
          <h2 className="mt-4 text-4xl font-black tracking-tight font-display md:text-5xl">From flock conditions to financial confidence.</h2>
          <p className="mt-5 text-lg leading-8 text-text-secondary">Kufuga connects the physical farm to the people who keep it healthy{'\u2014'}and the institutions that need dependable evidence.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="relative rounded-3xl border border-line bg-surface p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-moss"><Icon className="h-6 w-6" /></div>
              <div className="mt-7 text-sm font-bold text-text-muted">0{index + 1}</div>
              <h3 className="mt-2 text-xl font-black text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="bg-green-900 text-white dark:bg-green-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-300/15 text-green-200"><ShieldCheck className="h-6 w-6" /></div>
            <h2 className="mt-7 text-4xl font-black tracking-tight font-display md:text-5xl">A record people can verify.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-green-50/80">Every closed hour is fingerprinted and anchored on Stellar. The raw readings stay in the farm system; the public proof makes silent changes visible.</p>
            <a href="/investors/portfolio" className="mt-8 inline-flex items-center gap-2 font-bold text-green-300 hover:text-white transition focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900 rounded">Explore the trust layer <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TrustCard icon={Database} title="One source of truth" text="Telemetry, alerts, and history stay connected." />
            <TrustCard icon={Smartphone} title="Made for the field" text="Big, clear screens and SMS when connectivity is limited." />
            <TrustCard icon={ShieldCheck} title="Tamper-evident" text="Hourly hashes create an independent audit trail." />
            <TrustCard icon={FileCheck2} title="Finance ready" text="Verified history supports lending and insurance decisions." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
        <h2 className="text-4xl font-black tracking-tight font-display md:text-5xl">Better signals. Better decisions.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">Start with a clearer view of your houses today, and grow toward a farm record that earns trust tomorrow.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 font-bold text-white hover:bg-primary-hover transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2">Get started <ArrowRight className="h-4 w-4" /></a>
          <a href="/investors/portfolio" className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3.5 font-bold text-moss hover:border-moss transition focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2">For lenders and insurers</a>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="font-black text-moss font-display">Kufuga</div>
          <div>IoT intelligence for poultry farms in Africa.</div>
          <div>{'\u00a9'} 2026 Kufuga</div>
        </div>
      </footer>
    </main>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="rounded-[2rem] bg-green-900 p-4 shadow-2xl shadow-green-900/20 dark:bg-green-800">
        <div className="rounded-[1.5rem] bg-green-800 p-5 text-white dark:bg-green-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-100">Farm overview</div>
              <div className="mt-1 text-2xl font-black">Nairobi {'\u2022'} 4 houses</div>
            </div>
            <span className="rounded-full bg-green-300/20 px-3 py-1 text-xs font-bold text-green-100">LIVE</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[['Temp', '28.4\u00b0', 'Good'], ['Humidity', '63%', 'Good'], ['NH\u2083', '18 ppm', 'Watch']].map(([label, value, state]) => (
              <div key={label} className="rounded-2xl bg-white/10 p-4">
                <div className="text-xs text-green-100">{label}</div>
                <div className="mt-2 text-2xl font-black">{value}</div>
                <div className="mt-1 text-xs text-green-200">{state}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-white p-5 text-ink dark:bg-neutral-700 dark:text-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold"><span className="h-2.5 w-2.5 rounded-full bg-green-400" /> House 2</div>
              <span className="text-xs font-bold text-text-muted">Last reading 2 min ago</span>
            </div>
            <div className="mt-5 flex h-20 items-end gap-2">
              {[35, 44, 39, 54, 48, 62, 58, 72, 64, 78, 70, 82, 76].map((height, index) => <span key={index} className="flex-1 rounded-t bg-green-200 dark:bg-green-600" style={{ height: `${height}%` }} />)}
            </div>
            <div className="mt-3 flex justify-between text-xs text-text-muted">
              <span>24 hours ago</span>
              <span className="font-semibold text-moss">Conditions stable</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-warn-bg text-status-warn"><MessageSquare className="h-5 w-5" /></div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-text-muted">SMS alert</div>
          <div className="text-sm font-bold text-ink">House 2 needs ventilation</div>
        </div>
      </div>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: typeof Database; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <Icon className="h-5 w-5 text-green-300" />
      <div className="mt-5 font-bold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-green-50/70">{text}</div>
    </div>
  );
}
