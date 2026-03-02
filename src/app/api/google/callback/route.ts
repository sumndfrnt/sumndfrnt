import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/email-sender";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/settings?error=No+code+received", req.url)
    );
  }

  try {
    const tokens = await exchangeCode(code);
    return NextResponse.redirect(
      new URL(`/admin/settings?connected=${encodeURIComponent(tokens.email)}`, req.url)
    );
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(err.message)}`, req.url)
    );
  }
}
