import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AquaSentinel", template: "%s · AquaSentinel" },
  description: "Community water-system monitoring and maintenance. Detect early. Respond locally. Keep water flowing.",
  applicationName: "AquaSentinel",
  // Every logo file lives in public/brand (docs/DESIGN_SYSTEM.md §07).
  icons: { icon: { url: "/brand/icon.png", type: "image/png", sizes: "256x256" }, apple: { url: "/brand/apple-icon.png", sizes: "180x180" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1515" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
