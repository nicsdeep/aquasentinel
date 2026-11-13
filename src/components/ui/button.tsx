import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * CTA ladder. Orange is earned: at most ONE `primary` per screen (or per dialog). Two is already noise.
 * - primary: the single most important action (orange)
 * - dark: strong action on light surfaces
 * - secondary: outline, for alternatives
 * - ghost / link: low-emphasis actions
 * - danger: destructive actions only
 */
type Variant = "primary" | "dark" | "secondary" | "ghost" | "link" | "danger";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "rounded-full bg-as-orange text-white hover:brightness-95 shadow-sm",
  dark: "rounded-full bg-as-dark text-white hover:bg-as-deep dark:bg-as-teal dark:text-as-dark",
  secondary: "rounded-full border border-line bg-surface text-ink hover:bg-surface-muted",
  ghost: "rounded-full text-ink hover:bg-surface-muted",
  link: "text-accent underline-offset-4 hover:underline",
  danger: "rounded-full bg-crit text-white hover:opacity-90",
};

// Touch targets are at least 44 px high (PROJECT_RULES §6).
const SIZES: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "dark", size = "md", loading = false, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        variant !== "link" && SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
