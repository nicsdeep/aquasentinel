import Image from "next/image";
import { cn } from "@/lib/cn";

/** Approved AquaSentinel logo and wordmark (PROJECT_RULES §6: do not redesign). */
export function Logo({ size = 36, inverted = false, className }: { size?: number; inverted?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/aquasentinel-logo.svg"
        alt="AquaSentinel logo"
        width={size}
        height={size}
        priority
        unoptimized
        className={cn("rounded-lg", inverted && "bg-white p-0.5")}
      />
      <span className="text-lg font-semibold tracking-tight">
        <span className={inverted ? "text-white" : "text-ink"}>Aqua</span>
        <span className={inverted ? "text-as-teal" : "text-accent"}>Sentinel</span>
      </span>
    </span>
  );
}
