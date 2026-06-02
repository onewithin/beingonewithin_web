import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Sniglet } from "next/font/google";
import Script from "next/script";
import { AudioProvider } from "@/contexts/AudioContext";

// ─── Fonts ───────────────────────────────────────────────────────────────────

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap", // prevents invisible text during font load (CLS fix)
});

const sniglet = Sniglet({
  weight: ["400", "800"],
  subsets: ["latin"],
  variable: "--font-sniglet",
  display: "swap",
});

// ─── Base URL ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://beingonewithin.com");

// ─── Metadata ────────────────────────────────────────────────────────────────
// Covers: basic tags, Open Graph, Twitter Card, robots directives,
// search-console verification, PWA manifest, Apple web-app, and canonicals.

export const metadata: Metadata = {
  // Required so relative image paths resolve correctly in OG / Twitter tags
  metadataBase: new URL(BASE_URL),

  // ── Titles ──────────────────────────────────────────────────────────────
  title: {
    // Shown on the homepage tab and as the default OG title
    default: "BeingOneWithin – Guided Meditation & Mindfulness App",
    // "%s" is replaced by each page's own title export
    template: "%s | BeingOneWithin",
  },

  // ── Description ─────────────────────────────────────────────────────────
  // 150–160 chars; front-load the primary keyword phrase
  description:
    "Discover guided meditations, breathwork sessions, and daily mindfulness practices on BeingOneWithin. Reduce anxiety, sleep better, and build lasting calm — anytime, anywhere.",

  // ── Keywords (minor signal, still worth setting) ─────────────────────────
  keywords: [
    "guided meditation app",
    "mindfulness meditation",
    "sleep meditation",
    "anxiety relief meditation",
    "breathwork exercises",
    "daily meditation practice",
    "spiritual wellness",
    "stress relief meditation",
    "BeingOneWithin",
    "calm meditation",
  ],

  // ── Identity ─────────────────────────────────────────────────────────────
  applicationName: "BeingOneWithin",
  authors: [{ name: "BeingOneWithin", url: BASE_URL }],
  creator: "BeingOneWithin",
  publisher: "BeingOneWithin",
  category: "Health & Wellness",

  // ── Robots ───────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,      // allow full video previews in search
      "max-image-preview": "large", // allow large image previews
      "max-snippet": -1,            // allow full text snippets
    },
  },

  // ── Search Console & Webmaster verification ──────────────────────────────
  // Replace placeholder values with real tokens from each platform's dashboard.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
    // other: [{ name: "msvalidate.01", value: process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "" }],
  },

  // ── Open Graph ───────────────────────────────────────────────────────────
  // OG image MUST be 1200×630 px — logos are too small and get cropped/rejected.
  // Place the image at /public/og-image.jpg and update the path below.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "BeingOneWithin",
    title: "BeingOneWithin – Guided Meditation & Mindfulness App",
    description:
      "Build lasting calm with guided meditations, breathwork, and daily mindfulness practices designed for real life.",
    images: [
      {
        url: "/icons/logo.png",  // ← replace with a 1200×630 branded og-image.jpg for best results
        width: 512,
        height: 512,
        alt: "BeingOneWithin – Guided Meditation & Mindfulness App",
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ─────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image", // upgraded from "summary" — shows full banner
    site: "@BeingOneWithin",     // your Twitter/X handle
    creator: "@BeingOneWithin",
    title: "BeingOneWithin – Guided Meditation & Mindfulness App",
    description:
      "Guided meditations, breathwork and daily calm – designed for real life.",
    images: ["/icons/logo.png"],
  },

  // ── PWA / Icons ──────────────────────────────────────────────────────────
  // Requires /public/manifest.json — see note below about creating one.
  manifest: "/manifest.json",

  // Apple-specific meta — important for "Add to Home Screen" on iOS Safari
  appleWebApp: {
    capable: true,
    title: "BeingOneWithin",
    statusBarStyle: "default",
  },

  // ── Phone number auto-detection ──────────────────────────────────────────
  // Prevents iOS Safari from turning numbers into tap-to-call links unexpectedly
  formatDetection: {
    telephone: false,
  },

  // ── Canonical ────────────────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    // Add language alternates here if/when you add i18n:
    // languages: { "hi": `${BASE_URL}/hi`, "ml": `${BASE_URL}/ml` },
  },
};

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
// These schemas are invisible to users but are read by Google, Bing, and AI
// search engines. They enable rich results (sitelinks searchbox, knowledge
// panel, breadcrumbs) and establish entity authority.
//
// WebSite schema  → enables the Sitelinks Searchbox in Google results
// Organization    → powers the Knowledge Panel and brand entity recognition
// MobileApplication → marks you as an app, may trigger app rich results

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BeingOneWithin",
  url: BASE_URL,
  description:
    "Guided meditations, breathwork sessions, and daily mindfulness practices for real life.",
  potentialAction: {
    // Sitelinks Searchbox — replace with your actual search URL pattern
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BeingOneWithin",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/icons/logo.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    // Add your verified social profiles — each one strengthens entity authority
    // "https://www.instagram.com/beingonewithin",
    // "https://twitter.com/BeingOneWithin",
    // "https://www.youtube.com/@BeingOneWithin",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE_URL}/support`,
    availableLanguage: ["English"],
  },
};

const mobileAppSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "BeingOneWithin",
  operatingSystem: "iOS, Android",
  applicationCategory: "HealthApplication",
  offers: {
    "@type": "Offer",
    price: "0",          // free tier exists
    priceCurrency: "USD",
  },
  url: BASE_URL,
  description:
    "Guided meditations, breathwork, and daily mindfulness practices for real life.",
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          ── Theme color ─────────────────────────────────────────────────────
          Controls the browser chrome color on mobile (address bar, etc.)
          Match this to your primary brand color.
        */}
        <meta name="theme-color" content="#ecf9ef" />

        {/*
          ── Favicon chain ───────────────────────────────────────────────────
          Provide all sizes; browsers pick the best fit.
          Generate them at https://realfavicongenerator.net
        */}
        <link rel="icon" href="/icons/logo.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icons/logo.png" />
      </head>

      <body
        className={`${poppins.variable} ${sniglet.variable} antialiased bg-[radial-gradient(circle_at_top,_#ecf9ef_0%,_#ffffff_50%,_#f9fbfa_100%)] min-h-screen`}
      >
        <AudioProvider>
          {children}
        </AudioProvider>

        {/*
          ── JSON-LD ─────────────────────────────────────────────────────────
          Injected as separate <script> tags so each schema is self-contained
          and easier to validate in Google's Rich Results Test.
          strategy="beforeInteractive" is intentionally NOT used here —
          structured data doesn't need to block rendering.
        */}
        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="schema-app"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileAppSchema) }}
        />
      </body>
    </html>
  );
}