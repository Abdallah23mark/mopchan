import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatContent(content: string, isAdminPost?: boolean): string {
  if (!content || typeof content !== 'string') {
    return "";
  }
  
  // Escape HTML first
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
  
  // Handle post references (>>123456)
  formatted = formatted.replace(/&gt;&gt;(\d+)/g, '<span class="text-blue-600 hover:text-blue-800 cursor-pointer underline" data-post-id="$1">&gt;&gt;$1</span>');
  
  if (isAdminPost) {
    // For admin posts, make everything red
    formatted = `<span class="text-red-600 font-bold">${formatted}</span>`;
  } else {
    // Handle greentext (lines starting with >) for non-admin posts
    formatted = formatted.replace(/(^|<br>)(&gt;[^<]*)/g, '$1<span class="text-green-600 font-bold">$2</span>');
  }
  
  return formatted;
}

export function truncateContent(content: string, maxLength: number = 100): string {
  return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
}
