import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const THIRTY_MINUTES_SECONDS = 1800;

type BackendGetOptions = {
  cache?: RequestCache;
  revalidateSeconds?: number;
};

export type HomeCategory = {
  id: string;
  name: string;
  color?: string | null;
  icon?: string;
  backgroundImage?: string | null;
};

export type HomeSubcategory = {
  id: string | number;
  name: string;
  color?: string | null;
  categoryId?: string | number;
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
  link?: string | null;
  subcategoryId?: string | number | null;
  category?: {
    id?: string | null;
    name?: string | null;
  } | null;
  subcategory?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  options?: BackendGetOptions,
): Promise<T | null> {
  try {
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: options?.cache ?? "no-store",
    };

    if (options?.revalidateSeconds !== undefined) {
      fetchOptions.next = { revalidate: options.revalidateSeconds };
    }

    const response = await fetch(`${BACKEND_URL}${path}`, fetchOptions);

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

export async function getAllCategories(): Promise<HomeCategory[]> {
  const { token } = await getAuthContext();
  if (!token) return [];

  const response = await backendGet<HomeCategory[]>("/api/category", token, {
    cache: "force-cache",
    revalidateSeconds: THIRTY_MINUTES_SECONDS,
  });
  return Array.isArray(response) ? response : [];
}

export async function getCategoryDetailsData(categoryId: string): Promise<{
  category: HomeCategory | null;
  subcategories: HomeSubcategory[];
}> {
  const { token } = await getAuthContext();
  if (!token) {
    return { category: null, subcategories: [] };
  }

  const [categoriesResponse, subcategoriesResponse] = await Promise.all([
    backendGet<HomeCategory[]>("/api/category", token, {
      cache: "force-cache",
      revalidateSeconds: THIRTY_MINUTES_SECONDS,
    }),
    backendGet<HomeSubcategory[]>(
      `/api/subcategory?categoryId=${encodeURIComponent(categoryId)}`,
      token,
      {
        cache: "force-cache",
        revalidateSeconds: THIRTY_MINUTES_SECONDS,
      },
    ),
  ]);

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : [];
  const subcategories = Array.isArray(subcategoriesResponse)
    ? subcategoriesResponse
    : [];

  return {
    category: categories.find((item) => item.id === categoryId) || null,
    subcategories,
  };
}

export async function getSubcategoryMeditationsPaginated(
  subcategoryId: string,
  limit = 10,
  page = 1,
): Promise<{
  data: HomeMeditation[];
  pagination: PaginationData;
}> {
  const { token } = await getAuthContext();
  if (!token) {
    return {
      data: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const response = await backendGet<{
    data?: HomeMeditation[];
    pagination?: PaginationData;
  }>(
    `/api/meditation/subcategory/paginated?subcategoryId=${encodeURIComponent(subcategoryId)}&limit=${limit}&page=${page}`,
    token,
    {
      cache: "force-cache",
      revalidateSeconds: THIRTY_MINUTES_SECONDS,
    },
  );

  const data = Array.isArray(response?.data) ? response.data : [];
  const pagination = response?.pagination || {
    total: data.length,
    page,
    limit,
    totalPages: 1,
  };

  return {
    data: data.map((meditation) => ({
      ...meditation,
      duration: normalizeDuration(meditation.duration),
    })),
    pagination,
  };
}

export async function getProfileData(): Promise<ProfileUser | null> {
  const { token, userId } = await getAuthContext();
  if (!token || !userId) return null;

  const response = await backendGet<ProfileResponse>(
    `/api/user/${userId}`,
    token,
  );
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
    typeof user.subscriptionType === "string"
      ? user.subscriptionType.trim()
      : "";
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
