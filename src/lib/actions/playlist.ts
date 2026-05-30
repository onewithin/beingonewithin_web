"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

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

export type Playlist = {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

/**
 * Get all playlists for the current user
 */
export async function getUserPlaylists(): Promise<{
  success: boolean;
  playlists?: Playlist[];
  error?: string;
}> {
  try {
    const { token, userId } = await getAuthContext();

    if (!token || !userId) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${BACKEND_URL}/api/playlist?userId=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to fetch playlists",
      };
    }

    const data = await response.json();
    return { success: true, playlists: data.data || [] };
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a new playlist
 */
export async function createPlaylist(data: {
  name: string;
  description?: string;
  icon?: string;
  isPublic?: boolean;
}): Promise<{ success: boolean; playlist?: Playlist; error?: string }> {
  try {
    const { token, userId } = await getAuthContext();

    if (!token || !userId) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(`${BACKEND_URL}/api/playlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to create playlist",
      };
    }

    const result = await response.json();
    return { success: true, playlist: result.data };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Add meditation to playlist
 */
export async function addMeditationToPlaylist(
  playlistId: string,
  meditationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${BACKEND_URL}/api/playlist/${playlistId}/meditations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meditationIds: [meditationId],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to add to playlist",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
