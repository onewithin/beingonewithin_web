"use server";

import { cookies } from "next/headers";

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const BACKEND_URL_CANDIDATES = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_BACKEND_URL,
      process.env.BACKEND_URL_FALLBACK,
      "http://localhost:3001",
      NEXT_PUBLIC_BACKEND_URL,
    ].filter((url): url is string => Boolean(url && url.trim())),
  ),
);

async function fetchFromBackend(
  path: string,
  options: RequestInit,
): Promise<
  | { response: Response; baseUrl: string }
  | { response: null; baseUrl: null; lastError: string }
> {
  let lastError = "Failed to fetch from backend";

  for (const baseUrl of BACKEND_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);

      // Auth/permission errors should be returned immediately from reachable backend.
      if (response.status === 401 || response.status === 403) {
        return { response, baseUrl };
      }

      if (response.ok) {
        return { response, baseUrl };
      }

      const errorData = await response.json().catch(() => ({}));
      const candidateError =
        errorData?.message ||
        errorData?.error ||
        `Backend error: ${response.status}`;
      lastError = `${candidateError} (${baseUrl})`;
    } catch (error) {
      lastError = `${error instanceof Error ? error.message : "Network error"} (${baseUrl})`;
    }
  }

  return { response: null, baseUrl: null, lastError };
}

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
  meditationCount?: number;
};

type BackendPlaylist = Playlist & {
  _count?: {
    items?: number;
  };
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
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const backendResult = await fetchFromBackend(`/api/playlist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to fetch playlists",
      };
    }

    const data = await response.json();
    const playlists: Playlist[] = ((data.data || []) as BackendPlaylist[]).map(
      (playlist) => ({
        ...playlist,
        meditationCount:
          playlist._count?.items ?? playlist.meditationCount ?? 0,
      }),
    );

    return { success: true, playlists };
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

    const backendResult = await fetchFromBackend(`/api/playlist`, {
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

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to create playlist",
      };
    }

    const result = await response.json();
    const playlist = result.data as BackendPlaylist;

    return {
      success: true,
      playlist: {
        ...playlist,
        meditationCount:
          playlist._count?.items ?? playlist.meditationCount ?? 0,
      },
    };
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

    const backendResult = await fetchFromBackend(
      `/api/playlist/${playlistId}/meditations`,
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

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

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

/**
 * Remove meditation from playlist
 */
export async function removeMeditationFromPlaylist(
  playlistId: string,
  meditationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const backendResult = await fetchFromBackend(
      `/api/playlist/${playlistId}/meditations/${meditationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to remove from playlist",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Rename or update playlist
 */
export async function updatePlaylist(
  playlistId: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    isPublic?: boolean;
  },
): Promise<{ success: boolean; playlist?: Playlist; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const backendResult = await fetchFromBackend(
      `/api/playlist/${playlistId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to update playlist",
      };
    }

    const result = await response.json();
    const playlist = result.data as BackendPlaylist;

    return {
      success: true,
      playlist: {
        ...playlist,
        meditationCount:
          playlist._count?.items ?? playlist.meditationCount ?? 0,
      },
    };
  } catch (error) {
    console.error("Error updating playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete playlist
 */
export async function deletePlaylist(
  playlistId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { token } = await getAuthContext();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const backendResult = await fetchFromBackend(
      `/api/playlist/${playlistId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!backendResult.response) {
      return {
        success: false,
        error: backendResult.lastError,
      };
    }

    const response = backendResult.response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to delete playlist",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
