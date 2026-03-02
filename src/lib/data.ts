import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadFile<T>(filename: string, fallback: T): T {
  ensureDir();
  const path = join(DATA_DIR, filename);
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf-8"));
  } catch {}
  return fallback;
}

function saveFile<T>(filename: string, data: T) {
  ensureDir();
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════
// SUBSCRIBERS
// ═══════════════════════════════════════
export interface Subscriber {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags: string[];
  source: string;
  status: "active" | "unsubscribed";
  createdAt: string;
  unsubscribedAt?: string;
}

export function getSubscribers(): Subscriber[] {
  return loadFile("subscribers.json", []);
}

export function saveSubscribers(subs: Subscriber[]) {
  saveFile("subscribers.json", subs);
}

export function addSubscriber(sub: Omit<Subscriber, "id" | "createdAt" | "status">): Subscriber {
  const subs = getSubscribers();

  // Check duplicate by email
  if (sub.email && subs.some((s) => s.email === sub.email && s.status === "active")) {
    throw new Error("Already subscribed");
  }

  const newSub: Subscriber = {
    ...sub,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  subs.push(newSub);
  saveSubscribers(subs);
  return newSub;
}

export function unsubscribeById(id: string) {
  const subs = getSubscribers();
  const sub = subs.find((s) => s.id === id);
  if (sub) {
    sub.status = "unsubscribed";
    sub.unsubscribedAt = new Date().toISOString();
    saveSubscribers(subs);
  }
}

export function getActiveEmailSubscribers(tag?: string): Subscriber[] {
  return getSubscribers().filter(
    (s) => s.status === "active" && s.email && (!tag || s.tags.includes(tag))
  );
}

export function getSubscriberById(id: string): Subscriber | null {
  return getSubscribers().find((s) => s.id === id) || null;
}

// ═══════════════════════════════════════
// DYNAMIC FIELDS — merge tags into HTML
// ═══════════════════════════════════════
export function mergeFields(html: string, sub: Subscriber, baseUrl: string): string {
  const unsubLink = `${baseUrl}/unsubscribe?id=${sub.id}`;
  return html
    .replace(/\{\{first_name\}\}/gi, sub.firstName || "")
    .replace(/\{\{last_name\}\}/gi, sub.lastName || "")
    .replace(/\{\{full_name\}\}/gi, `${sub.firstName} ${sub.lastName}`.trim())
    .replace(/\{\{email\}\}/gi, sub.email || "")
    .replace(/\{\{phone\}\}/gi, sub.phone || "")
    .replace(/\{\{unsubscribe_url\}\}/gi, unsubLink)
    .replace(/\{\{unsubscribe_link\}\}/gi, `<a href="${unsubLink}" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Unsubscribe</a>`);
}

// ═══════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════
export interface EmailBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "spacer";
  content: string;
  url?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "xl";
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  mode: "builder" | "html";    // builder = block editor, html = raw paste
  blocks: EmailBlock[];
  html: string;                // raw HTML for html mode
  targetTags: string[];
  status: "draft" | "sent" | "scheduled";
  sentAt?: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export function getCampaigns(): Campaign[] {
  return loadFile("campaigns.json", []);
}

export function saveCampaigns(campaigns: Campaign[]) {
  saveFile("campaigns.json", campaigns);
}

export function getCampaignById(id: string): Campaign | null {
  return getCampaigns().find((c) => c.id === id) || null;
}

export function saveCampaign(campaign: Campaign) {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) campaigns[idx] = campaign;
  else campaigns.push(campaign);
  saveCampaigns(campaigns);
}

// ═══════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════
export interface EmailTemplate {
  id: string;
  name: string;
  mode: "builder" | "html";
  blocks: EmailBlock[];
  html: string;
  createdAt: string;
}

export function getTemplates(): EmailTemplate[] {
  return loadFile("templates.json", defaultTemplates);
}

export function saveTemplates(templates: EmailTemplate[]) {
  saveFile("templates.json", templates);
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: "tpl-blank-html",
    name: "Paste HTML",
    mode: "html",
    blocks: [],
    html: "",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tpl-event-announce",
    name: "Event Announcement",
    mode: "builder",
    html: "",
    createdAt: "2026-01-01T00:00:00Z",
    blocks: [
      { id: "b1", type: "image", content: "/logo-512.png", align: "center", size: "sm" },
      { id: "b2", type: "spacer", content: "", size: "md" },
      { id: "b3", type: "header", content: "Hey {{first_name}},", align: "center", size: "lg" },
      { id: "b4", type: "text", content: "You're invited to something different.", align: "center", size: "md" },
      { id: "b5", type: "spacer", content: "", size: "sm" },
      { id: "b6", type: "header", content: "[Event Name]", align: "center", size: "xl" },
      { id: "b7", type: "text", content: "[Date] · [Time]\n[Venue] · [City]", align: "center", size: "md" },
      { id: "b8", type: "spacer", content: "", size: "md" },
      { id: "b9", type: "button", content: "Get Tickets", url: "https://", align: "center", size: "md" },
      { id: "b10", type: "spacer", content: "", size: "lg" },
      { id: "b11", type: "divider", content: "", size: "sm" },
      { id: "b12", type: "text", content: "SUM'N DFRNT · Atlanta, GA\n{{unsubscribe_link}}", align: "center", size: "sm" },
    ],
  },
];

// ═══════════════════════════════════════
// AUTOMATIONS
// ═══════════════════════════════════════
export interface Automation {
  id: string;
  name: string;
  trigger: "signup_events" | "signup_merch" | "signup_any";
  enabled: boolean;
  subject: string;
  mode: "builder" | "html";
  blocks: EmailBlock[];
  html: string;
  delayMinutes: number;   // 0 = immediate
  stats: { sent: number; opened: number };
  createdAt: string;
}

export function getAutomations(): Automation[] {
  return loadFile("automations.json", defaultAutomations);
}

export function saveAutomations(autos: Automation[]) {
  saveFile("automations.json", autos);
}

export function getAutomationById(id: string): Automation | null {
  return getAutomations().find((a) => a.id === id) || null;
}

export function saveAutomation(auto: Automation) {
  const autos = getAutomations();
  const idx = autos.findIndex((a) => a.id === auto.id);
  if (idx >= 0) autos[idx] = auto;
  else autos.push(auto);
  saveAutomations(autos);
}

const defaultAutomations: Automation[] = [
  {
    id: "auto-welcome",
    name: "Welcome — Event Signup",
    trigger: "signup_events",
    enabled: false,
    subject: "You're in, {{first_name}}.",
    mode: "html",
    blocks: [],
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding:0 0 24px;"><img src="{{site_url}}/logo-512.png" width="60" style="border-radius:50%;" /></td></tr>
<tr><td style="text-align:center;padding:0 0 8px;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.02em;">You're in, {{first_name}}.</h1></td></tr>
<tr><td style="text-align:center;padding:0 0 24px;"><p style="margin:0;font-size:16px;color:rgba(255,255,255,0.5);line-height:1.6;">Welcome to SUM'N DFRNT. You'll be the first to know when something's happening.</p></td></tr>
<tr><td style="text-align:center;padding:0 0 32px;"><a href="https://instagram.com/sumn.dfrnt" style="display:inline-block;background:#fff;color:#000;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:980px;">Follow @sumn.dfrnt</a></td></tr>
<tr><td style="padding:24px 0 0;border-top:1px solid rgba(255,255,255,0.06);text-align:center;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">SUM'N DFRNT · Atlanta, GA<br>{{unsubscribe_link}}</p></td></tr>
</table></td></tr></table></body></html>`,
    delayMinutes: 0,
    stats: { sent: 0, opened: 0 },
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "auto-merch-welcome",
    name: "Welcome — Merch Signup",
    trigger: "signup_merch",
    enabled: false,
    subject: "You're on the list, {{first_name}}.",
    mode: "html",
    blocks: [],
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding:0 0 24px;"><img src="{{site_url}}/logo-512.png" width="60" style="border-radius:50%;" /></td></tr>
<tr><td style="text-align:center;padding:0 0 8px;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.02em;">You're on the list, {{first_name}}.</h1></td></tr>
<tr><td style="text-align:center;padding:0 0 24px;"><p style="margin:0;font-size:16px;color:rgba(255,255,255,0.5);line-height:1.6;">When official SUM'N DFRNT merch drops, you'll know before anyone.</p></td></tr>
<tr><td style="padding:24px 0 0;border-top:1px solid rgba(255,255,255,0.06);text-align:center;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">SUM'N DFRNT · Atlanta, GA<br>{{unsubscribe_link}}</p></td></tr>
</table></td></tr></table></body></html>`,
    delayMinutes: 0,
    stats: { sent: 0, opened: 0 },
    createdAt: "2026-01-01T00:00:00Z",
  },
];

// ═══════════════════════════════════════
// TRACKING
// ═══════════════════════════════════════
export interface TrackingEvent {
  campaignId: string;
  subscriberId: string;
  type: "open" | "click";
  url?: string;
  timestamp: string;
}

export function getTrackingEvents(): TrackingEvent[] {
  return loadFile("tracking.json", []);
}

export function addTrackingEvent(event: TrackingEvent) {
  const events = getTrackingEvents();
  events.push(event);
  saveFile("tracking.json", events);
}
