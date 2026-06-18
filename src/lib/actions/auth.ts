"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const OTP_COOKIE_MAX_AGE_SECONDS = 600;
const AUTH_COOKIE_MAX_AGE_SECONDS = 86400;
const REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = 2592000; // 30 days
const ONBOARDING_COOKIE_MAX_AGE_SECONDS = 1800;

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
};

export type OnboardingTag = {
  tagId: string;
};

export type OnboardingOption = {
  id: string;
  option: string;
  questionId: string;
  tags?: OnboardingTag[];
};

export type OnboardingQuestion = {
  id: string;
  question: string;
  createdAt?: string;
  options: OnboardingOption[];
};

type VerifyOtpActionResult = {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  onboardingSynced?: boolean;
};

type SocialProvider = "google" | "apple";

type OAuthAuthActionInput = {
  provider: SocialProvider;
  idToken: string;
  email: string;
  name?: string;
  image?: string;
  isLogin: boolean;
};

type OAuthAuthActionResult = {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  onboardingSynced?: boolean;
};

async function attemptTokenRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    const refreshResponse = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!refreshResponse.ok) return null;

    const refreshData = (await refreshResponse.json().catch(() => null)) as {
      token?: string;
      refreshToken?: string;
    } | null;

    if (!refreshData?.token) return null;

    cookieStore.set("auth_token", refreshData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });

    if (refreshData.refreshToken) {
      cookieStore.set("refresh_token", refreshData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
    }

    return refreshData.token;
  } catch {
    return null;
  }
}

async function clearAuthCookiesAndRedirect(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("onboarding_tag_ids");
  redirect("/sign-in");
}

async function callBackend<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    return { ok: false, data: null };
  }

  // Handle auth failures — attempt token refresh then retry
  if (response.status === 401 || response.status === 403) {
    const newToken = await attemptTokenRefresh();

    if (newToken) {
      try {
        const retryHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...(init?.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${path}`, {
          cache: "no-store",
          ...init,
          headers: retryHeaders,
        });
        const retryData = (await retryResponse
          .json()
          .catch(() => null)) as T | null;
        return { ok: retryResponse.ok, data: retryData };
      } catch {
        return { ok: false, data: null };
      }
    }

    // Refresh failed or no refresh token — force logout
    await clearAuthCookiesAndRedirect();
  }

  const data = (await response.json().catch(() => null)) as T | null;

  return {
    ok: response.ok,
    data,
  };
}

function parsePendingOnboardingTags(value?: string): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed
          .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
          .filter((entry) => entry.length > 0),
      ),
    );
  } catch {
    return [];
  }
}

async function syncOnboardingTags(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const tagIds = parsePendingOnboardingTags(
    cookieStore.get("onboarding_tag_ids")?.value,
  );

  if (tagIds.length === 0) {
    cookieStore.delete("onboarding_tag_ids");
    return true;
  }

  const response = await callBackend<{ message?: string }>("/api/usertags", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tags: tagIds }),
  });

  if (!response.ok) {
    return false;
  }

  cookieStore.delete("onboarding_tag_ids");
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Check if an email is already registered */
export async function checkEmailAction(
  email: string,
): Promise<{ exists: boolean; error?: string }> {
  const normalised = email.toLowerCase().trim();
  if (!normalised || !isValidEmail(normalised)) {
    return { exists: false, error: "Please enter a valid email address." };
  }
  try {
    const response = await callBackend<{
      success?: boolean;
      exists?: boolean;
      message?: string;
      data?: {
        exists?: boolean;
      };
      userExists?: boolean;
      isRegistered?: boolean;
    }>("/api/user/check-email", {
      method: "POST",
      body: JSON.stringify({ email: normalised }),
    });

    if (!response.ok) {
      return {
        exists: false,
        error: response.data?.message || "Error checking email.",
      };
    }

    const payload = response.data;

    if (typeof payload?.exists === "boolean") {
      return { exists: payload.exists };
    }

    if (typeof payload?.data?.exists === "boolean") {
      return { exists: payload.data.exists };
    }

    if (typeof payload?.userExists === "boolean") {
      return { exists: payload.userExists };
    }

    if (typeof payload?.isRegistered === "boolean") {
      return { exists: payload.isRegistered };
    }

    return {
      exists: false,
      error: "Unexpected response while checking email. Please try again.",
    };
  } catch {
    return { exists: false, error: "Network error. Please try again." };
  }
}

export async function getOnboardingQuestionsAction(): Promise<{
  success: boolean;
  message: string;
  questions: OnboardingQuestion[];
}> {
  const response = await callBackend<{
    data?: OnboardingQuestion[];
    message?: string;
  }>("/api/onboard?active=true", {
    method: "GET",
  });

  if (!response.ok) {
    return {
      success: false,
      message: response.data?.message || "Unable to load onboarding questions.",
      questions: [],
    };
  }

  const sortedQuestions = [...(response.data?.data || [])].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NaN;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NaN;

    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
      return aTime - bTime;
    }

    // Fallback to deterministic id ordering when createdAt is missing.
    return a.id.localeCompare(b.id);
  });

  return {
    success: true,
    message: "Questions loaded successfully.",
    questions: sortedQuestions,
  };
}

export async function setPendingOnboardingTagsAction(
  tagIds: string[],
): Promise<void> {
  const cookieStore = await cookies();
  const sanitised = Array.from(
    new Set(tagIds.map((tagId) => tagId.trim()).filter((tagId) => tagId)),
  );

  if (sanitised.length === 0) {
    cookieStore.delete("onboarding_tag_ids");
    return;
  }

  cookieStore.set("onboarding_tag_ids", JSON.stringify(sanitised), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: ONBOARDING_COOKIE_MAX_AGE_SECONDS,
    sameSite: "strict",
    path: "/",
  });
}

/** Save onboarding tag selections for an already-authenticated user */
export async function saveOnboardingTagsAction(
  tagIds: string[],
): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return;

  const sanitised = Array.from(
    new Set(tagIds.map((id) => id.trim()).filter((id) => id)),
  );

  if (sanitised.length === 0) return;

  await callBackend<{ message?: string }>("/api/usertags", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tags: sanitised }),
  });
}

/** Register a new user (email flow) and trigger OTP */
export async function registerAction(
  email: string,
  name: string,
): Promise<{ success: boolean; message: string }> {
  const normalised = email.toLowerCase().trim();
  if (!normalised || !isValidEmail(normalised)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  try {
    const response = await callBackend<{ message?: string }>(
      "/api/user/register",
      {
        method: "POST",
        body: JSON.stringify({
          email: normalised,
          name: name.trim() || undefined,
          oauth: false,
          method: 1,
          device: "web",
        }),
      },
    );

    if (!response.ok)
      return {
        success: false,
        message: response.data?.message || "Registration failed.",
      };

    const cookieStore = await cookies();
    cookieStore.set("otp_email", normalised, {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("otp_is_new", "true", {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "strict",
      path: "/",
    });
    cookieStore.set("otp_flow", "signup", {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    });

    return {
      success: true,
      message: response.data?.message || "OTP sent to your email.",
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

/** Send OTP to an existing user (sign-in) */
export async function loginAction(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const normalised = email.toLowerCase().trim();
  if (!normalised || !isValidEmail(normalised)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  try {
    const response = await callBackend<{ success?: boolean; message?: string }>(
      "/api/user/login",
      {
        method: "POST",
        body: JSON.stringify({ email: normalised }),
      },
    );

    if (!response.ok || response.data?.success === false) {
      return {
        success: false,
        message: response.data?.message || "Sign-in failed.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.delete("onboarding_tag_ids");

    cookieStore.set("otp_email", normalised, {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("otp_is_new", "false", {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "strict",
      path: "/",
    });
    cookieStore.set("otp_flow", "signin", {
      httpOnly: true,
      maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    });

    return {
      success: true,
      message: response.data?.message || "OTP sent to your email.",
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

/** Authenticate with social providers (Google / Apple) and set auth cookies */
export async function oauthAuthenticateAction(
  input: OAuthAuthActionInput,
): Promise<OAuthAuthActionResult> {
  const normalisedEmail = input.email.toLowerCase().trim();
  if (!normalisedEmail || !isValidEmail(normalisedEmail)) {
    return {
      success: false,
      message: "Provider did not return a valid email.",
    };
  }

  if (!input.idToken.trim()) {
    return { success: false, message: "Missing social auth token." };
  }

  const method = input.provider === "google" ? 2 : 3;

  try {
    const response = await callBackend<{
      success?: boolean;
      message?: string;
      token?: string;
      refreshToken?: string;
      register?: boolean;
    }>("/api/user/register", {
      method: "POST",
      body: JSON.stringify({
        email: normalisedEmail,
        name: input.name?.trim() || undefined,
        profilePicture: input.image,
        oauth: "true",
        method,
        device: "web",
        isLogin: input.isLogin,
        idToken: input.idToken,
      }),
    });

    if (!response.ok || !response.data?.success || !response.data.token) {
      return {
        success: false,
        message: response.data?.message || "Social sign-in failed.",
      };
    }

    const cookieStore = await cookies();

    cookieStore.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });

    if (response.data.refreshToken) {
      cookieStore.set("refresh_token", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
    }

    const isNewUser = Boolean(response.data.register);
    const onboardingSynced = isNewUser
      ? await syncOnboardingTags(response.data.token)
      : true;

    // Social auth does not use OTP flow.
    cookieStore.delete("otp_email");
    cookieStore.delete("otp_is_new");
    cookieStore.delete("otp_flow");

    return {
      success: true,
      message: response.data.message || "Authenticated successfully.",
      isNewUser,
      onboardingSynced,
    };
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/** Verify OTP and set auth cookie */
export async function verifyOtpAction(
  otp: string,
): Promise<VerifyOtpActionResult> {
  const cookieStore = await cookies();
  const email = cookieStore.get("otp_email")?.value;
  const isNewFromCookie = cookieStore.get("otp_is_new")?.value === "true";

  if (!email) {
    return { success: false, message: "Session expired. Please start over." };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { success: false, message: "Please enter a valid 6-digit code." };
  }

  try {
    const response = await callBackend<{
      success?: boolean;
      message?: string;
      token?: string;
      refreshToken?: string;
      register?: boolean;
    }>("/api/user/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp, device: "web" }),
    });

    if (!response.ok || !response.data?.success || !response.data.token) {
      return {
        success: false,
        message: response.data?.message || "Invalid OTP.",
      };
    }

    // Store JWT as httpOnly cookie — never exposed to client JS
    cookieStore.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });

    if (response.data.refreshToken) {
      cookieStore.set("refresh_token", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
    }

    const isNewUser = isNewFromCookie || Boolean(response.data.register);
    const onboardingSynced = isNewUser
      ? await syncOnboardingTags(response.data.token)
      : true;

    cookieStore.delete("otp_email");
    cookieStore.delete("otp_is_new");
    cookieStore.delete("otp_flow");

    return {
      success: true,
      message: "Verified successfully.",
      isNewUser,
      onboardingSynced,
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

/** Resend OTP to the email stored in the temp cookie */
export async function resendOtpAction(): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = await cookies();
  const email = cookieStore.get("otp_email")?.value;

  if (!email) {
    return { success: false, message: "Session expired. Please start over." };
  }
  try {
    const response = await callBackend<{ message?: string }>(
      "/api/user/resend-otp",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );

    if (!response.ok)
      return {
        success: false,
        message: response.data?.message || "Failed to resend OTP.",
      };

    return { success: true, message: "OTP resent. Check your email." };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

/** Generate a QR login token */
export async function generateQrAction(): Promise<{
  success: boolean;
  qrToken?: string;
  expiresAt?: string;
  message?: string;
}> {
  try {
    const response = await callBackend<{
      success?: boolean;
      qrToken?: string;
      expiresAt?: string;
      message?: string;
    }>("/api/user/qr/generate", { method: "GET" });

    if (!response.ok || !response.data?.qrToken) {
      return { success: false, message: response.data?.message || "Failed to generate QR code." };
    }

    return { success: true, qrToken: response.data.qrToken, expiresAt: response.data.expiresAt };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

/** Set auth cookies after successful QR scan (called from client after SSE event) */
export async function setQrAuthCookiesAction(
  token: string,
  refreshToken: string,
): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

/** Sign out the user */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    try {
      await callBackend("/api/user/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore backend errors — always clear the cookie
    }
  }

  cookieStore.delete("auth_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("onboarding_tag_ids");
}
