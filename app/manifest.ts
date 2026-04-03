import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HanziLane",
    short_name: "HanziLane",
    description:
      "Chinese reading practice with graded stories, series, vocabulary tracking, and AI-generated lessons.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f0e8",
    theme_color: "#ea4e47",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
