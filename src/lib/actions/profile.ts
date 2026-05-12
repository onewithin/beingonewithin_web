"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/server/home";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

type NotificationPreferences = {
  push: boolean;
  mindful: boolean;
  newContent: boolean;
  tips: boolean;
};

type ActionResult = {
  success: boolean;
  message: string;
};

async function backendAuthedFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data: T | null; status: number }> {
  const { token } = await getAuthContext();

  if (!token) {
    return {
      ok: false,
      data: null,
      status: 401,
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });

    const data = (await response.json().catch(() => null)) as T | null;

    return {
      ok: response.ok,
      data,
      status: response.status,
    };
  } catch {
    return {
      ok: false,
      data: null,
      status: 500,
    };
  }
}

export async function getNotificationPreferencesAction(): Promise<{
  success: boolean;
  message: string;
  preferences: NotificationPreferences;
}> {
  const response = await backendAuthedFetch<{
    success?: boolean;
    message?: string;
    preferences?: Partial<NotificationPreferences>;
  }>("/api/notifications/preferences", {
    method: "GET",
  });

  if (!response.ok) {
    return {
      success: false,
      message:
        response.data?.message || "Failed to load notification preferences.",
      preferences: {
        push: true,
        mindful: true,
        newContent: true,
        tips: true,
      },
    };
  }

  const prefs = response.data?.preferences;

  return {
    success: true,
    message: "Preferences loaded.",
    preferences: {
      push: Boolean(prefs?.push ?? true),
      mindful: Boolean(prefs?.mindful ?? true),
      newContent: Boolean(prefs?.newContent ?? true),
      tips: Boolean(prefs?.tips ?? true),
    },
  };
}

export async function updateNotificationPreferencesAction(
  preferences: NotificationPreferences,
): Promise<ActionResult> {
  const response = await backendAuthedFetch<{
    success?: boolean;
    message?: string;
  }>("/api/notifications/preferences", {
    method: "POST",
    body: JSON.stringify({ preferences }),
  });

  if (!response.ok) {
    return {
      success: false,
      message:
        response.data?.message || "Unable to update notification preferences.",
    };
  }

  return {
    success: true,
    message: response.data?.message || "Preferences updated successfully.",
  };
}

export async function requestAccessHistoryAction(): Promise<ActionResult> {
  const response = await backendAuthedFetch<{
    success?: boolean;
    message?: string;
  }>("/api/sar-log", {
    method: "POST",
    body: JSON.stringify({ status: "APPROVED" }),
  });

  if (!response.ok) {
    return {
      success: false,
      message: response.data?.message || "Failed to request access history.",
    };
  }

  return {
    success: true,
    message: response.data?.message || "Access history requested successfully.",
  };
}

export async function generateDeleteAccountOtpAction(): Promise<ActionResult> {
  const response = await backendAuthedFetch<{
    success?: boolean;
    message?: string;
  }>("/api/otp/generate", {
    method: "POST",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    return {
      success: false,
      message:
        response.data?.message || "Unable to send OTP for account deletion.",
    };
  }

  return {
    success: true,
    message: response.data?.message || "OTP sent successfully.",
  };
}

export async function verifyOtpAndDeleteAccountAction(
  otp: string,
): Promise<ActionResult> {
  if (!/^\d{6}$/.test(otp)) {
    return {
      success: false,
      message: "Please enter a valid 6-digit OTP.",
    };
  }

  const deleteResponse = await backendAuthedFetch<{
    success?: boolean;
    message?: string;
  }>("/api/user/delete-account", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });

  if (!deleteResponse.ok) {
    return {
      success: false,
      message: deleteResponse.data?.message || "Unable to delete account.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("onboarding_tag_ids");

  return {
    success: true,
    message: deleteResponse.data?.message || "Account deleted successfully.",
  };
}

export async function redirectToSignInAfterDeleteAction(): Promise<never> {
  redirect("/sign-in");
}

export async function updateProfileNameAction(
  name: string,
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, message: "Name cannot be empty." };
  }
  if (trimmed.length > 60) {
    return { success: false, message: "Name must be 60 characters or fewer." };
  }

  const { token, userId } = await getAuthContext();
  if (!token || !userId) {
    return { success: false, message: "Not authenticated." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/user/${userId}`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: trimmed }),
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Failed to update name.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/profile");

    return {
      success: true,
      message: data?.message || "Name updated successfully.",
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function updateProfilePhotoAction(
  formData: FormData,
): Promise<ActionResult> {
  const { token, userId } = await getAuthContext();

  if (!token || !userId) {
    return { success: false, message: "Not authenticated." };
  }

  const file = formData.get("photo");
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return { success: false, message: "No image file provided." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: "Image must be smaller than 5 MB." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Only JPEG, PNG, WebP, or GIF images are supported.",
    };
  }

  try {
    const body = new FormData();
    body.append("profilePicture", file);

    const response = await fetch(`${BACKEND_URL}/api/user/${userId}`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Failed to update profile photo.",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: data?.message || "Profile photo updated successfully.",
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

export type PolicyDocument = {
  id: string;
  type: number;
  content: string;
  active: boolean;
  updatedAt: string;
};

export async function getPolicyAction(
  type: 1 | 2,
): Promise<{ success: boolean; data: PolicyDocument | null; message: string }> {
  const { token } = await getAuthContext();

  if (!token) {
    return { success: false, data: null, message: "Not authenticated." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/privacy-policy/${type}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = (await response.json().catch(() => null)) as {
      message?: string;
      data?: PolicyDocument;
    } | null;

    if (!response.ok || !json?.data) {
      return {
        success: false,
        data: null,
        message: json?.message || "Policy not available.",
      };
    }

    return { success: true, data: json.data, message: "Loaded." };
  } catch {
    return { success: false, data: null, message: "Network error." };
  }
}
