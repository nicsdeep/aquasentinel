"use client";

import { useSearchParams } from "next/navigation";
import type { Lang } from "@/lib/legal/content";

/** Language of the trust & legal pages, kept in the URL (?lang=sw) so every page can be linked in Kiswahili. */
export function useLang(): { lang: Lang; href: (path: string) => string } {
  const lang: Lang = useSearchParams().get("lang") === "sw" ? "sw" : "en";
  return { lang, href: (path) => (lang === "sw" ? `${path}${path.includes("?") ? "&" : "?"}lang=sw` : path) };
}
