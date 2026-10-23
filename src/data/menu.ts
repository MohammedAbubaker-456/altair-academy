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
