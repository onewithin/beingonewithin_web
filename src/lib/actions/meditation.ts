"use server";

import { cookies } from "next/headers";

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

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

async function getAuthContext(): Promise<{
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

/**
 * Update meditation watch history
 * Called when user pauses, completes, or seeks in meditation
 */
export async function updateMeditationWatchTime(
  watchHistoryId: string,
  watchedSeconds: number,
  completed: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/meditation/watch-time`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: watchHistoryId,
          watchedSeconds,
          completed,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to update watch time",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating meditation watch time:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Start meditation session history when user actually presses play
 */
export async function startMeditationWatchSession(
  meditationId: string,
): Promise<{ success: boolean; watchHistoryId?: string; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/meditation/watch-time/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meditationId }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to start meditation session",
      };
    }

    const data = await response.json();
    return {
      success: true,
      watchHistoryId: data?.history?.id,
    };
  } catch (error) {
    console.error("Error starting meditation session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Like a meditation
 */
export async function likeMeditation(
  meditationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token, userId } = await getAuthContext();

    if (!token || !userId) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/liked/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        meditationId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to like meditation",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error liking meditation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unlike (dislike) a meditation
 */
export async function unlikeMeditation(
  meditationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token, userId } = await getAuthContext();

    if (!token || !userId) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/liked/dislike`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          meditationId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to unlike meditation",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error unliking meditation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
