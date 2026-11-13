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
      <span className="text-lg font-bold tracking-tight">
        <span className={inverted ? "text-white" : "text-navy-800 dark:text-white"}>Aqua</span>
        <span className="text-teal-600 dark:text-sky-500">Sentinel</span>
      </span>
    </span>
  );
}
