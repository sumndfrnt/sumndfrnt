import { NextRequest, NextResponse } from "next/server";
import { unsubscribeById, getSubscriberById, getCampaigns, saveCampaign } from "@/lib/data";

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ success: true }); // never reveal errors
  }

  const id = typeof body?.id === "string" ? body.id.slice(0, 100) : "";
  if (!id) return NextResponse.json({ success: true }); // same response always

  // Process silently — never confirm whether ID exists
  const sub = getSubscriberById(id);
  if (sub && sub.status === "active") {
    unsubscribeById(id);

    const campaigns = getCampaigns()
      .filter((c) => c.status === "sent")
      .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
    if (campaigns[0]) { campaigns[0].stats.unsubscribed++; saveCampaign(campaigns[0]); }
  }

  // Always return success — prevents subscriber enumeration
  return NextResponse.json({ success: true });
}
