import { NextRequest, NextResponse } from "next/server";
import { getTemplates, saveTemplates, type EmailTemplate } from "@/lib/data";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getTemplates());
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const templates = getTemplates();

  const tpl: EmailTemplate = {
    id: `tpl-${Date.now()}`,
    name: body.name || "Untitled Template",
    mode: body.mode || "html",
    blocks: body.blocks || [],
    html: body.html || "",
    createdAt: new Date().toISOString(),
  };

  templates.push(tpl);
  saveTemplates(templates);

  return NextResponse.json(tpl, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const templates = getTemplates().filter((t) => t.id !== id);
  saveTemplates(templates);

  return NextResponse.json({ deleted: id });
}
