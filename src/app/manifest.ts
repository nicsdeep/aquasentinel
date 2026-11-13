import type { MetadataRoute } from "next";

/** Installable on Android and iPhone home screens. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AquaSentinel",
    short_name: "AquaSentinel",
    description: "Community water-system monitoring and maintenance.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#0a2b4a",
    icons: [{ src: "/icon.png", sizes: "288x288", type: "image/png" }],
  };
}
