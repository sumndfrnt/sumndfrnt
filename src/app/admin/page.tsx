"use client";

import { useState, useEffect, useCallback } from "react";
import type { SDEvent } from "@/data/events";

// ═══════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sd-admin-token");
}

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ═══════════════════════════════════════
// LOGIN — Google OAuth + password fallback
// ═══════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) { setShowPassword(true); return; }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).google?.accounts?.id?.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      setGoogleReady(true);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleToken: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google login failed");
      } else {
        localStorage.setItem("sd-admin-token", data.token);
        if (data.user) localStorage.setItem("sd-admin-user", JSON.stringify(data.user));
        onLogin(data.token);
      }
    } catch {
      setError("Connection failed");
    }
    setLoading(false);
  };

  // Make handleGoogleResponse available globally for the callback
  useEffect(() => {
    (window as any).__sdGoogleAuth = handleGoogleResponse;
  });

  const triggerGoogleSignIn = () => {
    (window as any).google?.accounts?.id?.prompt();
  };

  const handlePasswordSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Login failed");
      else {
        localStorage.setItem("sd-admin-token", data.token);
        onLogin(data.token);
      }
    } catch {
      setError("Connection failed");
    }
    setLoading(false);
  };

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <img src="/logo-512.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Admin</h1>
          <p className="text-sm text-white/35 mt-2">SUM&apos;N DFRNT Control Center</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Google Sign-In */}
          {googleReady && (
            <>
              <button
                onClick={triggerGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium text-[15px] rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[12px] text-white/20">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            </>
          )}

          {/* Password fallback — always available */}
          {(showPassword || !googleReady) ? (
            <>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()} className={inp} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()} className={inp} />
              <button onClick={handlePasswordSubmit} disabled={loading || !email || !password} className="w-full bg-white/10 text-white font-medium text-[15px] rounded-xl py-3.5 hover:bg-white/15 transition-all disabled:opacity-40">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </>
          ) : (
            <button onClick={() => setShowPassword(true)} className="text-[13px] text-white/20 hover:text-white/40 transition-colors">
              Use email & password instead
            </button>
          )}

          {error && <p className="text-[13px] text-red-400/80 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// EVENT FORM
// ═══════════════════════════════════════
function EventForm({ onSave, onCancel, saving }: { onSave: (data: any) => void; onCancel: () => void; saving: boolean }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("Atlanta, GA");
  const [ticketUrl, setTicketUrl] = useState("");

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";
  const lbl = "text-[12px] font-medium text-white/40 tracking-wide mb-1.5 block";

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
      <h3 className="font-display text-xl font-bold text-white mb-6">New Event</h3>
      <div className="flex flex-col gap-5">
        <div><label className={lbl}>TITLE *</label><input type="text" placeholder="Event name" value={title} onChange={(e) => setTitle(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>DESCRIPTION</label><textarea placeholder="What's the vibe?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inp + " resize-none"} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>DATE *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp + " [color-scheme:dark]"} /></div>
          <div><label className={lbl}>TIME *</label><input type="text" placeholder="9:00 PM" value={time} onChange={(e) => setTime(e.target.value)} className={inp} /></div>
        </div>
        <div><label className={lbl}>VENUE *</label><input type="text" placeholder="Venue name" value={venue} onChange={(e) => setVenue(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>CITY *</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inp} /></div>
        <div><label className={lbl}>TICKET / RSVP LINK</label><input type="url" placeholder="https://..." value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} className={inp} /></div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => onSave({ title, description, date, time, venue, city, ticketUrl })} disabled={saving || !title || !date || !time || !venue || !city} className="flex-1 bg-white text-black font-medium text-[14px] rounded-xl py-3 hover:opacity-90 disabled:opacity-40">
            {saving ? "Saving..." : "Add Event"}
          </button>
          <button onClick={onCancel} className="px-6 text-[14px] text-white/50 border border-white/10 rounded-xl py-3 hover:text-white/80 hover:border-white/20 transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"events" | "subscribers" | "campaigns" | "automations">("events");
  const [events, setEvents] = useState<SDEvent[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);

  const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    try {
      const [evRes, subRes, campRes, autoRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/subscribers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/campaigns", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/automations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (subRes.ok) setSubscribers(await subRes.json());
      if (campRes.ok) setCampaigns(await campRes.json());
      if (autoRes.ok) setAutomations(await autoRes.json());
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addEvent = async (data: any) => {
    setSavingEvent(true);
    try {
      const res = await fetch("/api/events", { method: "POST", headers: hdrs, body: JSON.stringify(data) });
      if (res.ok) { setShowEventForm(false); fetchAll(); }
    } catch {}
    setSavingEvent(false);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const deleteSub = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await fetch(`/api/subscribers?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const exportCSV = () => {
    window.open(`/api/subscribers?format=csv&token=${token}`, "_blank");
  };

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = events.filter((e) => new Date(e.date + "T23:59:59") >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = events.filter((e) => new Date(e.date + "T23:59:59") < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activeSubs = subscribers.filter((s: any) => s.status === "active");
  const sentCampaigns = campaigns.filter((c: any) => c.status === "sent");
  const draftCampaigns = campaigns.filter((c: any) => c.status === "draft");

  const tabBtn = (name: string, key: string, count: number) => (
    <button onClick={() => setTab(key as any)} className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${tab === key ? "text-white border-white" : "text-white/30 border-transparent hover:text-white/50"}`}>
      {name} <span className="text-white/20 ml-1">{count}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-512.png" alt="" className="w-7 h-7 rounded-full" />
            <span className="text-[13px] font-medium text-white/50">Control Center</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/settings" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Settings</a>
            <a href="/" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">View Site</a>
            <button onClick={onLogout} className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-white/[0.04] px-6 py-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Upcoming Events", val: upcoming.length },
            { label: "Subscribers", val: activeSubs.length },
            { label: "Campaigns Sent", val: sentCampaigns.length },
            { label: "Total Opens", val: sentCampaigns.reduce((a: number, c: any) => a + (c.stats?.opened || 0), 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="font-display text-2xl font-bold text-white">{s.val}</div>
              <div className="text-[12px] text-white/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gmail connection */}
        <div className="mt-4 flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-white/40">Email Sending:</span>
            <span className="text-[12px] text-white/60">
              {typeof window !== "undefined" ? "Google Workspace (Gmail)" : "—"}
            </span>
          </div>
          <a href="/admin/settings" className="text-[12px] font-medium text-white/40 border border-white/10 rounded-lg px-4 py-1.5 hover:text-white/70 hover:border-white/20 transition-all">
            Connect Gmail
          </a>
        </div>
        </div>

      {/* Tabs */}
      <div className="max-w-[900px] mx-auto px-6 pt-6">
        <div className="flex gap-6 border-b border-white/[0.06] mb-8">
          {tabBtn("Events", "events", events.length)}
          {tabBtn("Subscribers", "subscribers", activeSubs.length)}
          {tabBtn("Campaigns", "campaigns", campaigns.length)}
          {tabBtn("Automations", "automations", automations.length)}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {loading ? <p className="text-sm text-white/30 py-10 text-center">Loading...</p> : (
          <>
            {/* ── EVENTS TAB ── */}
            {tab === "events" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">Events</h2>
                  {!showEventForm && (
                    <button onClick={() => setShowEventForm(true)} className="text-[13px] font-medium text-black bg-white rounded-full px-5 py-2.5 hover:opacity-90">+ Add Event</button>
                  )}
                </div>
                {showEventForm && <div className="mb-8"><EventForm onSave={addEvent} onCancel={() => setShowEventForm(false)} saving={savingEvent} /></div>}

                {upcoming.length > 0 && (
                  <div className="mb-10">
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/30 mb-3">UPCOMING ({upcoming.length})</p>
                    {upcoming.map((ev) => <AdminEventRow key={ev.id} event={ev} onDelete={deleteEvent} />)}
                  </div>
                )}
                {past.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/20 mb-3">HISTORY ({past.length})</p>
                    {past.map((ev) => <AdminEventRow key={ev.id} event={ev} onDelete={deleteEvent} isPast />)}
                  </div>
                )}
                {events.length === 0 && !showEventForm && <p className="text-sm text-white/20 py-8">No events yet. Add your first event.</p>}
              </div>
            )}

            {/* ── SUBSCRIBERS TAB ── */}
            {tab === "subscribers" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">Subscribers</h2>
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddSub(!showAddSub)} className="text-[13px] font-medium text-black bg-white rounded-full px-5 py-2.5 hover:opacity-90">
                      + Add
                    </button>
                  </div>
                </div>

                {showAddSub && <AddSubscriberForm token={token} onDone={() => { setShowAddSub(false); fetchAll(); }} />}

                {/* Tag summary */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["events", "merch", "general", "vip", "imported"].map((tag) => {
                    const count = activeSubs.filter((s: any) => s.tags?.includes(tag)).length;
                    if (count === 0) return null;
                    return (
                      <span key={tag} className="text-[11px] text-white/30 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">
                        {tag} · {count}
                      </span>
                    );
                  })}
                </div>

                {activeSubs.length === 0 ? <p className="text-sm text-white/20 py-8">No subscribers yet.</p> : (
                  <div className="flex flex-col">
                    {subscribers.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between py-3.5 border-b border-white/[0.05] group" style={{ opacity: sub.status === "unsubscribed" ? 0.3 : 1 }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] text-white font-medium truncate">
                              {sub.firstName} {sub.lastName}
                            </span>
                            <span className="text-[13px] text-white/40 truncate">
                              {sub.email}
                            </span>
                            {sub.phone && <span className="text-[12px] text-white/20 hidden sm:inline">{sub.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>}
                            {sub.status === "unsubscribed" && <span className="text-[10px] text-red-400/50 bg-red-400/10 rounded px-2 py-0.5">unsub</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {sub.tags?.map((tag: string) => (
                              <span key={tag} className="text-[10px] text-white/20 bg-white/[0.03] rounded px-2 py-0.5">{tag}</span>
                            ))}
                            <span className="text-[10px] text-white/15 ml-1">{sub.source}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-white/15">{new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <button onClick={() => deleteSub(sub.id)} className="text-[11px] text-white/10 hover:text-red-400/70 opacity-0 group-hover:opacity-100 transition-all">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CAMPAIGNS TAB ── */}
            {tab === "campaigns" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">Campaigns</h2>
                  <a href="/admin/campaigns/new" className="text-[13px] font-medium text-black bg-white rounded-full px-5 py-2.5 hover:opacity-90">
                    + New Campaign
                  </a>
                </div>

                {draftCampaigns.length > 0 && (
                  <div className="mb-10">
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/30 mb-3">DRAFTS ({draftCampaigns.length})</p>
                    {draftCampaigns.map((c: any) => <CampaignRow key={c.id} campaign={c} />)}
                  </div>
                )}
                {sentCampaigns.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/30 mb-3">SENT ({sentCampaigns.length})</p>
                    {sentCampaigns.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).map((c: any) => <CampaignRow key={c.id} campaign={c} />)}
                  </div>
                )}
                {campaigns.length === 0 && <p className="text-sm text-white/20 py-8">No campaigns yet. Create your first email campaign.</p>}
              </div>
            )}

            {/* ── AUTOMATIONS TAB ── */}
            {tab === "automations" && (
              <AutomationsPanel token={token} automations={automations} onRefresh={fetchAll} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════
function AdminEventRow({ event, onDelete, isPast = false }: { event: SDEvent; onDelete: (id: string) => void; isPast?: boolean }) {
  const d = new Date(event.date + "T00:00:00");
  const fmt = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.05] group" style={{ opacity: isPast ? 0.4 : 1 }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white/35 shrink-0 min-w-[100px]">{fmt}</span>
          <span className="font-display text-[15px] font-semibold text-white truncate">{event.title}</span>
        </div>
        <div className="text-[13px] text-white/25 mt-0.5 ml-[112px]">{event.venue} · {event.time}</div>
      </div>
      <button onClick={() => onDelete(event.id)} className="text-[12px] text-white/15 hover:text-red-400/70 opacity-0 group-hover:opacity-100 transition-all ml-4">Delete</button>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: any }) {
  const isSent = campaign.status === "sent";
  return (
    <a href={`/admin/campaigns/new?edit=${campaign.id}`} className="flex items-center justify-between py-4 border-b border-white/[0.05] group hover:bg-white/[0.01] transition-colors no-underline cursor-pointer block">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${isSent ? "bg-green-400/10 text-green-400/60" : "bg-white/[0.04] text-white/30"}`}>
            {isSent ? "SENT" : "DRAFT"}
          </span>
          <span className="font-display text-[15px] font-semibold text-white truncate">{campaign.name}</span>
        </div>
        <div className="text-[13px] text-white/25 mt-0.5 ml-[76px]">{campaign.subject}</div>
      </div>
      {isSent && (
        <div className="flex gap-5 text-[12px] text-white/25 ml-4">
          <span>{campaign.stats.sent} sent</span>
          <span>{campaign.stats.opened} opens</span>
          <span>{campaign.stats.clicked} clicks</span>
        </div>
      )}
    </a>
  );
}

function AddSubscriberForm({ token, onDone }: { token: string; onDone: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("general");
  const [saving, setSaving] = useState(false);

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  const save = async () => {
    setSaving(true);
    await fetch("/api/subscribers", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ firstName, lastName, email: email || undefined, phone: phone || undefined, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    setSaving(false);
    onDone();
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-6">
      <h3 className="text-[16px] font-semibold text-white mb-4">Add Subscriber</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inp} />
        <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inp} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} className={inp + " sm:col-span-2"} />
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={save} disabled={saving || !firstName || !lastName || !email} className="bg-white text-black font-medium text-[13px] rounded-xl px-5 py-2.5 hover:opacity-90 disabled:opacity-40">{saving ? "..." : "Add"}</button>
        <button onClick={onDone} className="text-[13px] text-white/40 hover:text-white/70">Cancel</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// AUTOMATIONS PANEL
// ═══════════════════════════════════════
function AutomationsPanel({ token, automations, onRefresh }: { token: string; automations: any[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const toggleEnabled = async (auto: any) => {
    await fetch("/api/automations", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ id: auto.id, enabled: !auto.enabled }),
    });
    onRefresh();
  };

  const saveAuto = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/automations", {
      method: editing.id ? "PUT" : "POST",
      headers: authHeaders(token),
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";
  const triggers: Record<string, string> = { signup_events: "Event signup", signup_merch: "Merch signup", signup_any: "Any signup" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">Automations</h2>
        <button onClick={() => setEditing({ name: "", trigger: "signup_any", enabled: true, subject: "", mode: "html", html: "", blocks: [], delayMinutes: 0 })} className="text-[13px] font-medium text-black bg-white rounded-full px-5 py-2.5 hover:opacity-90">+ New</button>
      </div>

      <p className="text-[13px] text-white/25 mb-6">Automated emails that fire when someone signs up. Design in Figma, paste the HTML.</p>

      {editing && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
          <h3 className="text-[16px] font-semibold text-white mb-5">{editing.id ? "Edit" : "New"} Automation</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[11px] text-white/30 mb-1 block">NAME</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Welcome — Event Signup" className={inp} /></div>
              <div><label className="text-[11px] text-white/30 mb-1 block">TRIGGER</label>
                <select value={editing.trigger} onChange={(e) => setEditing({ ...editing, trigger: e.target.value })} className={inp + " [color-scheme:dark]"}>
                  <option value="signup_events">Event signup</option>
                  <option value="signup_merch">Merch signup</option>
                  <option value="signup_any">Any signup</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[11px] text-white/30 mb-1 block">SUBJECT LINE <span className="text-white/15">(supports {`{{first_name}}`})</span></label><input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="You're in, {{first_name}}." className={inp} /></div>
              <div><label className="text-[11px] text-white/30 mb-1 block">DELAY (minutes, 0 = instant)</label><input type="number" value={editing.delayMinutes} onChange={(e) => setEditing({ ...editing, delayMinutes: parseInt(e.target.value) || 0 })} className={inp} /></div>
            </div>
            <div>
              <label className="text-[11px] text-white/30 mb-1 block">EMAIL HTML <span className="text-white/15">(paste from Figma export)</span></label>
              <textarea value={editing.html} onChange={(e) => setEditing({ ...editing, html: e.target.value })} rows={14} placeholder={`<!DOCTYPE html>...\nUse {{first_name}}, {{unsubscribe_link}} etc.`} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white/70 font-mono placeholder:text-white/10 outline-none focus:border-white/15 resize-none" spellCheck={false} />
            </div>
            <div className="flex gap-3">
              <button onClick={saveAuto} disabled={saving || !editing.name || !editing.subject} className="bg-white text-black font-medium text-[13px] rounded-xl px-5 py-2.5 hover:opacity-90 disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(null)} className="text-[13px] text-white/40 hover:text-white/70">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {automations.length === 0 && !editing ? (
        <p className="text-sm text-white/20 py-8">No automations yet. Create a welcome email.</p>
      ) : (
        <div className="flex flex-col">
          {automations.map((auto: any) => (
            <div key={auto.id} className="flex items-center justify-between py-4 border-b border-white/[0.05] group">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleEnabled(auto)} className={`w-9 h-5 rounded-full transition-all relative ${auto.enabled ? "bg-green-500/60" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${auto.enabled ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  <span className="font-display text-[15px] font-semibold text-white">{auto.name}</span>
                  <span className="text-[11px] text-white/20 bg-white/[0.04] rounded px-2 py-0.5">{triggers[auto.trigger]}</span>
                </div>
                <div className="text-[13px] text-white/25 mt-1 ml-12">
                  Subject: {auto.subject} · {auto.delayMinutes === 0 ? "Instant" : `${auto.delayMinutes}min delay`} · {auto.stats?.sent || 0} sent
                </div>
              </div>
              <button onClick={() => setEditing(auto)} className="text-[12px] text-white/20 hover:text-white/50 opacity-0 group-hover:opacity-100 transition-all">Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = getToken();
    if (saved) setToken(saved);
    setChecking(false);
  }, []);

  if (checking) return <div className="min-h-screen bg-black" />;
  if (!token) return <LoginScreen onLogin={setToken} />;
  return <Dashboard token={token} onLogout={() => { localStorage.removeItem("sd-admin-token"); setToken(null); }} />;
}
