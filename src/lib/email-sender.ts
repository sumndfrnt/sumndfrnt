/**
 * GOOGLE OAUTH2 + GMAIL API
 *
 * Setup in Google Cloud Console:
 * 1. Create project → Enable Gmail API
 * 2. Create OAuth 2.0 credentials (Web Application)
 * 3. Set redirect URI: https://sumndfrnt.com/api/google/callback
 * 4. Add env vars to Vercel:
 *    GOOGLE_CLIENT_ID=...
 *    GOOGLE_CLIENT_SECRET=...
 *    GOOGLE_REDIRECT_URI=https://sumndfrnt.com/api/google/callback
 *
 * Then go to /admin/settings and click "Connect Google Workspace"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const TOKEN_FILE = join(DATA_DIR, "google-tokens.json");

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  email: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

// ── Token management ──

export function getStoredTokens(): GoogleTokens | null {
  ensureDir();
  try {
    if (existsSync(TOKEN_FILE)) {
      return JSON.parse(readFileSync(TOKEN_FILE, "utf-8"));
    }
  } catch {}
  return null;
}

export function saveTokens(tokens: GoogleTokens) {
  ensureDir();
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export function clearTokens() {
  ensureDir();
  if (existsSync(TOKEN_FILE)) {
    writeFileSync(TOKEN_FILE, "");
  }
}

export function isGoogleConnected(): boolean {
  return getStoredTokens() !== null;
}

// ── OAuth2 flow ──

export function getAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) throw new Error("Google OAuth not configured");

  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  // Get user email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json();

  const tokens: GoogleTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
    email: user.email,
  };

  saveTokens(tokens);
  return tokens;
}

async function refreshAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh_token) throw new Error("No refresh token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  tokens.access_token = data.access_token;
  tokens.expiry_date = Date.now() + data.expires_in * 1000;
  saveTokens(tokens);

  return data.access_token;
}

async function getValidAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens) throw new Error("Google not connected");

  // Refresh if expired or expiring in 5 minutes
  if (Date.now() > tokens.expiry_date - 300000) {
    return refreshAccessToken();
  }

  return tokens.access_token;
}

// ── Gmail API send ──

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken();
    const tokens = getStoredTokens();
    const from = tokens?.email || "hi@sumndfrnt.com";

    // Build RFC 2822 MIME message
    const boundary = `boundary_${Date.now()}`;
    const messageParts = [
      `From: SUM'N DFRNT <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(html).toString("base64"),
      ``,
      `--${boundary}--`,
    ];

    const rawMessage = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Gmail API error:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}
