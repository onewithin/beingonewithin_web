import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://beingonewithin.com");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Rule 1: General crawlers ──────────────────────────────────────────
      // Only allow pages that:
      //   (a) a logged-out user can actually see, AND
      //   (b) contain rankable, unique content.
      // Authenticated-only pages (/home, /profile, etc.) are excluded —
      // crawlers hit a login wall there, producing soft-404 signals that
      // waste crawl budget and can hurt domain-level crawl health.
      {
        userAgent: "*",
        allow: [
          "/", // Homepage
          "/plans", // Pricing — key conversion page
          "/sign-in", // Auth entry point (low priority but reachable)
          "/daily-thoughts", // Fresh public content
          "/meditation/", // All dynamic meditation detail pages
          "/support", // Support / help centre
          "/terms", // Legal — required for trust signals
        ],
        disallow: [
          // ── Authenticated / personalised pages ──────────────────────────
          // Crawlers can't log in → these pages return a redirect or empty
          // shell, and indexing them creates duplicate/thin content issues.
          "/home",
          "/mylibrary",
          "/downloads",
          "/profile",
          "/account",
          "/notifications",

          // ── Onboarding flow ──────────────────────────────────────────────
          // Transient, stateful pages with no indexable content
          "/personal-info",
          "/introduction",
          "/verify-otp",
          "/onboarding-setup",

          // ── Internal Next.js / API surface ──────────────────────────────
          "/api/", // All API routes
          "/_next/", // Next.js build chunks
          "/static/", // Any /static directory

          // ── Utility / search result pages ────────────────────────────────
          "/search", // Prevent indexing of search result pages
        ],
      },

      // ── Rule 2: GPTBot (OpenAI crawler) ──────────────────────────────────
      // You may want to restrict AI training crawlers separately.
      // Remove this block if you're fine with OpenAI crawling your content.
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },

      // ── Rule 3: Google-Extended (Bard / Gemini training) ─────────────────
      // Same rationale as GPTBot — opt out of AI training data collection.
      // Remove if you want Google AI to use your content.
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },

      // ── Rule 4: Common scrapers & bad bots ───────────────────────────────
      // These are not legitimate search crawlers — blocking them reduces
      // server load and protects your content from low-quality aggregators.
      {
        userAgent: [
          "AhrefsBot", // SEO tool scraper (aggressive crawler)
          "SemrushBot", // SEO tool scraper
          "MJ12bot", // Majestic SEO crawler
          "DotBot", // OpenLinkProfiler crawler
          "BLEXBot", // Link extractor bot
        ],
        disallow: ["/"],
      },
    ],

    // ── Sitemap declaration ──────────────────────────────────────────────────
    // Most crawlers discover and parse this automatically.
    // Googlebot uses it to schedule crawls efficiently.
    sitemap: `${BASE_URL}/sitemap.xml`,

    // ── Host declaration ────────────────────────────────────────────────────
    // Signals the preferred domain (canonical host) to crawlers that support it.
    host: BASE_URL,
  };
}
