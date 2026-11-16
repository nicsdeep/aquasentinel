"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, BarChart3, Bell, ClipboardCheck, Droplet, Gauge, GraduationCap, Handshake, MapPin, Menu, Radio, ShieldCheck,
  Siren, Wrench, X, type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CONTACT } from "@/lib/legal/content";
import { cn } from "@/lib/cn";

/*
 * Public website: the first thing anyone sees before signing in (owner's reference design, 16 Nov 2026).
 * Honest framing: AquaSentinel is a *proposed* solution and the Ngomano pilot is *proposed*; no field results,
 * deployments or partnerships are claimed. The photo is illustrative, not a picture of the Ngomano site.
 */

const NAV = [
  { href: "#challenge", label: "The Challenge" },
  { href: "#approach", label: "Our Approach" },
  { href: "#pilot", label: "Pilot in Ngomano", strong: true },
  { href: "#about", label: "About" },
];

const container = "mx-auto w-full max-w-[1540px] px-5 md:px-8";

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-6 text-[13px] font-bold uppercase tracking-[0.18em] text-lp-navy md:text-[16.5px]", className)}>
      {children}
      <span className="h-[1.5px] w-14 bg-lp-navy" aria-hidden />
    </p>
  );
}

function Wave({ className, fill = "#ffffff", band = "var(--color-lp-wave)" }: { className?: string; fill?: string; band?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path d="M0 40C200 20 340 34 520 54s420 30 620 0 260-38 300-30V120H0Z" fill={band} opacity="0.75" />
      <path d="M0 70C220 46 380 56 560 72s400 26 600 2 240-36 280-30V120H0Z" fill={fill} />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-20 bg-white/95 backdrop-blur">
      <div className={cn(container, "flex h-[72px] items-center gap-6 md:h-[82px]")}>
        <Link href="/" aria-label="AquaSentinel home" className="shrink-0">
          <Logo height={70} className="hidden md:block" />
          <Logo height={34} className="md:hidden" />
        </Link>
        <nav className="ml-auto hidden items-center gap-12 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={cn("text-[18px] text-lp-ink transition-colors hover:text-lp-blue", n.strong && "font-semibold")}>
              {n.label}
            </a>
          ))}
        </nav>
        <Link href="/sign-in" className="ml-auto inline-flex h-11 items-center rounded-xl bg-lp-blue-deep px-6 text-[17px] font-medium text-white shadow-sm transition hover:brightness-110 lg:ml-6 lg:h-12">
          Sign In
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid size-11 place-items-center rounded-xl border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-white lg:hidden" aria-label="Main">
          <ul className={cn(container, "py-2")}>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)} className={cn("flex min-h-12 items-center text-[17px] text-lp-ink", n.strong && "font-semibold")}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f3f9fc]">
      {/* Photo (illustrative): right side, fading into the page on the left */}
      <div className="relative h-64 w-full sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[66%]">
        <Image
          src="/landing/hero.jpg"
          alt="Illustration of a community water system: an elevated water tank, a pump house and pipework in a dry landscape"
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover object-[70%_center] lg:object-right [mask-image:linear-gradient(to_bottom,black_75%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_32%)]"
        />
      </div>
      <div className={cn(container, "relative z-10 pb-24 pt-8 md:pb-32 lg:min-h-[478px] lg:pb-24 lg:pt-12")}>
        <div className="max-w-[790px]">
          <Eyebrow>IFSL Water Scarcity Challenge</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(36px,3.4vw,57px)] font-bold leading-[1.08] tracking-[-0.025em] text-lp-ink">
            A smarter way to <br className="hidden sm:block" />
            manage community water.
          </h1>
          <p className="mt-5 max-w-[560px] text-[clamp(17px,1.2vw,19.5px)] leading-[1.5] text-lp-body">
            AquaSentinel is a proposed solution to help communities like Ngomano monitor water infrastructure, respond to
            problems and organise maintenance for more reliable water access.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 md:mt-10 md:gap-6">
            <a href="#approach" className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-gradient-to-b from-[#0b6d9b] to-lp-blue px-7 text-[17px] font-medium text-white shadow-[0_6px_16px_-8px_rgb(1_80_124/0.7)] transition hover:brightness-110">
              See Our Approach <ArrowRight className="size-5" aria-hidden />
            </a>
            <a href="#challenge" className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-lp-ink bg-white px-7 text-[17px] font-medium text-lp-ink transition hover:bg-lp-pill">
              The Challenge
            </a>
          </div>
        </div>
      </div>
      <Wave className="absolute inset-x-0 bottom-0 h-16 w-full md:h-24" fill="var(--color-lp-band)" />
    </section>
  );
}

const PILLARS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Droplet, title: "Monitor", text: "Keep an eye on key water infrastructure" },
  { icon: Bell, title: "Respond", text: "Raise and track issues quickly" },
  { icon: Wrench, title: "Maintain", text: "Organise and follow up on repairs" },
  { icon: BarChart3, title: "Improve", text: "Support more reliable water services" },
];

function Pillars() {
  return (
    <section className="bg-lp-band" aria-label="What AquaSentinel does">
      <ul className={cn(container, "grid grid-cols-1 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-6")}>
        {PILLARS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className={cn("flex gap-5 lg:px-8", i > 0 && "lg:border-l lg:border-[#dfe7ee]", i === 0 && "lg:pl-7")}>
            <Icon className="mt-1 size-10 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
            <div>
              <h2 className="font-display text-[24px] font-bold leading-tight text-lp-ink">{title}</h2>
              <p className="mt-1 max-w-[12rem] text-[17px] leading-snug text-lp-body">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionWaves() {
  return (
    <svg className="pointer-events-none absolute bottom-0 right-0 h-56 w-[60%] md:h-72" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden>
      <path d="M0 260C180 200 360 230 520 170S760 60 800 40V300H0Z" fill="var(--color-lp-pill)" opacity="0.7" />
      <path d="M120 300C300 240 460 260 600 200S780 120 800 110V300Z" fill="var(--color-lp-wave)" opacity="0.6" />
    </svg>
  );
}

function Challenge() {
  return (
    <section id="challenge" className="relative scroll-mt-20 overflow-hidden bg-white">
      <SectionWaves />
      <div className={cn(container, "relative grid gap-10 pb-14 pt-12 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16")}>
        <div className="max-w-[760px]">
          <Eyebrow>The Challenge</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(34px,3.3vw,50px)] font-bold leading-[1.08] tracking-[-0.02em] text-lp-ink">
            Water challenges in Ngomano
          </h2>
          <p className="mt-5 text-[clamp(17px,1.25vw,19.5px)] leading-[1.5] text-lp-body">
            The community faces unreliable pumping, solar downtime, aging pipelines, limited storage, low household rainwater
            harvesting and maintenance constraints, which affect water access and daily livelihoods.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-center lg:pr-24">
          <p className="inline-flex items-center gap-4 rounded-full bg-lp-pill px-9 py-4 text-[19px] font-semibold text-lp-ink">
            <MapPin className="size-6 fill-lp-cyan text-lp-cyan [&>circle]:fill-white [&>circle]:stroke-white" aria-hidden />
            Ngomano
            <span className="h-6 w-px bg-lp-ink/30" aria-hidden />
            <span className="font-medium">Makueni County</span>
          </p>
          <p className="text-[16px] text-lp-body">A pilot proposed under the IFSL water scarcity challenge.</p>
        </div>
      </div>
      <div className={cn(container, "relative pb-20")}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Gauge, t: "Unreliable pumping", d: "Faults are often noticed only when the taps run dry." },
            { icon: Radio, t: "Solar downtime", d: "Low power in daylight stops the pump with no warning." },
            { icon: Wrench, t: "Slow repairs", d: "Remote location and limited technical capacity delay maintenance." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-[#e3edf2] bg-white/85 p-5 backdrop-blur">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lp-pill text-lp-blue"><Icon className="size-5" aria-hidden /></span>
              <span>
                <span className="block font-semibold text-lp-ink">{t}</span>
                <span className="mt-0.5 block text-[15px] text-lp-body">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Gauge, title: "Detect", text: "A monitoring unit reports pump, flow, storage and solar readings every few minutes. Clear rules spot a fault early." },
  { icon: Siren, title: "Alert", text: "The operator and technician are alerted on the dashboard and by SMS, in English or Kiswahili. No smartphone needed." },
  { icon: Wrench, title: "Respond", text: "Acknowledge, assign a local technician and record findings, from the web or by replying to the SMS." },
  { icon: ClipboardCheck, title: "Record", text: "Recovery is confirmed from readings, the incident is closed with a reason, and the repair history builds up." },
];

function Approach() {
  return (
    <section id="approach" className="scroll-mt-20 bg-lp-band">
      <div className={cn(container, "py-16 md:py-24")}>
        <Eyebrow>Our Approach</Eyebrow>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 className="font-display text-[clamp(34px,3.3vw,50px)] font-bold leading-[1.08] tracking-[-0.02em] text-lp-ink">
            One loop, from fault to fix.
          </h2>
          <p className="text-[clamp(17px,1.25vw,19.5px)] leading-[1.5] text-lp-body">
            AquaSentinel strengthens the water system the community already has. It watches, warns the right people and
            keeps the record. It never controls the pump.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-3xl border border-[#e3edf2] bg-white p-6 shadow-[0_10px_30px_rgb(26_70_70/0.06)]">
              <span className="font-display text-[15px] font-bold text-lp-cyan">0{i + 1}</span>
              <span className="mt-4 grid size-12 place-items-center rounded-2xl bg-lp-pill text-lp-blue"><Icon className="size-6" aria-hidden /></span>
              <h3 className="mt-5 font-display text-[24px] font-bold text-lp-ink">{title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-lp-body">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/sign-in" className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-gradient-to-b from-[#0b6d9b] to-lp-blue px-7 text-[17px] font-medium text-white shadow-sm transition hover:brightness-110">
            Try the working system <ArrowRight className="size-5" aria-hidden />
          </Link>
          <span className="text-[15px] text-lp-body">Demo accounts for operator, technician and committee roles.</span>
        </div>
      </div>
    </section>
  );
}

const PILOT: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Radio, title: "Install", text: "A monitoring unit on the existing pump, tank and solar system. How the system is run does not change." },
  { icon: GraduationCap, title: "Train", text: "The operator, local technicians and the water committee, with SMS alerts in Kiswahili and English." },
  { icon: BarChart3, title: "Measure", text: "Time to respond, downtime and repairs completed, against a baseline taken before the pilot starts." },
  { icon: Handshake, title: "Hand over", text: "Records and data that belong to the community, with running costs planned for after the pilot." },
];

function Pilot() {
  return (
    <section id="pilot" className="relative scroll-mt-20 overflow-hidden bg-white">
      <SectionWaves />
      <div className={cn(container, "relative py-16 md:py-24")}>
        <Eyebrow>Pilot in Ngomano</Eyebrow>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 className="font-display text-[clamp(34px,3.3vw,50px)] font-bold leading-[1.08] tracking-[-0.02em] text-lp-ink">
            What a pilot would look like.
          </h2>
          <p className="text-[clamp(17px,1.25vw,19.5px)] leading-[1.5] text-lp-body">
            A proposed pilot under the IFSL water scarcity challenge, to be agreed with the Ngomano community and Makueni
            County. No results are claimed until they are measured.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PILOT.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-3xl border border-[#e3edf2] bg-white/90 p-6 backdrop-blur">
              <span className="grid size-12 place-items-center rounded-2xl bg-lp-pill text-lp-blue"><Icon className="size-6" aria-hidden /></span>
              <h3 className="mt-5 font-display text-[24px] font-bold text-lp-ink">{title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-lp-body">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 inline-flex items-center gap-3 rounded-full bg-lp-pill px-6 py-3 text-[16px] text-lp-ink">
          <MapPin className="size-5 text-lp-cyan" aria-hidden />
          Indicative pilot budget: <b className="font-semibold">KES 350,000</b>
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-lp-band">
      <div className={cn(container, "grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center")}>
        <div>
          <Eyebrow>About</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(34px,3.3vw,50px)] font-bold leading-[1.08] tracking-[-0.02em] text-lp-ink">
            Built for the water systems communities already have.
          </h2>
          <p className="mt-5 text-[clamp(17px,1.25vw,19.5px)] leading-[1.5] text-lp-body">
            AquaSentinel is an independent project developed for the IFSL Digital Innovation Challenge, led by the Kenya Red
            Cross Society and ICHA. It helps keep existing water systems working rather than replacing them. No partnership
            is implied.
          </p>
        </div>
        <div className="rounded-3xl border border-[#e3edf2] bg-white p-7 shadow-[0_10px_30px_rgb(26_70_70/0.06)]">
          <ShieldCheck className="size-8 text-lp-cyan" aria-hidden />
          <h3 className="mt-4 font-display text-[26px] font-bold text-lp-ink">Private by design</h3>
          <p className="mt-2 text-[16px] leading-relaxed text-lp-body">
            AquaSentinel watches water systems, not people. Each team sees only its own site, and the data protection
            approach follows the Kenya Data Protection Act, 2019.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-medium">
            <Link href="/legal" className="text-lp-blue hover:underline">Trust &amp; legal</Link>
            <Link href="/privacy" className="text-lp-blue hover:underline">Privacy</Link>
            <Link href="/security" className="text-lp-blue hover:underline">Security</Link>
            <a href={`mailto:${CONTACT}`} className="text-lp-blue hover:underline">{CONTACT}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-lp-ink text-white">
      <div className={cn(container, "grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]")}>
        <div>
          <Logo inverted height={40} />
          <p className="mt-4 max-w-sm text-[15px] text-white/70">
            Monitor, respond, maintain, improve. AquaSentinel supports the people who keep community water flowing. It never
            controls pumps.
          </p>
        </div>
        <nav aria-label="Website">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">Explore</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {NAV.map((n) => <li key={n.href}><a href={n.href} className="text-white/80 hover:text-white">{n.label}</a></li>)}
            <li><Link href="/sign-in" className="text-white/80 hover:text-white">Sign In</Link></li>
          </ul>
        </nav>
        <nav aria-label="Trust and legal">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">Trust &amp; legal</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            <li><Link href="/privacy" className="text-white/80 hover:text-white">Privacy Notice</Link></li>
            <li><Link href="/terms" className="text-white/80 hover:text-white">Terms of Use</Link></li>
            <li><Link href="/cookies" className="text-white/80 hover:text-white">Cookies</Link></li>
            <li><Link href="/security" className="text-white/80 hover:text-white">Security</Link></li>
            <li><Link href="/legal?lang=sw" className="text-white/80 hover:text-white">Kiswahili</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className={cn(container, "py-5 text-[13px] text-white/50")}>© 2026 AquaSentinel · Ngomano, Makueni County</p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="bg-white text-lp-ink">
      <Header />
      <main>
        <Hero />
        <Pillars />
        <Challenge />
        <Approach />
        <Pilot />
        <About />
      </main>
      <Footer />
    </div>
  );
}
