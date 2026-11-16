import { Ban, Cookie, Eye, Feather, Hand, KeyRound, Lock, Power, Server, Siren, Smartphone, Users, type LucideIcon } from "lucide-react";
import type { IconKey } from "@/lib/legal/content";

export const LEGAL_ICONS: Record<IconKey, LucideIcon> = {
  feather: Feather, ban: Ban, users: Users, lock: Lock, hand: Hand, cookie: Cookie,
  power: Power, siren: Siren, phone: Smartphone, key: KeyRound, eye: Eye, server: Server,
};
