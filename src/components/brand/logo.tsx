import Image from "next/image";
import { cn } from "@/lib/cn";

/*
 * Approved AquaSentinel logo (owner's logo kit, 14 Nov 2026; all files in public/brand, masters in originals/).
 * Use the artwork as supplied: never redraw, recolour or retype it.
 * - logo.png:  navy wordmark, for light backgrounds.
 * - logo2.png: white wordmark ("Logo2"), for dark backgrounds such as the sidebar.
 * - logo-mark.png: the "a" water mark alone, for tight square spaces.
 */
const RATIO = 576 / 160; // horizontal artwork width : height

export function Logo({
  height = 36,
  inverted = false,
  variant = "full",
  className,
}: {
  height?: number;
  inverted?: boolean;
  variant?: "full" | "mark";
  className?: string;
}) {
  if (variant === "mark") {
    return <Image src="/brand/logo-mark.png" alt="AquaSentinel" width={height} height={height} priority unoptimized className={className} />;
  }
  return (
    <Image
      src={inverted ? "/brand/logo2.png" : "/brand/logo.png"}
      alt="AquaSentinel"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      unoptimized
      className={cn("h-auto select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}
