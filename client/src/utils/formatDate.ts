// client/src/utils/formatDate.ts

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}
