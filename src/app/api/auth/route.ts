import { NextRequest, NextResponse } from "next/server";

/**
 * Admin auth — two methods:
 *
 * 1. Email/password (fallback)
 * 2. Google OAuth (primary) — validates Google token server-side
 *
 * Env vars:
 * - ADMIN_EMAIL=hi@sumndfrnt.com
 * - ADMIN_PASSWORD=<password> (fallback)
 * - ADMIN_TOKEN=<random-secret>
 * - GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL || "hi@sumndfrnt.com";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 500 });
  }

  // Google OAuth flow — verify the credential token
  if (body.googleToken) {
    try {
      // Verify with Google's tokeninfo endpoint
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${body.googleToken}`
      );
      const payload = await res.json();

      if (!res.ok || payload.error) {
        return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
      }

      // Verify the email matches admin and the audience matches our client ID
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 });
      }

      if (payload.email !== adminEmail) {
        return NextResponse.json({ error: "Unauthorized account" }, { status: 401 });
      }

      // Verified — return admin token
      return NextResponse.json({
        token: adminToken,
        user: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        },
      });
    } catch {
      return NextResponse.json({ error: "Google verification failed" }, { status: 401 });
    }
  }

  // Password fallback
  const { email, password } = body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Password auth not configured" }, { status: 500 });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ token: adminToken });
}
