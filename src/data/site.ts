/**
 * Static Site Data & Shared Constants
 *
 * Contains static datasets that remain unchanged: contact information,
 * navigation menus, testimonials, upcoming sessions, and training formats.
 * Dynamic entities (Courses, Categories, Team, News, FAQs) are now stored in MongoDB.
 *
 * Location: src/data/site.ts
 * Type: Static Data Module
 */

export { courseMenu, type CourseMenuItem } from "./menu";

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

export const testimonials = [
  {
    quote:
      "Altair is the best of all the staff at Altair are friendly. The most important thing is that the instructor makes the material easy to understand by everyone.",
    name: "Syafiq",
    company: "Lac Inspection Sdn Bhd",
  },
  {
    quote:
      "Very professional training center. Thanks to the training and knowledge acquired at Altair, I was able without a problem to pass the exam and have a very solid foundation in understanding the techniques.",
    name: "Stefan",
    company: "Ocean Technology",
  },
  {
    quote:
      "An overall excellent learning and training experience from experienced training personnel. The modules were clearly articulated and easy to follow.",
    name: "Peter",
    company: "Ocean Technology",
  },
  {
    quote:
      "The API 510 preparatory course was intensive but well-structured. The instructors explained code calculations clearly and the mock exams built my confidence.",
    name: "Akmal",
    company: "PETRONAS",
  },
  {
    quote:
      "Best NDT training experience I've had. The practical sessions on real samples made the theory stick, and the certification helped my career move forward.",
    name: "Farah",
    company: "Sapura Energy",
  },
  {
    quote:
      "Altair's in-house programme saved us time and travel. They tailored the content to our procedures and the team came away properly certified.",
    name: "Hafiz",
    company: "MMHE",
  },
  {
    quote:
      "Professional from enrolment to exam. The online refresher materials and post-course support are excellent for someone working offshore.",
    name: "Nurul",
    company: "Shell Malaysia",
  },
  {
    quote:
      "I took the corrosion inspection course and was impressed by the depth of knowledge. The trainers are industry practitioners, not just lecturers.",
    name: "Rizal",
    company: "ExxonMobil",
  },
  {
    quote:
      "Clear, focused, and relevant. The management systems awareness course gave our team a practical framework we could use immediately.",
    name: "Daniel",
    company: "Sime Darby",
  },
];

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

export const upcomingSessions = [
  {
    date: "12 October 2026",
    title: "Visual Testing (VT) Level 1",
    slug: "visual-testing-vt",
    location: "Kuala Lumpur Centre",
    points: ["3-day intensive schedule", "Practical exam included", "Seats limited to 12"],
  },
  {
    date: "26 October 2026",
    title: "Weld Inspection Intensive",
    slug: "weld-inspection-wi",
    location: "Kuala Lumpur Centre",
    points: ["5-day supervisory track", "Code interpretation labs", "Certificate on completion"],
  },
  {
    date: "9 November 2026",
    title: "ISO 50001 Awareness",
    slug: "iso-50001-energy-management",
    location: "Live online classroom",
    points: ["2-day awareness course", "Live Q&A with auditors", "Template pack provided"],
  },
  {
    date: "23 November 2026",
    title: "Asset Assessment with BIM",
    slug: "infrastructure-asset-assessment-bim",
    location: "Kuala Lumpur Centre",
    points: ["4-day applied workshop", "Real project datasets", "Software walkthroughs"],
  },
];

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
