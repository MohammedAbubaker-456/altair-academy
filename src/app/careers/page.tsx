import type { Metadata } from "next";
import { CareersContent } from "@/components/site/CareersContent";

export const metadata: Metadata = {
  title: "Careers at Altair Academy — Join Our NDT Training Team",
  description:
    "Open roles for NDT Level III instructors, assessors and training coordinators at Altair Academy. Submit your resume and join our team.",
  openGraph: {
    title: "Careers at Altair Academy",
    description: "Teach what you practise — instructor, assessor and coordinator openings at Altair Academy.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function CareersPage() {
  return <CareersContent />;
}
