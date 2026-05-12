import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export type HomeCategory = {
  id: string;
  name: string;
  color?: string | null;
};

export type HomeTag = {
  id: string;
  name: string;
};

export type HomeMeditation = {
  id: string;
  title: string;
  duration?: number | string | null;
  thumbnail?: string | null;
  isLiked?: boolean;
  category?: {
    name?: string | null;
  } | null;
};

export type HomeThought = {
  id: string;
  title: string;
  duration?: string | number | null;
  thumbnail?: string | null;
  link?: string | null;
};

type HomeData = {
  greeting: string;
  todayThought: HomeThought | null;
  dailyThoughts: HomeThought[];
  categories: HomeCategory[];
  madeForYou: HomeMeditation[];
  topics: HomeTag[];
};

type DownloadedMeditation = {
  id: string;
  title: string;
  duration?: number | string | null;
  thumbnail?: string | null;
  downloadedAt?: string;
};

type LikedMeditationItem = {
  id: string;
  meditationId: string;
  meditation: HomeMeditation;
};

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isSubscribed: boolean;
  planLabel: string;
};

type ProfileResponse = {
  success?: boolean;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isSubscribed?: boolean | null;
    subscriptionType?: string | null;
  };
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

export async function backendGet<T>(
  path: string,
  token: string,
): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 20) return "Good evening";
  return "Good night";
}

export function normalizeDuration(duration?: string | number | null): string {
  if (duration === null || duration === undefined) return "10 min";
  if (typeof duration === "number") return `${duration} min`;

  const numeric = Number(duration);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return `${numeric} min`;
  }

  return duration;
}

export async function getHomeData(): Promise<HomeData> {
  const { token } = await getAuthContext();

  if (!token) {
    return {
      greeting: getGreeting(),
      todayThought: null,
      dailyThoughts: [],
      categories: [],
      madeForYou: [],
      topics: [],
    };
  }

  const [
    todayThoughtResponse,
    dailyThoughtsResponse,
    categoriesResponse,
    madeForYouResponse,
    tagsResponse,
  ] = await Promise.all([
    backendGet<{ thought?: HomeThought | null }>("/api/thought/today", token),
    backendGet<{ thoughts?: { data?: HomeThought[] } | HomeThought[] }>(
      "/api/thought?limit=10",
      token,
    ),
    backendGet<HomeCategory[]>("/api/category", token),
    backendGet<{ data?: HomeMeditation[] } | HomeMeditation[]>(
      "/api/meditation/by-user-tags?limit=12",
      token,
    ),
    backendGet<HomeTag[]>("/api/tags", token),
  ]);

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : [];
  const topics = Array.isArray(tagsResponse) ? tagsResponse : [];

  const madeForYou = Array.isArray(madeForYouResponse)
    ? madeForYouResponse
    : madeForYouResponse?.data || [];

  const dailyThoughtsRaw = Array.isArray(dailyThoughtsResponse?.thoughts)
    ? dailyThoughtsResponse?.thoughts
    : dailyThoughtsResponse?.thoughts?.data || [];

  const dailyThoughts = dailyThoughtsRaw.map((thought) => ({
    ...thought,
    duration: normalizeDuration(thought.duration),
  }));

  const todayThought = todayThoughtResponse?.thought
    ? {
        ...todayThoughtResponse.thought,
        duration: normalizeDuration(todayThoughtResponse.thought.duration),
      }
    : null;

  return {
    greeting: getGreeting(),
    todayThought,
    dailyThoughts,
    categories,
    madeForYou,
    topics,
  };
}

export async function getDailyThoughtsData(limit = 30): Promise<HomeThought[]> {
  const { token } = await getAuthContext();
  if (!token) return [];

  const response = await backendGet<{
    thoughts?: { data?: HomeThought[] } | HomeThought[];
  }>(`/api/thought?limit=${limit}`, token);

  const thoughtsRaw = Array.isArray(response?.thoughts)
    ? response.thoughts
    : response?.thoughts?.data || [];

  return thoughtsRaw.map((thought) => ({
    ...thought,
    duration: normalizeDuration(thought.duration),
  }));
}

export async function getDownloadedMeditationsData(
  limit = 30,
): Promise<DownloadedMeditation[]> {
  const { token } = await getAuthContext();
  if (!token) return [];

  const response = await backendGet<{ data?: DownloadedMeditation[] }>(
    `/api/downloads?limit=${limit}`,
    token,
  );

  const data = response?.data || [];

  return data.map((item) => ({
    ...item,
    duration: normalizeDuration(item.duration),
  }));
}

export async function getLikedMeditationsData(
  limit = 30,
): Promise<HomeMeditation[]> {
  const { token, userId } = await getAuthContext();
  if (!token || !userId) return [];

  const response = await backendGet<{
    likedMeditations?: LikedMeditationItem[];
  }>(`/api/liked/user/${userId}?limit=${limit}`, token);

  const liked = response?.likedMeditations || [];

  return liked
    .map((item) => item.meditation)
    .filter((meditation): meditation is HomeMeditation =>
      Boolean(meditation?.id),
    )
    .map((meditation) => ({
      ...meditation,
      isLiked: true,
      duration: normalizeDuration(meditation.duration),
    }));
}

export async function getProfileData(): Promise<ProfileUser | null> {
  const { token, userId } = await getAuthContext();
  if (!token || !userId) return null;

  const response = await backendGet<ProfileResponse>(`/api/user/${userId}`, token);
  const user = response?.user;

  if (!user?.id) {
    return null;
  }

  const name = (user.name || "").trim() || "User";
  const email = typeof user.email === "string" ? user.email : "";
  const image =
    typeof user.image === "string" && user.image.trim().length > 0
      ? user.image
      : null;

  const rawSubscriptionType =
    typeof user.subscriptionType === "string" ? user.subscriptionType.trim() : "";
  const isSubscribed = Boolean(user.isSubscribed);
  const planLabel = rawSubscriptionType
    ? `${rawSubscriptionType} Plan`
    : isSubscribed
      ? "Premium Plan"
      : "Free Plan";

  return {
    id: user.id,
    name,
    email,
    image,
    isSubscribed,
    planLabel,
  };
}
