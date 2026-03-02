import { defaultEvents, type SDEvent } from "@/data/events";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "data", "events.json");

/**
 * Load events from JSON file, fallback to defaults.
 */
function loadEvents(): SDEvent[] {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return defaultEvents;
}

/**
 * Get upcoming events (date >= today), sorted soonest first.
 */
export async function getUpcomingEvents(): Promise<SDEvent[]> {
  const all = loadEvents();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return all
    .filter((e) => new Date(e.date + "T23:59:59") >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get past events (date < today), sorted most recent first.
 */
export async function getPastEvents(): Promise<SDEvent[]> {
  const all = loadEvents();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return all
    .filter((e) => new Date(e.date + "T23:59:59") < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all events.
 */
export async function getAllEvents(): Promise<SDEvent[]> {
  return loadEvents().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
