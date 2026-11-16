import { BarChart3, Bell, ClipboardCheck, Droplet, Gauge, GraduationCap, Handshake, Info, Layers, MapPin, Radio, Siren, Users, Wrench, type LucideIcon } from "lucide-react";

/*
 * Public website content, in one place so nothing is written twice.
 * Facts about Ngomano come only from the IFSL Digital Innovation Challenge information pack, section 3.2
 * "Scarcity of Water". AquaSentinel capabilities are described as proposed: no deployment, partnership,
 * sensor installation or result is claimed.
 */

export const SITE_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/challenge", label: "The Challenge", icon: Droplet },
  { href: "/approach", label: "Our Approach", icon: Layers },
  { href: "/pilot", label: "Pilot in Ngomano", icon: MapPin },
  { href: "/about", label: "About", icon: Users },
];

export const SITE_SECONDARY: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/contact", label: "Contact", icon: Info },
];

export const SOURCE_NOTE = "Source: IFSL Digital Innovation Challenge, Lower Eastern information pack, section 3.2 “Scarcity of Water”.";

export const CHALLENGE_SUMMARY =
  "The community faces unreliable pumping, solar downtime, aging pipelines, limited storage, low household rainwater harvesting and maintenance constraints, which affect water access and daily livelihoods.";

/** Section 3.2, grouped so a visitor can scan it. Wording stays close to the document. */
export const CHALLENGE_GROUPS: { title: string; facts: string[] }[] = [
  {
    title: "Water access",
    facts: [
      "Ngomano faces acute food and livelihood insecurity, driven by chronic droughts, weak agricultural infrastructure and poor access to water and sanitation.",
      "Over 65% of households are in IPC Phase 2 (Stressed), with inadequate water, sanitation and hygiene conditions.",
    ],
  },
  {
    title: "Infrastructure",
    facts: [
      "Despite being close to the River Athi, only a handful of households irrigate, because of unreliable pumping systems, solar downtime, aging pipelines and a lack of elevated water storage.",
      "Water is pumped from the river into a pan, which raises energy costs and operational downtime.",
      "Few households have been able to set up the rainwater harvesting that policy requires.",
    ],
  },
  {
    title: "Maintenance and governance",
    facts: [
      "Limited technical capacity to maintain and operate the infrastructure, and weak governance, reduce productivity and resilience.",
      "The community is remote and far from towns that could provide the parts and services needed to maintain the systems.",
      "There are no community structures in place to oversee the infrastructure, exposing it to neglect and corrosion over time.",
    ],
  },
];

export const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Gauge, title: "Detect", text: "A monitoring unit would report pump, flow, storage and solar readings, and clear rules would spot a fault early." },
  { icon: Siren, title: "Alert", text: "The operator and technician would be alerted on a dashboard and by SMS, in English or Kiswahili." },
  { icon: Wrench, title: "Respond", text: "The team would acknowledge, assign a local technician and record findings, on the web or by SMS reply." },
  { icon: ClipboardCheck, title: "Record", text: "Recovery would be confirmed from readings and each repair kept, building the system's maintenance history." },
];

export const PILOT_STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Radio, title: "Install", text: "A monitoring unit on the existing pump, storage and solar system, without changing how the system is run." },
  { icon: GraduationCap, title: "Train", text: "The operator, local technicians and a water committee, with SMS alerts in Kiswahili and English." },
  { icon: BarChart3, title: "Measure", text: "Response time, downtime and repairs completed, against a baseline taken before the pilot starts." },
  { icon: Handshake, title: "Hand over", text: "Records that belong to the community, with running costs planned for after the pilot." },
];

export const PILLARS: { icon: LucideIcon; title: string; text: string; width: string }[] = [
  { icon: Droplet, title: "Monitor", text: "Keep an eye on key water infrastructure", width: "max-w-[10.5rem]" },
  { icon: Bell, title: "Respond", text: "Raise and track issues quickly", width: "max-w-none" },
  { icon: Wrench, title: "Maintain", text: "Organise and follow up on repairs", width: "lg:whitespace-nowrap" },
  { icon: BarChart3, title: "Improve", text: "Support more reliable water services", width: "max-w-[11.5rem]" },
];

export const PILOT_STRIP = {
  place: "Ngomano, Makueni County",
  text: "A pilot proposed under the IFSL water scarcity challenge.",
};
