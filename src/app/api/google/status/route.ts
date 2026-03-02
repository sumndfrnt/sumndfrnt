import { NextRequest, NextResponse } from "next/server";
import { getStoredTokens, clearTokens } from "@/lib/email-sender";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = getStoredTokens();
  const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return NextResponse.json({
    configured,
    connected: !!tokens,
    email: tokens?.email || null,
    expiresAt: tokens?.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
  });
}

// DELETE — disconnect
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  clearTokens();
  return NextResponse.json({ disconnected: true });
}
