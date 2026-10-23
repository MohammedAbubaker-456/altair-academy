/**
 * MongoDB ObjectId Validation
 *
 * Checks if a given string is a valid 24-character hexadecimal MongoDB ObjectId.
 *
 * Location: src/lib/id.ts
 * Type: Shared Utility
 */

export function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}
