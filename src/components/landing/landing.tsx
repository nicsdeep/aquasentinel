"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, BarChart3, Bell, ClipboardCheck, Droplet, Gauge, GraduationCap, Handshake, MapPin, Menu, Radio, ShieldCheck,
  Siren, Wrench, X, type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CONTACT } from "@/lib/legal/content";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

/*
 * Public website: the first thing anyone sees before signing in (owner's approved reference, 16 Nov 2026).
 * Facts about Ngomano come only from the IFSL Digital Innovation Challenge information pack, §3.2 "Scarcity of Water".
 * AquaSentinel capabilities are described as *proposed*: nothing here claims a deployment, partnership or result.
 * The hero photo is illustrative, not a picture of the Ngomano site.
 */

const NAV = [
  { href: "#challenge", label: "The Challenge" },
  { href: "#approach", label: "Our Approach" },
  { href: "#pilot", label: "Pilot in Ngomano", strong: true },
  { href: "#about", label: "About" },
];

const container = "mx-auto w-full max-w-[1540px] px-5 md:px-8";
const h2 = "lp-heading text-[clamp(40px,3.9vw,65px)] leading-[1.02] tracking-[-0.01em] text-lp-ink";
const lead = "text-[clamp(17px,1.2vw,19.5px)] leading-[1.5] text-lp-body";

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

/** Same open row style as the approved Monitor / Respond / Maintain / Improve band: icon, serif title, short text. */
function IconRow({ items, numbered = false }: { items: { icon: LucideIcon; title: string; text: string }[]; numbered?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className={cn("flex gap-5 lg:px-8", i > 0 && "lg:border-l lg:border-[#dfe7ee]", i === 0 && "lg:pl-0")}>
          <Icon className="mt-1 size-10 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="lp-heading text-[27px] leading-tight text-lp-ink">
              {numbered && <span className="mr-2 text-lp-cyan">{i + 1}.</span>}
              {title}
            </h3>
            <p className="mt-1 text-[17px] leading-snug text-lp-body">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  // Signed-in people keep their role-based experience: the header offers their dashboard instead of Sign In.
  useEffect(() => {
    getSupabase()?.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  const cta = signedIn ? { href: "/dashboard", label: "Dashboard" } : { href: "/sign-in", label: "Sign In" };
  return (
    <header className="relative z-20 bg-white/95 backdrop-blur">
      <div className={cn(container, "flex h-[72px] items-center gap-6 md:h-[82px]")}>
        <Link href="/" aria-label="AquaSentinel home" className="shrink-0">
          <Logo height={70} className="hidden md:block" />
          <Logo height={38} className="md:hidden" />
        </Link>
        <nav className="ml-auto hidden items-center gap-12 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={cn("text-[18px] text-lp-ink transition-colors hover:text-lp-blue", n.strong && "font-semibold")}>
              {n.label}
            </a>
          ))}
        </nav>
        <Link href={cta.href} className="ml-auto inline-flex h-11 items-center rounded-xl bg-lp-blue-deep px-6 text-[17px] font-medium text-white shadow-sm transition hover:brightness-110 lg:ml-6 lg:h-12">
          {cta.label}
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
      {/* Photo (illustrative): right side, fading softly into the page on the left */}
      <div className="relative h-64 w-full sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[66%]">
        <Image
          src="/landing/hero.jpg"
          alt="Illustration of a rural water-pumping facility: an elevated water tank, a pump house and pipework in a dry landscape"
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover object-[70%_center] lg:object-right [mask-image:linear-gradient(to_bottom,black_75%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_32%)]"
        />
      </div>
      <div className={cn(container, "relative z-10 pb-24 pt-8 md:pb-32 lg:min-h-[460px] lg:pb-20 lg:pt-12")}>
        <div className="max-w-[790px]">
          <Eyebrow>IFSL Water Scarcity Challenge</Eyebrow>
          <h1 className="lp-heading mt-4 text-[clamp(44px,4.6vw,77px)] leading-[0.95] tracking-[-0.01em] text-lp-ink">
            A smarter way to <br className="hidden sm:block" />
            manage community water.
          </h1>
          <p className={cn(lead, "mt-4 max-w-[560px]")}>
            AquaSentinel is a proposed solution to help communities like Ngomano monitor water infrastructure, respond to
            problems and organise maintenance for more reliable water access.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 md:mt-8 md:gap-6">
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

// Line breaks follow the approved reference: Monitor and Improve wrap onto two lines, Respond and Maintain stay on one.
const PILLARS: { icon: LucideIcon; title: string; text: string; width: string }[] = [
  { icon: Droplet, title: "Monitor", text: "Keep an eye on key water infrastructure", width: "max-w-[10.5rem]" },
  { icon: Bell, title: "Respond", text: "Raise and track issues quickly", width: "max-w-none" },
  { icon: Wrench, title: "Maintain", text: "Organise and follow up on repairs", width: "lg:whitespace-nowrap" },
  { icon: BarChart3, title: "Improve", text: "Support more reliable water services", width: "max-w-[11.5rem]" },
];

function Pillars() {
  return (
    <section className="bg-lp-band" aria-label="What AquaSentinel does">
      <ul className={cn(container, "grid grid-cols-1 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-6")}>
        {PILLARS.map(({ icon: Icon, title, text, width }, i) => (
          <li key={title} className={cn("flex gap-5 lg:px-8", i > 0 && "lg:border-l lg:border-[#dfe7ee]", i === 0 && "lg:pl-7")}>
            <Icon className="mt-1 size-10 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
            <div>
              <h2 className="lp-heading text-[31px] leading-tight text-lp-ink">{title}</h2>
              <p className={cn("mt-1 text-[17px] leading-snug text-lp-body", width)}>{text}</p>
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

/** Documented facts only: IFSL information pack, §3.2 "Scarcity of Water". */
const DOCUMENTED = [
  "Over 65% of households are in IPC Phase 2 (Stressed), with inadequate water, sanitation and hygiene conditions.",
  "Despite being close to the River Athi, only a handful of households irrigate, because of unreliable pumping systems, solar downtime, aging pipelines and a lack of elevated water storage.",
  "Water is pumped from the river into a pan, which raises energy costs and operational downtime.",
  "Few households have been able to set up the rainwater harvesting that policy requires.",
  "Limited technical capacity, weak governance and the community's remoteness from service providers make the infrastructure hard to maintain.",
  "There are no community structures in place to oversee the infrastructure, exposing it to neglect and corrosion over time.",
];

function Challenge() {
  return (
    <section id="challenge" className="relative scroll-mt-20 overflow-hidden bg-white">
      <SectionWaves />
      <div className={cn(container, "relative grid gap-10 pb-12 pt-12 md:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16")}>
        <div className="max-w-[760px]">
          <Eyebrow>The Challenge</Eyebrow>
          <h2 className={cn(h2, "mt-5")}>Water challenges in Ngomano</h2>
          <p className={cn(lead, "mt-5")}>
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
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-lp-navy">What the challenge document records</p>
        <ul className="mt-5 grid max-w-[1100px] gap-x-12 gap-y-4 md:grid-cols-2">
          {DOCUMENTED.map((d) => (
            <li key={d} className="flex gap-4 text-[17px] leading-relaxed text-lp-body">
              <span className="mt-3 h-[2px] w-5 shrink-0 bg-lp-cyan" aria-hidden />
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[14px] text-lp-body/80">
          Source: IFSL Digital Innovation Challenge, Lower Eastern information pack, section 3.2 &ldquo;Scarcity of Water&rdquo;.
        </p>
      </div>
    </section>
  );
}

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Gauge, title: "Detect", text: "A monitoring unit would report pump, flow, storage and solar readings, and clear rules would spot a fault early." },
  { icon: Siren, title: "Alert", text: "The operator and technician would be alerted on a dashboard and by SMS, in English or Kiswahili." },
  { icon: Wrench, title: "Respond", text: "The team would acknowledge, assign a local technician and record findings, on the web or by SMS reply." },
  { icon: ClipboardCheck, title: "Record", text: "Recovery would be confirmed from readings and each repair kept, building the system's maintenance history." },
];

function Approach() {
  return (
    <section id="approach" className="scroll-mt-20 bg-lp-band">
      <div className={cn(container, "py-16 md:py-24")}>
        <Eyebrow>Our Approach</Eyebrow>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 className={h2}>One loop, from fault to fix.</h2>
          <p className={lead}>
            AquaSentinel is designed to strengthen the water system the community already has: watch it, warn the right
            people and keep the record. It would never control the pump.
          </p>
        </div>
        <div className="mt-12">
          <IconRow items={STEPS} numbered />
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/sign-in" className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-gradient-to-b from-[#0b6d9b] to-lp-blue px-7 text-[17px] font-medium text-white shadow-sm transition hover:brightness-110">
            Explore the prototype <ArrowRight className="size-5" aria-hidden />
          </Link>
          <span className="text-[15px] text-lp-body">Working software with demonstration accounts. No field sensors are installed yet.</span>
        </div>
      </div>
    </section>
  );
}

const PILOT: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Radio, title: "Install", text: "A monitoring unit on the existing pump, storage and solar system, without changing how the system is run." },
  { icon: GraduationCap, title: "Train", text: "The operator, local technicians and a water committee, with SMS alerts in Kiswahili and English." },
  { icon: BarChart3, title: "Measure", text: "Response time, downtime and repairs completed, against a baseline taken before the pilot starts." },
  { icon: Handshake, title: "Hand over", text: "Records that belong to the community, with running costs planned for after the pilot." },
];

function Pilot() {
  return (
    <section id="pilot" className="relative scroll-mt-20 overflow-hidden bg-white">
      <SectionWaves />
      <div className={cn(container, "relative py-16 md:py-24")}>
        <Eyebrow>Pilot in Ngomano</Eyebrow>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 className={h2}>What a pilot would look like.</h2>
          <p className={lead}>
            A proposed pilot under the IFSL water scarcity challenge, to be agreed with the Ngomano community and Makueni
            County. No results are claimed until they are measured.
          </p>
        </div>
        <div className="mt-12">
          <IconRow items={PILOT} />
        </div>
        <p className="mt-12 inline-flex items-center gap-3 rounded-full bg-lp-pill px-6 py-3 text-[16px] text-lp-ink">
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
      <div className={cn(container, "grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center")}>
        <div>
          <Eyebrow>About</Eyebrow>
          <h2 className={cn(h2, "mt-5")}>Built for the water systems communities already have.</h2>
          <p className={cn(lead, "mt-5")}>
            AquaSentinel is an independent project developed for the IFSL Digital Innovation Challenge, led by the Kenya Red
            Cross Society and the International Center for Humanitarian Affairs (ICHA). It aims to keep existing water systems
            working rather than replacing them. No partnership is implied.
          </p>
        </div>
        <div className="flex gap-5 border-l-2 border-lp-cyan/40 pl-6">
          <ShieldCheck className="mt-1 size-10 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="lp-heading text-[30px] leading-tight text-lp-ink">Private by design</h3>
            <p className="mt-2 text-[17px] leading-relaxed text-lp-body">
              AquaSentinel watches water systems, not people. Each team would see only its own site, and data protection follows
              the Kenya Data Protection Act, 2019.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-medium">
              <Link href="/legal" className="text-lp-blue hover:underline">Trust &amp; legal</Link>
              <Link href="/privacy" className="text-lp-blue hover:underline">Privacy</Link>
              <Link href="/security" className="text-lp-blue hover:underline">Security</Link>
              <a href={`mailto:${CONTACT}`} className="text-lp-blue hover:underline">{CONTACT}</a>
            </div>
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
            Monitor, respond, maintain, improve. A proposed tool to support the people who keep community water flowing. It
            would never control pumps.
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
