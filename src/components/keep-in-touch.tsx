"use client";

import { useState } from "react";

export function KeepInTouch() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
        body: JSON.stringify({ firstName, lastName, email, phone: phone || undefined, tag: "events" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
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
      <div className="py-20 text-center">
        <p className="text-[17px] text-white/70 font-medium">You&apos;re in, {firstName}.</p>
        <p className="text-[14px] text-white/30 mt-2">We&apos;ll hit you up first when something&apos;s coming.</p>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="text-center max-w-[440px] mx-auto">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Know first.
        </h3>
        <p className="text-[15px] text-white/35 mt-3 leading-relaxed">
          Sign up and we&apos;ll let you know before events go live.
        </p>

        <div className="flex flex-col gap-3 mt-8">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (status === "error") setStatus("idle"); }} className={inp} />
            <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inp} />
          </div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
          <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full bg-white text-black font-medium text-[15px] rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
          >
            {status === "loading" ? "..." : "Sign Up"}
          </button>

          {status === "error" && <p className="text-[13px] text-red-400/70">{message}</p>}
        </div>

        <p className="text-[11px] text-white/15 mt-4">No spam. Events only.</p>
      </div>
    </div>
  );
}
