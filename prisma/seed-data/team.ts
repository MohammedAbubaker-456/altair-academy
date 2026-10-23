/**
 * Seed Data: Team Members & Instructors
 *
 * Merged team dataset combining management team and instructors into unified
 * TeamMember records with placements (MANAGEMENT and/or INSTRUCTOR).
 * Preserves exact copy, including COO surname variations ("Mansoor" vs "Masroor").
 *
 * Location: prisma/seed-data/team.ts
 * Type: Seed Data Module
 */

export const seedTeamMembers = [
  {
    slug: "shaik-khaja-mohiuddin",
    name: "Shaik Khaja Mohiuddin",
    instructorName: "Mr. Shaik Khaja Mohiuddin",
    role: "Chief Executive Officer",
    instructorRole: "Chief Executive Officer · Lead NDT Instructor",
    shortBio:
      "Over two decades leading inspection and technical training programmes across Asia-Pacific, with a focus on building certification pathways that employers actually recognise.",
    fullBio:
      "Mr. Khaja is the founder of Altair Engineering Inspections Pte Ltd. He has served as Director and then CEO since 2008 till date. He has more than 27 years' experience in the NDT industry which covers Oil & Gas, Aerospace, Construction, Infrastructure, Civil, Railways, Manufacturing and Defence. Khaja holds degree in Mechanical Engineering and ASNT/PCN Level 3 certifications in various methods. His experience covers training, examination, consultancy, cross-checking, auditing, inspection system development and architecting automated inspection systems (based on UT & ET). He has worked with many oil and gas majors and defence manufacturers in the development of inspection systems for critical components. He has designed customized scanners for PAUT/TOFD examination of complex components (like BOP, valves, shafts, artillery shells, tube-to-tube sheet welds, etc.). He is presently working on robotic inspection systems and automatic analysis software with the development team.",
    expertise: ["NDT Level III", "API-ICP 510 / 570 / 653", "Welding Inspection"],
    image: "/seed/mr.khaja_.jpg.webp",
    placements: ["MANAGEMENT", "INSTRUCTOR"] as const,
    managementOrder: 1,
    instructorOrder: 1,
  },
  {
    slug: "sirajul-hameed-mansoor",
    name: "Sirajul Hameed Mansoor",
    instructorName: "Mr. Sirajul Hameed Masroor",
    role: "Chief Operating Officer",
    instructorRole: "Chief Operating Officer · Senior Welding Inspector",
    shortBio:
      "Runs Altair's training operations, instructor network and accreditation compliance, making sure every cohort runs on schedule and to standard.",
    fullBio:
      "Sirajul runs Altair's training operations, instructor network and accreditation compliance. A senior welding inspector by trade, he leads weld inspection and code interpretation classes and keeps every cohort running on schedule and to standard.",
    expertise: ["Weld Inspection", "Code Interpretation", "Accreditation Compliance"],
    image: "/seed/Sirajul_Hameed.jpg.webp",
    placements: ["MANAGEMENT", "INSTRUCTOR"] as const,
    managementOrder: 2,
    instructorOrder: 2,
  },
  {
    slug: "r-martin",
    name: "Mr. R. Martin",
    instructorName: "Mr. R. Martin",
    role: "Corrosion & Plant Maintenance Instructor",
    instructorRole: "Corrosion & Plant Maintenance Instructor",
    shortBio:
      "Martin brings field-hardened experience in corrosion control and plant maintenance across refineries and petrochemical facilities. His classes lean heavily on failure case studies drawn from live assets.",
    fullBio:
      "Martin brings field-hardened experience in corrosion control and plant maintenance across refineries and petrochemical facilities. His classes lean heavily on failure case studies drawn from live assets.",
    expertise: ["Corrosion Control", "Plant Maintenance", "Asset Integrity"],
    image: null,
    placements: ["INSTRUCTOR"] as const,
    managementOrder: 0,
    instructorOrder: 3,
  },
  {
    slug: "ganesh-moorthy",
    name: "Mr. Ganesh Moorthy",
    instructorName: "Mr. Ganesh Moorthy",
    role: "BIM & Digital Assessment Instructor",
    instructorRole: "BIM & Digital Assessment Instructor",
    shortBio:
      "Ganesh teaches model-based asset assessment, common data environments and coordination workflows for infrastructure teams moving from drawings to digital delivery.",
    fullBio:
      "Ganesh teaches model-based asset assessment, common data environments and coordination workflows for infrastructure teams moving from drawings to digital delivery.",
    expertise: ["BIM Coordination", "Infrastructure Assets", "Digital Workflows"],
    image: null,
    placements: ["INSTRUCTOR"] as const,
    managementOrder: 0,
    instructorOrder: 4,
  },
  {
    slug: "mohamad-suffian-bin-abdul-rahim",
    name: "Mr. Mohamad Suffian Bin Abdul Rahim",
    instructorName: "Mr. Mohamad Suffian Bin Abdul Rahim",
    role: "NDT Practical Instructor",
    instructorRole: "NDT Practical Instructor",
    shortBio:
      "Suffian runs the practical laboratory sessions across visual, penetrant, magnetic particle and ultrasonic methods, coaching candidates through specimen work right up to their certification assessment.",
    fullBio:
      "Suffian runs the practical laboratory sessions across visual, penetrant, magnetic particle and ultrasonic methods, coaching candidates through specimen work right up to their certification assessment.",
    expertise: ["Visual Testing", "Penetrant & MPI", "Ultrasonic Testing"],
    image: null,
    placements: ["INSTRUCTOR"] as const,
    managementOrder: 0,
    instructorOrder: 5,
  },
  {
    slug: "akhila-shaheen",
    name: "Ms. Akhila Shaheen",
    instructorName: "Ms. Akhila Shaheen",
    role: "Management Systems & Quality Instructor",
    instructorRole: "Management Systems & Quality Instructor",
    shortBio:
      "Akhila leads Altair's management system and quality programmes, including ISO 9001 and ISO 50001 awareness and internal auditor training, with a practical focus on documentation teams can actually maintain.",
    fullBio:
      "Akhila leads Altair's management system and quality programmes, including ISO 9001 and ISO 50001 awareness and internal auditor training, with a practical focus on documentation teams can actually maintain.",
    expertise: ["ISO 9001", "ISO 50001", "Internal Auditing"],
    image: null,
    placements: ["INSTRUCTOR"] as const,
    managementOrder: 0,
    instructorOrder: 6,
  },
];
