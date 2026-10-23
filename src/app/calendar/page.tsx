import type { Metadata } from "next";
import { CalendarContent } from "@/components/site/CalendarContent";

export const metadata: Metadata = {
  title: "2026 Training Calendar | Altair Academy",
  description:
    "Altair Academy 2026 NDT Level 2 training and examination calendar for UT, MT, PT, PAUT, TOFD and RI courses.",
  openGraph: {
    title: "2026 Training Calendar | Altair Academy",
    description: "Month-by-month NDT Level 2 training and examination dates at Altair Academy.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function CalendarPage() {
  return <CalendarContent />;
}
