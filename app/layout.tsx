import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Serif_SC, Outfit } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HanziLane",
  description:
    "A DuChinese-like Chinese reading app with public starter stories, private AI generation, Better Auth, Prisma, and Postgres.",
  manifest: "/manifest.webmanifest",
  applicationName: "HanziLane",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HanziLane",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${notoSerifSc.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col text-[#241815]">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
