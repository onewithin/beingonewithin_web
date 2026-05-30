import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Darkens a hex color by the specified amount
 * @param hex - Hex color string (e.g., "#DDF3E5")
 * @param amount - Amount to darken (default: 40)
 * @returns Darkened hex color string
 */
export function getDarkerColor(hex: string, amount = 40): string {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB values
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  // Darken by subtracting amount
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  // Convert back to hex
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Converts a color to inline styles with background and text color
 * @param color - Hex color string (optional)
 * @returns Style object with backgroundColor and color
 */
export function colorToPillClass(color?: string | null): {
  backgroundColor: string;
  color: string;
} {
  const bg = color || "#DDF3E5";
  const text = getDarkerColor(bg, 100);

  return {
    backgroundColor: bg,
    color: text,
  };
}

/**
 * Formats a duration value to minutes string
 * @param value - Duration value (string or number)
 * @returns Formatted string (e.g., "10 min")
 */
export function formatMinutes(value?: string | number | null): string {
  if (value === null || value === undefined) return "10 min";
  if (typeof value === "number") return `${value} min`;
  return value;
}

/**
 * Formats duration into MM:SS
 * Supports numbers (seconds), MM:SS strings, and "X min" strings.
 */
export function formatToMMSS(value?: string | number | null): string {
  if (value === null || value === undefined) return "00:00";

  if (typeof value === "string") {
    const normalized = value.trim();
    const mmssMatch = normalized.match(/^(\d{1,2}):(\d{1,2})$/);
    if (mmssMatch) {
      const minutes = Number(mmssMatch[1]);
      const seconds = Number(mmssMatch[2]);
      return `${String(minutes).padStart(2, "0")}:${String(
        Math.min(59, seconds),
      ).padStart(2, "0")}`;
    }
  }

  let totalSeconds = 0;
  if (typeof value === "number") {
    totalSeconds = value;
  } else {
    const lower = value.toLowerCase().trim();
    if (lower.includes("min")) {
      const minutes = Number.parseFloat(lower);
      totalSeconds = Number.isFinite(minutes) ? Math.round(minutes * 60) : 0;
    } else {
      const numeric = Number.parseInt(lower, 10);
      totalSeconds = Number.isFinite(numeric) ? numeric : 0;
    }
  }

  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
