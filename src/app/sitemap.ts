import type { MetadataRoute } from "next";

// ─── Base URL ────────────────────────────────────────────────────────────────
// NOTE: Parentheses around the ternary are required — without them,
// the || binds tighter and NEXT_PUBLIC_SITE_URL always wins even when empty.

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://beingonewithin.com");

// ─── Static PUBLIC routes only ───────────────────────────────────────────────
// Rule: only pages a logged-out user (and Googlebot) can actually render
// should appear in the sitemap. Authenticated-only pages (/home, /profile,
// /account, /notifications, /mylibrary, /downloads) are excluded because:
//   1. Crawlers get a redirect/login wall → soft 404 signals.
//   2. Indexing them wastes crawl budget.
//   3. They carry no unique, rankable content.

const staticRoutes: MetadataRoute.Sitemap = [
  {
    // Homepage — highest priority, crawled most often
    url: `${BASE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    // Pricing / plans — key conversion page
    url: `${BASE_URL}/plans`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    // Daily thoughts — fresh content, high crawl frequency
    url: `${BASE_URL}/daily-thoughts`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    // Sign-in — useful for crawlers to discover, low priority
    url: `${BASE_URL}/sign-in`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/support`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/terms`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

// ─── Sitemap export ──────────────────────────────────────────────────────────

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes;
}
