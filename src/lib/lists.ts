/**
 * JSON-backed List Serializer / Deserializer
 *
 * MariaDB / MySQL Prisma schema does not support native scalar list fields (e.g. String[]).
 * These helpers serialize string arrays to/from JSON strings stored in LongText columns.
 *
 * Location: src/lib/lists.ts
 */

export function readList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

export function writeList(items: unknown): string {
  if (!items) return "[]";
  if (Array.isArray(items)) {
    const cleaned = items.map((v) => String(v ?? "").trim()).filter(Boolean);
    return JSON.stringify(cleaned);
  }
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.map((v) => String(v ?? "").trim()).filter(Boolean));
      }
    } catch {
      const trimmed = items.trim();
      return trimmed ? JSON.stringify([trimmed]) : "[]";
    }
  }
  return "[]";
}

