"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  message?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  trialDays?: number;
  stripePriceId?: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "PAST_DUE"
  | "UNPAID"
  | "INCOMPLETE"
  | "TRIALING"
  | "INCOMPLETE_EXPIRED";

export type TransactionStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
};

export type Transaction = {
  id: string;
  subscriptionId?: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  type: string;
  planId?: string;
  plan?: SubscriptionPlan;
};

export type CheckoutSessionData = {
  sessionId: string;
  url: string;
};

async function attemptTokenRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    const refreshResponse = await fetch(`${BACKEND_URL}/refresh-token`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) return null;

    const refreshData = (await refreshResponse.json().catch(() => null)) as {
      token?: string;
      refreshToken?: string;
    } | null;

    if (!refreshData?.token) return null;

    cookieStore.set("auth_token", refreshData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    if (refreshData.refreshToken) {
      cookieStore.set("refresh_token", refreshData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2592000,
        path: "/",
      });
    }

    return refreshData.token;
  } catch {
    return null;
  }
}

async function authenticatedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const cookieStore = await cookies();
  let token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { ok: false, data: null, message: "Not authenticated" };
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        const retryResponse = await fetch(`${BACKEND_URL}${path}`, {
          ...options,
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
        response = retryResponse;
      }
    }
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: error instanceof Error ? error.message : "Network error",
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      ok: false,
      data: null,
      message: errorData.message || `Request failed: ${response.status}`,
    };
  }

  const data = await response.json();
  return { ok: true, data: data.data || data };
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<
  ApiResult<SubscriptionPlan[] | Subscription>
> {
  return authenticatedFetch<SubscriptionPlan[] | Subscription>(
    "/api/subscription/plans",
  );
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<
  ApiResult<Subscription | null>
> {
  return authenticatedFetch<Subscription | null>("/api/subscription/status");
}

/**
 * Create a web checkout session for subscription
 */
export async function createWebCheckout(
  planId: string,
): Promise<ApiResult<CheckoutSessionData>> {
  return authenticatedFetch<CheckoutSessionData>(
    "/api/subscription/web-checkout",
    {
      method: "POST",
      body: JSON.stringify({ planId }),
    },
  );
}

/**
 * Create an app checkout session for subscription (for mobile)
 */
export async function createAppCheckout(
  planId: string,
): Promise<ApiResult<CheckoutSessionData>> {
  return authenticatedFetch<CheckoutSessionData>(
    "/api/subscription/app-checkout",
    {
      method: "POST",
      body: JSON.stringify({ planId }),
    },
  );
}

/**
 * Cancel current subscription (will cancel at period end)
 */
export async function cancelSubscription(): Promise<
  ApiResult<{ message: string }>
> {
  return authenticatedFetch<{ message: string }>("/api/subscription/cancel", {
    method: "POST",
  });
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(params?: {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  type?: string;
}): Promise<
  ApiResult<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }>
> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);

  const query = queryParams.toString();
  const path = `/api/subscription/transactions${query ? `?${query}` : ""}`;

  return authenticatedFetch<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }>(path);
}

/**
 * Validate premium access
 */
export async function validatePremiumAccess(): Promise<
  ApiResult<{ message: string }>
> {
  return authenticatedFetch<{ message: string }>(
    "/api/subscription/validate-premium",
  );
}
