/**
 * Static Site Data & Shared Constants
 *
 * Contains static datasets that remain unchanged: contact information,
 * navigation menus, and training formats.
 * Dynamic entities (Courses, Categories, Team, News, FAQs, Testimonials, Upcoming Intakes) are now stored in MongoDB.
 *
 * Location: src/data/site.ts
 * Type: Static Data Module
 */

export type Category = {
  id?: string;
  slug: string;
  name: string;
  short: string;
  order?: number;
};

export type Subcategory = {
  id?: string;
  slug: string;
  name: string;
  order?: number;
  parentId?: string | null;
};

export type Course = {
  id?: string;
  slug: string;
  title: string;
  image: string | null;
  categoryId?: string;
  categorySlug?: string;
  category?: Category;
  subcategoryId?: string | null;
  subcategory?: {
    name: string;
    slug: string;
  } | null;
  level?: string | null;
  duration: string;
  price: string;
  summary: string;
  isFeatured?: boolean;
  order?: number;
};

export type TeamMember = {
  id?: string;
  slug: string;
  name: string;
  instructorName?: string | null;
  role: string;
  instructorRole?: string | null;
  image: string | null;
  shortBio: string;
  fullBio?: string | null;
  expertise?: string[];
  placements?: ("MANAGEMENT" | "INSTRUCTOR")[];
};

export type Instructor = {
  id?: string;
  slug: string;
  name: string;
  role: string;
  image?: string | null;
  bio: string;
  expertise: string[];
};

export const courseExtras: Record<
  string,
  { highlights: string[]; instructor: { name: string; role: string } }
> = {
  "visual-testing-vt": {
    highlights: [
      "Optics, lighting & surface conditions",
      "ISO 9712 acceptance criteria",
      "Practical reporting workshop",
    ],
    instructor: { name: "Shaik Khaja Mohiuddin", role: "Lead NDT Instructor" },
  },
  "weld-inspection-wi": {
    highlights: [
      "Weld processes & discontinuities",
      "Code interpretation practice",
      "Hands-on joint assessment",
    ],
    instructor: { name: "Sirajul Hameed Mansoor", role: "Senior Welding Inspector" },
  },
  "iso-50001-energy-management": {
    highlights: [
      "Energy baselines & EnPIs",
      "Internal review technique",
      "Documented information set",
    ],
    instructor: { name: "Nurul Aziz", role: "Management Systems Lead" },
  },
  "infrastructure-asset-assessment-bim": {
    highlights: [
      "Model-based asset workflows",
      "Common data environments",
      "Coordination & clash review",
    ],
    instructor: { name: "Daniel Choo", role: "BIM Coordinator" },
  },
};

export const trainingFormats = [
  {
    name: "Public Classroom",
    tagline: "Open enrolment",
    price: "From RM1,800",
    unit: "/ seat",
    featured: false,
    benefits: ["Fixed monthly calendar", "Mixed-industry cohorts", "Practical lab access"],
  },
  {
    name: "In-House Training",
    tagline: "Most requested",
    price: "Custom quote",
    unit: "/ cohort",
    featured: true,
    benefits: ["Delivered at your site", "Content mapped to your assets", "Team competency report"],
  },
  {
    name: "Live Online",
    tagline: "Remote teams",
    price: "From RM1,200",
    unit: "/ seat",
    featured: false,
    benefits: ["Instructor-led sessions", "Recorded for revision", "Digital assessment"],
  },
];
