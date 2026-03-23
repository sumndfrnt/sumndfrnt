import { NextRequest, NextResponse } from "next/server";
import { getCampaignById, saveCampaign, getActiveEmailSubscribers, mergeFields, type Subscriber } from "@/lib/data";
import { renderCampaignEmail } from "@/lib/email-renderer";
import { sendEmail } from "@/lib/email-sender";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sumndfrnt.com";

  // Test email — send a sample to a specific address
  if (body.test && body.testEmail) {
    const testSub: Subscriber = {
      id: "test-sub",
      firstName: "Test",
      lastName: "User",
      email: body.testEmail,
      tags: [],
      source: "test",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const testHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding:0 0 24px;"><img src="${baseUrl}/logo-512.png" width="60" style="border-radius:50%;" /></td></tr>
<tr><td style="text-align:center;padding:0 0 12px;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Connection test successful.</h1></td></tr>
<tr><td style="text-align:center;padding:0 0 24px;"><p style="margin:0;font-size:16px;color:rgba(255,255,255,0.5);">Your Google Workspace is connected and ready to send.</p></td></tr>
<tr><td style="padding:24px 0 0;border-top:1px solid rgba(255,255,255,0.06);text-align:center;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">SUM'N DFRNT · Atlanta, GA</p></td></tr>
</table></td></tr></table></body></html>`;

    const success = await sendEmail({
      to: body.testEmail,
      subject: "SUM'N DFRNT — Test Email",
      html: testHtml,
    });

    return success
      ? NextResponse.json({ sent: 1 })
      : NextResponse.json({ error: "Failed to send. Check Google connection." }, { status: 500 });
  }

  // Production send
  const { campaignId } = body;
  const campaign = getCampaignById(campaignId);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 400 });

  let subscribers: Subscriber[] = [];
  if (campaign.targetTags.length > 0) {
    for (const tag of campaign.targetTags) {
      const tagSubs = await getActiveEmailSubscribers(tag);
      subscribers.push(...tagSubs);
    }
    const seen = new Set<string>();
    subscribers = subscribers.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  } else {
    subscribers = await getActiveEmailSubscribers();
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
  }

  let sentCount = 0;
  const errors: string[] = [];

  // Individual sends — one email per subscriber, no CC/BCC
  for (const sub of subscribers) {
    if (!sub.email) continue;

    const html = renderCampaignEmail(campaign, sub, baseUrl);
    const subject = mergeFields(campaign.subject, sub, baseUrl);

    const success = await sendEmail({ to: sub.email, subject, html });

    if (success) sentCount++;
    else errors.push(sub.email);

    // Rate limit — 200ms between sends
    await new Promise((r) => setTimeout(r, 200));
  }

  campaign.status = "sent";
  campaign.sentAt = new Date().toISOString();
  campaign.stats.sent = sentCount;
  saveCampaign(campaign);

  return NextResponse.json({ sent: sentCount, total: subscribers.length, errors: errors.length });
}
