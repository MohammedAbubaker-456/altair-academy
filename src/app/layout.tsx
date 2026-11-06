import type { Metadata, Viewport } from "next";
import { Archivo, Barlow } from "next/font/google";
import type { ReactNode } from "react";
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

const siteUrl = process.env["SITE_URL"]?.trim();

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Altair Academy — Accredited Technical Training",
  description:
    "Accredited NDT, corrosion, BIM and management system training led by practising industry specialists.",
  authors: [{ name: "Altair Academy" }],
  openGraph: {
    title: "Altair Academy — Accredited Technical Training",
    description: "Practitioner-led technical certification training for industry professionals.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${barlow.variable}`}>
      <body>{children}
      </body>
    </html>
  );
}
