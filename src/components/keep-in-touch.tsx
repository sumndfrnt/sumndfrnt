"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window { turnstile?: { render: (el: string | HTMLElement, opts: any) => string; reset: (id: string) => void } }
}

export function KeepInTouch() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const renderTime = useRef(0);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string>("");

  useEffect(() => { renderTime.current = Date.now(); }, []);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Render Turnstile widget once the script loads
  const initTurnstile = useCallback(() => {
    if (!siteKey || !turnstileRef.current || turnstileId.current) return;
    if (!window.turnstile) return;
    turnstileId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token: string) => setCfToken(token),
      "expired-callback": () => setCfToken(""),
    });
  }, [siteKey]);

  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email) {
      setStatus("error");
      setMessage("First name, last name, and email are required.");
      return;
    }
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone: phone || undefined, tag: "events", _hp: hp, _t: renderTime.current, _cf: cfToken }),
      });
      if (res.ok) setStatus("success");
      else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-4">
        <p className="text-[17px] text-white/70 font-medium">You&apos;re in, {firstName}.</p>
        <p className="text-[14px] text-white/30 mt-2">We&apos;ll let you know when something&apos;s coming.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-[17px] font-normal leading-relaxed text-white/35 max-w-[400px] mx-auto mb-10">
        Nothing scheduled yet. Sign up and be the first to know when events go live.
      </p>

      <div className="max-w-[440px] mx-auto">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (status === "error") setStatus("idle"); }} className={inp} />
            <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inp} />
          </div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
          <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />
          {siteKey && (
            <>
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
                onReady={initTurnstile}
              />
              <div ref={turnstileRef} className="flex justify-center" />
            </>
          )}
          {/* Honeypot — hidden from real users, bots fill it */}
          <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute opacity-0 pointer-events-none" style={{ position: "absolute", left: "-9999px" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full bg-white text-black font-medium text-[15px] rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
          >
            {status === "loading" ? "..." : "Notify Me"}
          </button>

          {status === "error" && <p className="text-[13px] text-red-400/70">{message}</p>}
        </div>
      </div>
    </div>
  );
}
