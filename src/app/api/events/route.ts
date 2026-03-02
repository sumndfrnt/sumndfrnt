import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { defaultEvents, type SDEvent } from "@/data/events";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "events.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadEvents(): SDEvent[] {
  ensureDir();
  try {
    if (existsSync(DATA_FILE)) return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {}
  // Initialize with defaults
  writeFileSync(DATA_FILE, JSON.stringify(defaultEvents, null, 2));
  return defaultEvents;
}

function saveEvents(events: SDEvent[]) {
  ensureDir();
  writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_TOKEN;
}

// GET — public, returns all events
export async function GET() {
  const events = loadEvents();
  return NextResponse.json(events);
}

// POST — admin only, create event
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, date, time, venue, city, ticketUrl } = body;

  if (!title || !date || !time || !venue || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const events = loadEvents();
  const newEvent: SDEvent = {
    id: `ev-${Date.now()}`,
    title,
    description: description || "",
    date,
    time,
    venue,
    city,
    ticketUrl: ticketUrl || "",
    createdAt: new Date().toISOString(),
  };

  events.push(newEvent);
  saveEvents(events);

  return NextResponse.json(newEvent, { status: 201 });
}

// DELETE — admin only
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const events = loadEvents();
  const filtered = events.filter((e) => e.id !== id);
  saveEvents(filtered);

  return NextResponse.json({ deleted: id });
}
