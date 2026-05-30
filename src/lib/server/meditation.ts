import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export type MeditationDetail = {
  id: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  link: string;
  thumbnail?: string | null;
  isPremium?: boolean;
  active?: boolean;
  type?: string | null;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  subcategory?: {
    id: string;
    name: string;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  isLiked?: boolean;
};

export type WatchHistory = {
  id: string;
  userId: string;
  meditationId: string;
  watchedAt: string;
  watchedSeconds: number | null;
  completed: boolean;
  device: string | null;
};

export type ThoughtDetail = {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  link: string;
  thumbnail?: string | null;
  scheduledAt?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8");

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAuthContext(): Promise<{
  token: string | null;
  userId: string | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || null;

  if (!token) {
    return { token: null, userId: null };
  }

  const payload = decodeJwtPayload(token);
  const userId = typeof payload?.id === "string" ? payload.id : null;

  return { token, userId };
}

async function backendGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Backend GET error:", error);
    return null;
  }
}

export async function backendPost<T>(
  path: string,
  token: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Backend POST error:", error);
    return null;
  }
}

export async function backendPut<T>(
  path: string,
  token: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Backend PUT error:", error);
    return null;
  }
}

/**
 * Fetches meditation or thought details by ID
 * If the content is not found, returns null (caller should handle notFound)
 */
export async function getMeditationOrThoughtDetail(
  id: string,
  type?: "meditation" | "thought",
): Promise<{
  data: MeditationDetail | ThoughtDetail;
  type: "meditation" | "thought";
  watchHistory?: WatchHistory | null;
} | null> {
  const { token } = await getAuthContext();

  if (!token) {
    notFound();
  }

  // If type is not specified, try meditation first, then thought
  if (!type) {
    // Try meditation first
    const meditationResponse: any = await backendGet<{
      meditation?: MeditationDetail;
      watchHistory?: WatchHistory;
    }>(`/api/meditation/${id}`, token);

    if (meditationResponse) {
      return {
        data: meditationResponse,
        type: "meditation",
        watchHistory: meditationResponse.watchHistory || null,
      };
    }

    // Try thought
    const thoughtResponse = await backendGet<{ thought?: ThoughtDetail }>(
      `/api/thought/${id}`,
      token,
    );

    if (thoughtResponse?.thought) {
      return {
        data: thoughtResponse.thought,
        type: "thought",
      };
    }

    return null;
  }

  // If type is specified, fetch directly
  if (type === "meditation") {
    const response = await backendGet<{
      meditation?: MeditationDetail;
      watchHistory?: WatchHistory;
    }>(`/api/meditation/${id}`, token);

    if (!response?.meditation) {
      return null;
    }

    return {
      data: response.meditation,
      type: "meditation",
      watchHistory: response.watchHistory || null,
    };
  }

  if (type === "thought") {
    const response = await backendGet<{ thought?: ThoughtDetail }>(
      `/api/thought/${id}`,
      token,
    );

    if (!response?.thought) {
      return null;
    }

    return {
      data: response.thought,
      type: "thought",
    };
  }

  return null;
}

/**
 * Format duration to display string
 */
export function formatDuration(duration?: number | string | null): string {
  if (!duration) return "0:00";

  const seconds =
    typeof duration === "string" ? parseInt(duration, 10) : duration;

  if (isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Convert duration string (MM:SS) to seconds
 */
export function durationToSeconds(duration: string): number {
  const parts = duration.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return parseInt(duration, 10) || 0;
}
