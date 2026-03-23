"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SettingsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const connectedEmail = params.get("connected");
  const error = params.get("error");

  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("sd-admin-token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/google/status", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, connectedEmail]);

  const connectGoogle = () => {
    if (!token) return;
    window.location.href = `/api/google?token=${token}`;
  };

  const disconnectGoogle = async () => {
    if (!confirm("Disconnect Google Workspace? You won't be able to send emails until you reconnect.")) return;
    await fetch("/api/google/status", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatus({ ...status, connected: false, email: null });
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;
    setTestStatus("sending");
    try {
      const res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ test: true, testEmail }),
      });
      if (res.ok) {
        setTestStatus("sent");
        setTestMsg("Test email sent!");
      } else {
        const data = await res.json();
        setTestStatus("error");
        setTestMsg(data.error || "Failed to send");
      }
    } catch {
      setTestStatus("error");
      setTestMsg("Connection failed");
    }
  };

  if (!token) return null;

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-[700px] mx-auto flex items-center justify-between">
          <a href="/admin" className="text-[13px] text-white/30 hover:text-white/60">← Back to Dashboard</a>
          <span className="text-[13px] text-white/50">Settings</span>
          <div />
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
        <p className="text-[15px] text-white/35 mb-10">Connect services and configure your email platform.</p>

        {/* Success/Error banners */}
        {connectedEmail && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-5 py-4 mb-8">
            <p className="text-[14px] text-green-400/80 font-medium">Google Workspace connected!</p>
            <p className="text-[13px] text-green-400/50 mt-1">Sending emails as {connectedEmail}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 mb-8">
            <p className="text-[14px] text-red-400/80 font-medium">Connection failed</p>
            <p className="text-[13px] text-red-400/50 mt-1">{error}</p>
          </div>
        )}

        {/* Google Workspace Connection */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white tracking-tight">Google Workspace</h2>
              <p className="text-[14px] text-white/35 mt-1">Connect to send emails via Gmail API</p>
            </div>
            {status?.connected && (
              <span className="text-[11px] font-medium text-green-400/70 bg-green-400/10 rounded-full px-3 py-1">Connected</span>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-white/20">Checking connection...</p>
          ) : status?.connected ? (
            <div>
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-4 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[16px]">✉</div>
                <div className="flex-1">
                  <p className="text-[14px] text-white/70 font-medium">{status.email}</p>
                  <p className="text-[12px] text-white/25">Emails will be sent from this address</p>
                </div>
                <button onClick={disconnectGoogle} className="text-[12px] text-red-400/50 hover:text-red-400/80 transition-colors">
                  Disconnect
                </button>
              </div>

              {/* Test email */}
              <div className="mt-6">
                <p className="text-[12px] text-white/30 mb-2">SEND TEST EMAIL</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className={inp}
                  />
                  <button
                    onClick={sendTestEmail}
                    disabled={testStatus === "sending" || !testEmail}
                    className="text-[13px] font-medium text-black bg-white rounded-xl px-5 py-3 hover:opacity-90 disabled:opacity-40 shrink-0"
                  >
                    {testStatus === "sending" ? "Sending..." : "Send Test"}
                  </button>
                </div>
                {testStatus === "sent" && <p className="text-[12px] text-green-400/60 mt-2">{testMsg}</p>}
                {testStatus === "error" && <p className="text-[12px] text-red-400/60 mt-2">{testMsg}</p>}
              </div>
            </div>
          ) : (
            <div>
              {!status?.configured ? (
                <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl px-5 py-4 mb-4">
                  <p className="text-[13px] text-yellow-400/70 font-medium mb-2">Setup Required</p>
                  <p className="text-[12px] text-white/30 leading-relaxed">
                    Add these environment variables in Vercel:<br />
                    <code className="text-white/40">GOOGLE_CLIENT_ID</code><br />
                    <code className="text-white/40">GOOGLE_CLIENT_SECRET</code><br />
                    <code className="text-white/40">GOOGLE_REDIRECT_URI</code> = <code className="text-white/40">https://sumndfrnt.com/api/google/callback</code>
                  </p>
                </div>
              ) : null}

              <button
                onClick={connectGoogle}
                disabled={!status?.configured}
                className="flex items-center gap-3 bg-white text-black font-medium text-[14px] rounded-xl px-6 py-3.5 hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Connect Google Workspace
              </button>
              <p className="text-[11px] text-white/15 mt-3">
                Opens Google consent screen. You&apos;ll grant send-only email access.
              </p>
            </div>
          )}
        </div>

        {/* Setup guide */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-white tracking-tight mb-4">Setup Guide</h2>
          <div className="text-[14px] text-white/35 leading-relaxed flex flex-col gap-4">
            <div>
              <p className="text-white/50 font-medium mb-1">1. Google Cloud Console</p>
              <p>Go to console.cloud.google.com → Create project → Enable Gmail API → Create OAuth 2.0 credentials (Web Application)</p>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-1">2. Set Redirect URI</p>
              <p>In the OAuth credential settings, add authorized redirect URI:<br />
              <code className="text-white/40 bg-white/[0.04] px-2 py-0.5 rounded text-[13px]">https://sumndfrnt.com/api/google/callback</code></p>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-1">3. Add Env Vars to Vercel</p>
              <p>Copy Client ID and Client Secret from Google, add to Vercel → Settings → Environment Variables along with the redirect URI.</p>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-1">4. Connect</p>
              <p>Come back here and click Connect Google Workspace. Sign in with your Google Workspace admin email and grant permission.</p>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-1">5. Done</p>
              <p>All emails (campaigns + automations) will send through Gmail API. No passwords stored, token auto-refreshes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SettingsInner />
    </Suspense>
  );
}
