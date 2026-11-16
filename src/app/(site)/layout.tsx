import { SiteShell } from "@/components/public/site-shell";

/** Public website pages share one header and footer, so moving between them never reloads the chrome. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
