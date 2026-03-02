import { NextRequest, NextResponse } from "next/server";
import { getAutomations, saveAutomation, type Automation } from "@/lib/data";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getAutomations());
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const auto: Automation = {
    id: `auto-${Date.now()}`,
    name: body.name || "Untitled",
    trigger: body.trigger || "signup_any",
    enabled: body.enabled ?? false,
    subject: body.subject || "",
    mode: body.mode || "html",
    blocks: body.blocks || [],
    html: body.html || "",
    delayMinutes: body.delayMinutes || 0,
    stats: { sent: 0, opened: 0 },
    createdAt: new Date().toISOString(),
  };

  saveAutomation(auto);
  return NextResponse.json(auto, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const autos = getAutomations();
  const existing = autos.find((a) => a.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = { ...existing, ...body };
  saveAutomation(updated);
  return NextResponse.json(updated);
}
