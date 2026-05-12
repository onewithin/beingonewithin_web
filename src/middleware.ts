import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
  "/home",
  "/meditation",
  "/profile",
  "/downloads",
  "/liked",
  "/mylibrary",
  "/plans",
  "/account",
  "/notifications",
  "/support",
  "/terms",
  "/onboarding-setup",
];

// Routes only accessible when NOT signed in
const GUEST_ONLY_PREFIXES = [
  "/sign-in",
  "/verify-otp",
  "/personal-info",
  "/introduction",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const otpEmail = request.cookies.get("otp_email")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isGuestOnly = GUEST_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Unauthenticated user tries to access a protected page → send to sign-in
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Signed-in users should not stay on the marketing landing page
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // OTP page requires an active OTP session when user is not signed in
  if (pathname === "/verify-otp" && !token && !otpEmail) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Already-authenticated user tries to access a guest-only page → send to home
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|icons|images|logos|audios|fonts).*)",
  ],
};
