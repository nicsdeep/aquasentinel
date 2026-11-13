import { cn } from "@/lib/cn";

/** The tiny signal above a heading: section or context label. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("type-eyebrow text-accent", className)}>{children}</p>;
}
