"use client";

import { useEffect, useState, useRef } from "react";

export function Hero() {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=ring, 2=full, 3=settled
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Cinematic entrance sequence
    const t1 = setTimeout(() => setPhase(1), 200);   // ring glow appears
    const t2 = setTimeout(() => setPhase(2), 900);   // logo scales in with spin
    const t3 = setTimeout(() => setPhase(3), 2000);  // settled, scroll-ready
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-driven transforms — Apple parallax
  const sp = Math.min(scrollY / 600, 1);
  const logoScale = 1 + sp * 1.8;
  const logoOpacity = 1 - sp * 0.75;
  const logoBlur = sp * 4;
  const textOpacity = Math.max(1 - sp * 1.5, 0);
  const textY = sp * -50;

  return (
    <section
      id="top"
      className="min-h-[115vh] flex flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center relative overflow-hidden"
    >
      {/* Ambient glow — pulses on entrance then settles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: phase >= 1
            ? `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,${phase === 1 ? 0.04 : 0.015}), transparent 60%)`
            : "none",
          transition: "all 1.5s ease",
        }}
      />

      {/* Ring glow — appears before logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, calc(-50% - 20px)) scale(${phase >= 1 ? (phase >= 2 ? 0 : 1.2) : 0})`,
          boxShadow: phase === 1
            ? "0 0 80px 20px rgba(255,255,255,0.08), 0 0 160px 60px rgba(255,255,255,0.03), inset 0 0 60px rgba(255,255,255,0.04)"
            : "none",
          border: phase === 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          opacity: phase === 1 ? 1 : 0,
          transition: phase >= 2
            ? "all 0.6s cubic-bezier(0.16,1,0.3,1)"
            : "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />

      {/* Logo — cinematic entrance + scroll zoom */}
      <div
        style={{
          opacity: phase >= 2 ? logoOpacity : 0,
          transform: phase >= 3
            ? `scale(${logoScale})`
            : phase >= 2
              ? "scale(1) rotate(0deg)"
              : "scale(0) rotate(-180deg)",
          filter: phase >= 3 ? `blur(${logoBlur}px)` : "none",
          transition: phase >= 3
            ? "transform 0.05s linear, filter 0.1s linear"
            : "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        <div className="relative">
          <img
            src="/logo-512.png"
            alt="SUM'N DFRNT"
            width={160}
            height={160}
            className="rounded-full mb-12 relative z-10"
            style={{
              filter: `drop-shadow(0 0 ${20 + sp * 50}px rgba(255,255,255,${0.04 + sp * 0.08}))`,
            }}
          />
          {/* Glow ring behind logo — breathes on entrance */}
          <div
            className="absolute inset-0 rounded-full z-0"
            style={{
              margin: "-10px",
              marginBottom: "38px",
              opacity: phase >= 2 ? (phase >= 3 ? 0.3 - sp * 0.3 : 1) : 0,
              boxShadow: "0 0 60px 15px rgba(255,255,255,0.06), 0 0 120px 40px rgba(255,255,255,0.02)",
              animation: phase === 2 ? "logoBreathe 2s ease-in-out" : "none",
              transition: "opacity 1s ease",
            }}
          />
        </div>
      </div>

      {/* Headline */}
      <h1
        className="font-display font-bold text-white max-w-[700px]"
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          lineHeight: 1.06,
          letterSpacing: "-0.03em",
          opacity: phase >= 2 ? textOpacity : 0,
          transform: phase >= 2
            ? `translateY(${textY}px)`
            : "translateY(40px)",
          transition: phase >= 3
            ? "opacity 0.1s linear"
            : "all 1s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        From the culture.
        <br />
        For what&apos;s next.
      </h1>

      {/* CTAs */}
      <div
        className="flex gap-4 mt-11"
        style={{
          opacity: phase >= 2 ? textOpacity : 0,
          transform: phase >= 2
            ? `translateY(${textY}px)`
            : "translateY(25px)",
          transition: phase >= 3
            ? "opacity 0.1s linear"
            : "all 1s cubic-bezier(0.16,1,0.3,1) 0.4s",
        }}
      >
        <a
          href="#events"
          className="text-[15px] font-medium text-black bg-white rounded-full px-8 py-3.5 hover:opacity-85 transition-opacity"
        >
          Upcoming Events
        </a>
        <a
          href="#about"
          className="text-[15px] font-medium text-white/80 bg-white/8 border border-white/12 rounded-full px-8 py-3.5 hover:bg-white/12 hover:text-white transition-all"
        >
          Learn More
        </a>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          opacity: phase >= 3 ? Math.max((1 - sp * 3) * 0.4, 0) : 0,
          transition: "opacity 1s ease 0.5s",
        }}
      >
        <div
          className="w-px h-12"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
            animation: phase >= 3 ? "scrollPulse 2s ease-in-out infinite" : "none",
          }}
        />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50% { transform: scaleY(1.3); opacity: 0.15; }
        }
        @keyframes logoBreathe {
          0% { transform: scale(0.8); opacity: 0; }
          30% { transform: scale(1.15); opacity: 1; }
          60% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
