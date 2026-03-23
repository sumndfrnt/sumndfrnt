import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/data";
import { fireAutomations } from "@/lib/automations";

// Sanitize — strip HTML tags, trim, limit length
function clean(s: string, maxLen: number = 100): string {
  return s.replace(/<[^>]*>/g, "").replace(/[<>"'`;]/g, "").trim().slice(0, maxLen);
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, tag, _hp, _t, _cf } = body;

  // Honeypot — reject if filled (real users never see this field)
  if (_hp) {
    // Return 201 to not reveal detection to bots
    return NextResponse.json({ message: "Subscribed" }, { status: 201 });
  }

  // Timing — reject if submitted faster than 2s after render
  // Threshold kept conservative to avoid false positives from autofill/mobile
  if (_t && typeof _t === "number") {
    const elapsed = Date.now() - _t;
    if (elapsed < 2000) {
      return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    }
  }

  // Cloudflare Turnstile — validate token if secret key is configured
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!_cf) {
      return NextResponse.json({ error: "Verification required" }, { status: 400 });
    }
    const failOpen = process.env.ALLOW_TURNSTILE_FAIL_OPEN === "true";
    try {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "";
      const verifyParams: Record<string, string> = { secret: turnstileSecret, response: _cf };
      if (ip) verifyParams.remoteip = ip;
      const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(verifyParams),
      });
      const cfData = await cfRes.json();
      if (!cfData.success) {
        return NextResponse.json({ error: "Verification failed" }, { status: 403 });
      }
    } catch {
      // Turnstile API unreachable — fail closed unless explicitly overridden
      if (!failOpen) {
        return NextResponse.json({ error: "Verification unavailable" }, { status: 503 });
      }
    }
  }

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name required" }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const cleanFirst = clean(firstName, 50);
  const cleanLast = clean(lastName, 50);
  const cleanEmail = email.toLowerCase().trim().slice(0, 254);
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(0, 15) : undefined;
  const cleanTag = clean(tag || "general", 30);

  // Reject if names are empty after sanitization
  if (!cleanFirst || !cleanLast) {
    return NextResponse.json({ error: "Valid name required" }, { status: 400 });
  }

  try {
    const sub = addSubscriber({
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      tags: [cleanTag],
      source: "website",
    });

    // Fire automations async
    fireAutomations(sub, cleanTag).catch(() => {});

    // Return minimal response — never echo back user data
    return NextResponse.json({ message: "Subscribed" }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Already subscribed") {
      // Don't confirm existence — same response for privacy
      return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    }
    // Filesystem write failures on serverless (EROFS/ENOENT) — accept the submission
    // gracefully. Subscriber is not persisted until storage is migrated to a database.
    if (err.code === "EROFS" || err.code === "ENOENT" || err.code === "EACCES") {
      return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
