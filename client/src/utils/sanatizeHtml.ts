// client/src/utils/sanitizeHtml.ts

/**
 * Sanitizes a user‐provided string by escaping HTML special characters.
 * Prevents XSS when inserting into innerHTML.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
