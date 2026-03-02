import { NextRequest, NextResponse } from "next/server";
import { addTrackingEvent, getCampaignById, saveCampaign } from "@/lib/data";

const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const cid = (p.get("c") || "").slice(0, 50);
  const sid = (p.get("s") || "").slice(0, 50);
  const type = p.get("t") === "click" ? "click" as const : "open" as const;
  const redirectUrl = p.get("url") || "";

  // Record tracking (silently — never error)
  if (cid && sid) {
    try {
      addTrackingEvent({ campaignId: cid, subscriberId: sid, type, url: redirectUrl || undefined, timestamp: new Date().toISOString() });
      const c = getCampaignById(cid);
      if (c) {
        if (type === "open") c.stats.opened++;
        if (type === "click") c.stats.clicked++;
        saveCampaign(c);
      }
    } catch {} // never expose errors
  }

  // Click redirect — validate URL strictly
  if (type === "click" && redirectUrl) {
    try {
      const parsed = new URL(redirectUrl);
      if (["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.redirect(parsed.toString());
      }
    } catch {}
    // Invalid URL — go home
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Open pixel
  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
    },
  });
}
