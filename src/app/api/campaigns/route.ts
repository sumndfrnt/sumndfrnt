import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, saveCampaign, getCampaignById, type Campaign } from "@/lib/data";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const c = getCampaignById(id);
    return c ? NextResponse.json(c) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(getCampaigns());
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.name || !body.subject) return NextResponse.json({ error: "Name and subject required" }, { status: 400 });

  const campaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: body.name,
    subject: body.subject,
    preheader: body.preheader || "",
    mode: body.mode || "html",
    blocks: body.blocks || [],
    html: body.html || "",
    targetTags: body.targetTags || [],
    status: "draft",
    stats: { sent: 0, opened: 0, clicked: 0, unsubscribed: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveCampaign(campaign);
  return NextResponse.json(campaign, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const existing = getCampaignById(body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
  saveCampaign(updated);
  return NextResponse.json(updated);
}
