import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NavigationTracker } from "@/lib/nav-history";
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
  themeColor: "#f4f6f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        {children}
        <Suspense>
          <NavigationTracker />
        </Suspense>
      </body>
    </html>
  );
}
