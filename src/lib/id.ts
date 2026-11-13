/**
 * Identifier Validation
 *
 * Checks if a given string is a valid entity ID.
 * Supports legacy 24-character hexadecimal MongoDB ObjectIds, CUIDs, and UUIDs
 * (1-36 characters composed of alphanumeric, hyphen, or underscore characters).
 *
 * Location: src/lib/id.ts
 * Type: Shared Utility
 */

export function isValidId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{1,36}$/.test(id);
}

/**
 * Backwards compatibility alias for existing callers.
 */
export function isValidObjectId(id: unknown): id is string {
  return isValidId(id);
}
