import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════
const buckets = new Map<string, { count: number; reset: number }>();

function rateOk(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) { buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

// Cleanup stale entries every 5 min
if (typeof globalThis !== "undefined") {
  const id = "__sd_cleanup";
  if (!(globalThis as any)[id]) {
    (globalThis as any)[id] = true;
    setInterval(() => {
      const now = Date.now();
      buckets.forEach((v, k) => { if (now > v.reset) buckets.delete(k); });
    }, 300_000);
  }
}

// ═══════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "0";

  // ── Block direct access to data files ──
  if (
    pathname.startsWith("/data") ||
    pathname.endsWith("subscribers.json") ||
    pathname.endsWith("campaigns.json") ||
    pathname.endsWith("automations.json") ||
    pathname.endsWith("tracking.json") ||
    pathname.endsWith("google-tokens.json") ||
    pathname.endsWith("merch-emails.json") ||
    pathname.endsWith("templates.json")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Rate limits ──
  if (pathname === "/api/subscribe" && req.method === "POST") {
    if (!rateOk(`sub:${ip}`, 8, 900_000)) {          // 8 per 15 min
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (pathname === "/api/auth" && req.method === "POST") {
    if (!rateOk(`auth:${ip}`, 5, 900_000)) {          // 5 per 15 min
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
  }

  if (pathname === "/api/campaigns/send" && req.method === "POST") {
    if (!rateOk(`send:${ip}`, 3, 3_600_000)) {        // 3 per hour
      return NextResponse.json({ error: "Send limit reached" }, { status: 429 });
    }
  }

  if (pathname === "/api/unsubscribe" && req.method === "POST") {
    if (!rateOk(`unsub:${ip}`, 10, 600_000)) {        // 10 per 10 min
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // ── Track endpoint: validate redirect URL (prevent open redirect) ──
  if (pathname === "/api/campaigns/track") {
    const url = req.nextUrl.searchParams.get("url");
    if (url) {
      try {
        const parsed = new URL(url);
        // Only allow http/https redirects, block javascript: data: etc
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return new NextResponse(null, { status: 400 });
        }
      } catch {
        return new NextResponse(null, { status: 400 });
      }
    }
  }

  // ── Response with security headers ──
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://gmail.googleapis.com;"
  );
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/data/:path*",
    "/((?!_next/static|_next/image|favicon).*)",
  ],
};
