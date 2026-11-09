/**
 * SEO Page Registry and Built-in Baseline Defaults
 *
 * Single source of truth for all public pages, detail templates, and their
 * baseline metadata defaults. When no database overrides exist in PageSeo or SiteSeo,
 * these values produce 100% byte-for-byte identical metadata tags to the original site.
 *
 * Location: src/lib/seo/registry.ts
 * Type: Shared Constants & Types Module
 */

export type SeoPageGroup = "Main pages" | "Legal" | "Detail pages";

export interface SeoPageDefault {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogType: "website" | "article";
  twitterCard: "summary_large_image" | "summary";
  noIndex: boolean;
  ogImage?: string | null;
}

export interface SeoRegistryItem {
  key: string;
  label: string;
  path: string;
  group: SeoPageGroup;
  isTemplate?: boolean;
  allowedPlaceholders?: string[];
  defaults: SeoPageDefault;
}

export const SEO_REGISTRY: Record<string, SeoRegistryItem> = {
  home: {
    key: "home",
    label: "Home Page",
    path: "/",
    group: "Main pages",
    defaults: {
      title: "Altair Academy — Accredited Technical Training in Malaysia",
      description:
        "Altair Academy delivers accredited NDT, corrosion, BIM and management system training led by practising industry specialists. Explore courses and enrol today.",
      ogTitle: "Altair Academy — Accredited Technical Training",
      ogDescription:
        "Hands-on inspection, integrity and management system courses taught by working industry specialists.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  about: {
    key: "about",
    label: "About Us",
    path: "/about",
    group: "Main pages",
    defaults: {
      title: "About Altair Academy — Global Leaders of Tomorrow",
      description:
        "Altair Academy is a BINDT-approved training organisation delivering NDT, API-ICP, BIM, corrosion and management system courses led by practising specialists.",
      ogTitle: "About Altair Academy",
      ogDescription:
        "Who we are, our mission, vision, core values and the management team behind Altair Academy.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  calendar: {
    key: "calendar",
    label: "Training Calendar",
    path: "/calendar",
    group: "Main pages",
    defaults: {
      title: "2026 Training Calendar | Altair Academy",
      description:
        "Altair Academy 2026 NDT Level 2 training and examination calendar for UT, MT, PT, PAUT, TOFD and RI courses.",
      ogTitle: "2026 Training Calendar | Altair Academy",
      ogDescription:
        "Month-by-month NDT Level 2 training and examination dates at Altair Academy.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  careers: {
    key: "careers",
    label: "Careers & Openings",
    path: "/careers",
    group: "Main pages",
    defaults: {
      title: "Careers at Altair Academy — Join Our NDT Training Team",
      description:
        "Open roles for NDT Level III instructors, assessors and training coordinators at Altair Academy. Submit your resume and join our team.",
      ogTitle: "Careers at Altair Academy",
      ogDescription:
        "Teach what you practise — instructor, assessor and coordinator openings at Altair Academy.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  contact: {
    key: "contact",
    label: "Contact Us",
    path: "/contact",
    group: "Main pages",
    defaults: {
      title: "Contact Altair Academy — Enrol or Ask a Question",
      description:
        "Reach the Altair Academy training team by phone, WhatsApp or email to choose a course or arrange in-house training.",
      ogTitle: "Contact Altair Academy",
      ogDescription:
        "Phone, WhatsApp, email and office hours for our training team.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  courses: {
    key: "courses",
    label: "Course Catalog",
    path: "/courses",
    group: "Main pages",
    defaults: {
      title: "Technical Training Courses — Altair Academy",
      description:
        "Browse Altair Academy courses across NDT, corrosion, BIM, management systems, plant maintenance and more.",
      ogTitle: "Technical Training Courses — Altair Academy",
      ogDescription:
        "Browse accredited technical courses by category, level, duration and price.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  instructors: {
    key: "instructors",
    label: "Instructors Directory",
    path: "/instructors",
    group: "Main pages",
    defaults: {
      title: "Instructors — Altair Academy",
      description:
        "Meet the practising NDT, corrosion, BIM and management system specialists who lead every Altair Academy training programme.",
      ogTitle: "Leading Instructors — Altair Academy",
      ogDescription:
        "Practising specialists in NDT, welding, corrosion, BIM and quality leading every Altair class.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  news: {
    key: "news",
    label: "News & Insights",
    path: "/news",
    group: "Main pages",
    defaults: {
      title: "News & Training Updates — Altair Academy",
      description:
        "Course schedule announcements, accreditation news, industry notes and centre updates from Altair Academy's NDT and inspection training team.",
      ogTitle: "News & Training Updates — Altair Academy",
      ogDescription:
        "Intake announcements, accreditation updates and inspection industry notes from Altair Academy.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  "newsletter-unsubscribe": {
    key: "newsletter-unsubscribe",
    label: "Newsletter Unsubscribe",
    path: "/newsletter/unsubscribe",
    group: "Main pages",
    defaults: {
      title: "Unsubscribe from Newsletter | Altair Academy",
      description:
        "Accredited NDT, corrosion, BIM and management system training led by practising industry specialists.",
      ogTitle: "Altair Academy — Accredited Technical Training",
      ogDescription:
        "Practitioner-led technical certification training for industry professionals.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: true,
    },
  },
  search: {
    key: "search",
    label: "Course Search",
    path: "/search",
    group: "Main pages",
    defaults: {
      title: "Search Courses — Altair Academy",
      description: "Search Altair Academy's technical training catalogue.",
      ogTitle: "Search Courses — Altair Academy",
      ogDescription: "Find the right accredited technical course.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: true,
    },
  },
  privacy: {
    key: "privacy",
    label: "Privacy Policy",
    path: "/privacy",
    group: "Legal",
    defaults: {
      title: "Privacy Policy — Altair Academy",
      description:
        "How Altair Academy collects, uses and protects personal data from enquiries and enrolments.",
      ogTitle: "Privacy Policy — Altair Academy",
      ogDescription:
        "How Altair Academy collects, uses and protects personal data from enquiries and enrolments.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  terms: {
    key: "terms",
    label: "Terms of Service",
    path: "/terms",
    group: "Legal",
    defaults: {
      title: "Terms of Service — Altair Academy",
      description:
        "Enrolment, payment, rescheduling and cancellation terms for Altair Academy training courses.",
      ogTitle: "Terms of Service — Altair Academy",
      ogDescription:
        "Enrolment, payment, rescheduling and cancellation terms for Altair Academy training courses.",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  "course-detail": {
    key: "course-detail",
    label: "Course Detail Template",
    path: "/courses/[slug]",
    group: "Detail pages",
    isTemplate: true,
    allowedPlaceholders: ["{title}", "{summary}", "{category}", "{level}"],
    defaults: {
      title: "{title} — Altair Academy",
      description: "{summary}",
      ogTitle: "{title} — Altair Academy",
      ogDescription: "{summary}",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  "news-detail": {
    key: "news-detail",
    label: "News Article Template",
    path: "/news/[slug]",
    group: "Detail pages",
    isTemplate: true,
    allowedPlaceholders: ["{title}", "{excerpt}", "{category}"],
    defaults: {
      title: "{title} — Altair Academy",
      description: "{excerpt}",
      ogTitle: "{title} — Altair Academy",
      ogDescription: "{excerpt}",
      ogType: "article",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  "team-detail": {
    key: "team-detail",
    label: "Team Member Profile Template",
    path: "/team/[slug]",
    group: "Detail pages",
    isTemplate: true,
    allowedPlaceholders: ["{name}", "{role}", "{bio}"],
    defaults: {
      title: "{name}, {role} — Altair Academy",
      description: "{bio}",
      ogTitle: "{name} — Altair Academy",
      ogDescription: "{bio}",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
  "legal-detail": {
    key: "legal-detail",
    label: "Custom Legal Page Template",
    path: "/legal/[slug]",
    group: "Detail pages",
    isTemplate: true,
    allowedPlaceholders: ["{title}"],
    defaults: {
      title: "{title} — Altair Academy",
      description: "{title} — Altair Academy",
      ogTitle: "{title} — Altair Academy",
      ogDescription: "{title} — Altair Academy",
      ogType: "website",
      twitterCard: "summary_large_image",
      noIndex: false,
    },
  },
};

export const ALL_REGISTRY_KEYS = Object.keys(SEO_REGISTRY);

export function getRegistryItem(key: string): SeoRegistryItem | undefined {
  return SEO_REGISTRY[key];
}

export function getAllRegistryItems(): SeoRegistryItem[] {
  return Object.values(SEO_REGISTRY);
}

export function isRegistryKey(key: string): boolean {
  return key in SEO_REGISTRY;
}

export function getPlaceholdersForTemplate(key: string): string[] {
  return SEO_REGISTRY[key]?.allowedPlaceholders ?? [];
}

