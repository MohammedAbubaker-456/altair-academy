/**
 * Careers and Employment Type Utilities
 *
 * Provides shared labels and formatters for JobOpening employment types.
 *
 * Location: src/lib/careers.ts
 * Type: Shared Utility Module (Server & Client compatible)
 */

import type { EmploymentType } from "@prisma/client";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export function formatEmploymentType(type: EmploymentType): string {
  return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}
