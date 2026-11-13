import type { Metadata, Viewport } from "next";
import { Archivo, Barlow } from "next/font/google";
import type { ReactNode } from "react";
import { getSiteSeo } from "@/server/seo";
import "../styles.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-archivo",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-barlow",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await getSiteSeo();
  const siteUrl = process.env["SITE_URL"]?.trim() || "https://altair-academy.netlify.app/";
  const siteName = siteSeo?.siteName || "Altair Academy";
  const description =
    siteSeo?.defaultDescription ||
    "Accredited NDT, corrosion, BIM and management system training led by practising industry specialists.";

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: `${siteName} — Accredited Technical Training`,
    description,
    authors: [{ name: siteName }],
    openGraph: {
      title: `${siteName} — Accredited Technical Training`,
      description: "Practitioner-led technical certification training for industry professionals.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      ...(siteSeo?.twitterSite ? { site: siteSeo.twitterSite } : {}),
    },
    icons: {
      icon: "/favicon.png",
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
