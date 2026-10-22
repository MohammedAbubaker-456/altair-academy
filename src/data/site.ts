import courseNdt from "@/assets/course-ndt.jpg";
import courseCorrosion from "@/assets/course-corrosion.jpg";
import courseEnergy from "@/assets/course-energy.jpg";
import courseBim from "@/assets/course-bim.jpg";
import teamCeo from "@/assets/mr.khaja_.jpg.webp";
import teamCoo from "@/assets/Sirajul_Hameed.jpg.webp";

export const contactInfo = {
  phoneDisplay: "+607 386 1617",
  homepagePhoneDisplay: "+607 386 1617",
  phoneHref: "+601172633456",
  whatsapp: "601172633456",
  email: "anna@altair.academy",
  address: "129 & 129-01, Jalan Sierra Perdana 4, Taman Sierra Perdana, 81750 Masai, Johor Malaysia",
  hours: "Mon – Fri, 9:00am – 6:00pm (SST)",
};

export type Category = { slug: string; name: string; short: string };

export const categories: Category[] = [
  { slug: "api-icp", name: "API-ICP Exam Preparatory", short: "API-ICP" },
  { slug: "bim", name: "Building Information Modelling (BIM)", short: "BIM" },
  { slug: "corrosion", name: "Corrosion", short: "Corrosion" },
  { slug: "food-beverage", name: "Food & Beverage (F&B)", short: "F&B" },
  { slug: "office-productivity", name: "Office Productivity", short: "Office Productivity" },
  { slug: "management-system", name: "Management System", short: "Management System" },
  { slug: "ndt", name: "Non-Destructive Testing", short: "NDT" },
  { slug: "plant-maintenance", name: "Plant Maintenance", short: "Plant Maintenance" },
  { slug: "quality", name: "Quality", short: "Quality" },
];

export type Course = {
  slug: string;
  title: string;
  image: string;
  categorySlug: string;
  level?: string;
  duration: string;
  price: string;
  summary: string;
  highlights?: string[];
  instructor?: { name: string; role: string };
};

export const courses: Course[] = [
  {
    slug: "visual-testing-vt",
    title: "Visual Testing (VT)",
    image: courseNdt,
    categorySlug: "ndt",
    level: "Level 1",
    duration: "3 days · 24 hours",
    price: "Contact For Pricing",
    summary:
      "Learn surface inspection fundamentals, lighting and optics, acceptance criteria and reporting to ISO 9712 requirements.",
  },
  {
    slug: "weld-inspection-wi",
    title: "Weld Inspection (WI)",
    image: courseCorrosion,
    categorySlug: "ndt",
    level: "Level 2",
    duration: "5 days · 40 hours",
    price: "Contact For Pricing",
    summary:
      "Weld processes, discontinuities, codes and practical assessment of welded joints for inspectors moving into supervisory work.",
  },
  {
    slug: "iso-50001-energy-management",
    title: "ISO 50001 Energy Management Systems Awareness",
    image: courseEnergy,
    categorySlug: "management-system",
    duration: "2 days · 16 hours",
    price: "Contact for pricing",
    summary:
      "Understand the energy management standard, baselines, performance indicators and how to run an effective internal review.",
  },
  {
    slug: "infrastructure-asset-assessment-bim",
    title: "Introduction to Infrastructure Asset Assessment with BIM",
    image: courseBim,
    categorySlug: "bim",
    duration: "4 days · 32 hours",
    price: "Contact For Pricing",
    summary:
      "Model-based asset assessment workflows, data standards and coordination practices for infrastructure teams adopting BIM.",
  },
];

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  image: string;
  bio: string;
};

export const team: TeamMember[] = [
  {
    slug: "shaik-khaja-mohiuddin",
    name: "Shaik Khaja Mohiuddin",
    role: "Chief Executive Officer",
    image: teamCeo,
    bio: "Over two decades leading inspection and technical training programmes across Asia-Pacific, with a focus on building certification pathways that employers actually recognise.",
  },
  {
    slug: "sirajul-hameed-mansoor",
    name: "Sirajul Hameed Mansoor",
    role: "Chief Operating Officer",
    image: teamCoo,
    bio: "Runs Altair's training operations, instructor network and accreditation compliance, making sure every cohort runs on schedule and to standard.",
  },
];

export type Instructor = {
  slug: string;
  name: string;
  role: string;
  image?: string;
  bio: string;
  expertise: string[];
};

export const instructors: Instructor[] = [
  {
    slug: "shaik-khaja-mohiuddin",
    name: "Mr. Shaik Khaja Mohiuddin",
    role: "Chief Executive Officer · Lead NDT Instructor",
    image: teamCeo.url,
    bio: "Mr. Khaja is the founder of Altair Engineering Inspections Pte Ltd. He has served as Director and then CEO since 2008 till date. He has more than 27 years' experience in the NDT industry which covers Oil & Gas, Aerospace, Construction, Infrastructure, Civil, Railways, Manufacturing and Defence. Khaja holds degree in Mechanical Engineering and ASNT/PCN Level 3 certifications in various methods. His experience covers training, examination, consultancy, cross-checking, auditing, inspection system development and architecting automated inspection systems (based on UT & ET). He has worked with many oil and gas majors and defence manufacturers in the development of inspection systems for critical components. He has designed customized scanners for PAUT/TOFD examination of complex components (like BOP, valves, shafts, artillery shells, tube-to-tube sheet welds, etc.). He is presently working on robotic inspection systems and automatic analysis software with the development team.",
    expertise: ["NDT Level III", "API-ICP 510 / 570 / 653", "Welding Inspection"],
  },
  {
    slug: "sirajul-hameed-mansoor",
    name: "Mr. Sirajul Hameed Masroor",
    role: "Chief Operating Officer · Senior Welding Inspector",
    image: teamCoo.url,
    bio: "Sirajul runs Altair's training operations, instructor network and accreditation compliance. A senior welding inspector by trade, he leads weld inspection and code interpretation classes and keeps every cohort running on schedule and to standard.",
    expertise: ["Weld Inspection", "Code Interpretation", "Accreditation Compliance"],
  },
  {
    slug: "r-martin",
    name: "Mr. R. Martin",
    role: "Corrosion & Plant Maintenance Instructor",
    bio: "Martin brings field-hardened experience in corrosion control and plant maintenance across refineries and petrochemical facilities. His classes lean heavily on failure case studies drawn from live assets.",
    expertise: ["Corrosion Control", "Plant Maintenance", "Asset Integrity"],
  },
  {
    slug: "ganesh-moorthy",
    name: "Mr. Ganesh Moorthy",
    role: "BIM & Digital Assessment Instructor",
    bio: "Ganesh teaches model-based asset assessment, common data environments and coordination workflows for infrastructure teams moving from drawings to digital delivery.",
    expertise: ["BIM Coordination", "Infrastructure Assets", "Digital Workflows"],
  },
  {
    slug: "mohamad-suffian-bin-abdul-rahim",
    name: "Mr. Mohamad Suffian Bin Abdul Rahim",
    role: "NDT Practical Instructor",
    bio: "Suffian runs the practical laboratory sessions across visual, penetrant, magnetic particle and ultrasonic methods, coaching candidates through specimen work right up to their certification assessment.",
    expertise: ["Visual Testing", "Penetrant & MPI", "Ultrasonic Testing"],
  },
  {
    slug: "akhila-shaheen",
    name: "Ms. Akhila Shaheen",
    role: "Management Systems & Quality Instructor",
    bio: "Akhila leads Altair's management system and quality programmes, including ISO 9001 and ISO 50001 awareness and internal auditor training, with a practical focus on documentation teams can actually maintain.",
    expertise: ["ISO 9001", "ISO 50001", "Internal Auditing"],
  },
];

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

export const courseExtras: Record<string, { highlights: string[]; instructor: { name: string; role: string } }> = {
  "visual-testing-vt": {
    highlights: ["Optics, lighting & surface conditions", "ISO 9712 acceptance criteria", "Practical reporting workshop"],
    instructor: { name: "Shaik Khaja Mohiuddin", role: "Lead NDT Instructor" },
  },
  "weld-inspection-wi": {
    highlights: ["Weld processes & discontinuities", "Code interpretation practice", "Hands-on joint assessment"],
    instructor: { name: "Sirajul Hameed Mansoor", role: "Senior Welding Inspector" },
  },
  "iso-50001-energy-management": {
    highlights: ["Energy baselines & EnPIs", "Internal review technique", "Documented information set"],
    instructor: { name: "Nurul Aziz", role: "Management Systems Lead" },
  },
  "infrastructure-asset-assessment-bim": {
    highlights: ["Model-based asset workflows", "Common data environments", "Coordination & clash review"],
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

export const faqs = [
  {
    q: "Are Altair certifications recognised by employers?",
    a: "Yes. Our inspection and management system programmes follow ISO 9712, API and ISO standard syllabi, and our certificates are accepted across oil & gas, construction and manufacturing employers in the region.",
  },
  {
    q: "Do I need prior experience to enrol?",
    a: "Most Level 1 courses need no prior experience, only basic industry familiarity. Level 2 and supervisory tracks require documented hours, which our course managers will verify with you before enrolment.",
  },
  {
    q: "Can you run a course at our own facility?",
    a: "We do. In-house delivery lets us build the syllabus around your equipment, procedures and assets, and we can schedule around shift patterns.",
  },
  {
    q: "What is included in the course fee?",
    a: "Instruction, course materials, practical lab time, assessment and the certificate. Examination body fees, where applicable, are quoted separately so there are no surprises.",
  },
  {
    q: "How do I get support after the course?",
    a: "Every participant keeps access to our support desk. You can email or WhatsApp our instructors with technical questions long after your class has finished.",
  },
];

export type CourseMenuItem = {
  name: string;
  category: string;
  children?: CourseMenuItem[];
};

export const courseMenu: CourseMenuItem[] = [
  { name: "API-ICP Exam Preparatory", category: "api-icp" },
  { name: "Building Information Modelling (BIM)", category: "bim" },
  { name: "Corrosion", category: "corrosion" },
  { name: "Food & Beverage (F&B)", category: "food-beverage" },
  {
    name: "Office Productivity",
    category: "office-productivity",
    children: [
      { name: "Office Productivity – Beginner", category: "office-productivity" },
      { name: "Office Productivity – Intermediate", category: "office-productivity" },
    ],
  },
  { name: "Management System", category: "management-system" },
  {
    name: "Non-Destructive Testing",
    category: "ndt",
    children: [
      {
        name: "ASNT Courses",
        category: "ndt",
        children: [
          { name: "ASNT – Level 1", category: "ndt" },
          { name: "ASNT – Level 2", category: "ndt" },
          { name: "ASNT – Level 3", category: "ndt" },
        ],
      },
      {
        name: "PCN Courses",
        category: "ndt",
        children: [
          { name: "PCN – Level 1", category: "ndt" },
          { name: "PCN – Level 2", category: "ndt" },
          { name: "PCN – Level 3", category: "ndt" },
        ],
      },
      { name: "Special NDT Courses", category: "ndt" },
    ],
  },
  { name: "Plant Maintenance", category: "plant-maintenance" },
  { name: "Quality", category: "quality" },
];
