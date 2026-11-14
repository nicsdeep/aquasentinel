import type { MetadataRoute } from "next";

/** Installable on Android and iPhone home screens. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AquaSentinel",
    short_name: "AquaSentinel",
    description: "Community water-system monitoring and maintenance.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f6f6",
    theme_color: "#003a72",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
