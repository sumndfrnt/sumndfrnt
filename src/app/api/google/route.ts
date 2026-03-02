import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/email-sender";

export async function GET(req: NextRequest) {
  // Verify admin token in query params
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI." },
      { status: 500 }
    );
  }
}
