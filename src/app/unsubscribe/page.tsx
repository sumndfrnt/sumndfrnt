"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [status, setStatus] = useState<"confirm" | "loading" | "done" | "error">("confirm");

  const handleUnsubscribe = async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <p className="text-white/40 text-sm">Invalid unsubscribe link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-[400px]">
        <img src="/logo-512.png" alt="SUM'N DFRNT" className="w-14 h-14 rounded-full mx-auto mb-8" />

        {status === "confirm" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-3">
              Unsubscribe?
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed mb-8">
              You&apos;ll stop receiving emails from SUM&apos;N DFRNT. You can always re-subscribe later.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleUnsubscribe}
                className="text-[14px] font-medium text-white border border-white/15 rounded-xl px-6 py-3 hover:bg-white/5 transition-all"
              >
                Yes, unsubscribe
              </button>
              <a
                href="/"
                className="text-[14px] font-medium text-black bg-white rounded-xl px-6 py-3 hover:opacity-90 transition-opacity"
              >
                Never mind
              </a>
            </div>
          </>
        )}

        {status === "loading" && (
          <p className="text-white/40">Processing...</p>
        )}

        {status === "done" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-3">
              You&apos;re unsubscribed.
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed mb-6">
              We&apos;ll miss you. If you change your mind, you know where to find us.
            </p>
            <a
              href="/"
              className="text-[14px] font-medium text-white/40 hover:text-white transition-colors"
            >
              Back to site →
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-3">
              Something went wrong.
            </h1>
            <p className="text-[15px] text-white/40 mb-6">
              Try again or email hi@sumndfrnt.com to unsubscribe.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UnsubscribeInner />
    </Suspense>
  );
}
