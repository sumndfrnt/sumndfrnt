"use client";

import { useState } from "react";
import { Reveal } from "./reveal";

export function MerchSection() {
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

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone: phone || undefined, tag: "merch" }),
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

  return (
    <section id="merch" className="py-[120px] px-6">
      <div className="max-w-[440px] mx-auto text-center">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.12em] text-white/30 mb-4">MERCH</p>
          <h2 className="font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.06] tracking-tight text-white">
            Coming soon.
          </h2>
          <p className="text-[17px] font-normal leading-relaxed text-white/35 mt-5 max-w-[400px] mx-auto">
            Official SUM&apos;N DFRNT merch is on the way. Be the first to know when it drops.
          </p>

          {status === "success" ? (
            <div className="mt-8">
              <p className="text-[17px] text-white/70 font-medium">You&apos;re on the list, {firstName}.</p>
              <p className="text-[13px] text-white/25 mt-2">We&apos;ll email you when merch drops.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-8">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (status === "error") setStatus("idle"); }} className={inp} />
                <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inp} />
              </div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
              <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />

              <button onClick={handleSubmit} disabled={status === "loading"} className="w-full bg-white text-black font-medium text-[15px] rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
                {status === "loading" ? "..." : "Notify Me"}
              </button>

              {status === "error" && <p className="text-[13px] text-red-400/70">{message}</p>}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
