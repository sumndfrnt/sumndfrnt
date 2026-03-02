"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function Hero() {
  const [phase, setPhase] = useState(0);

  // Refs for direct DOM manipulation — zero React re-renders during scroll
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);

  // Smooth scroll tracking with lerp
  const scrollCurrent = useRef(0);
  const scrollTarget = useRef(0);
  const rafId = useRef(0);
  const settled = useRef(false);

  // Entrance sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => {
      setPhase(3);
      settled.current = true;
      startScrollLoop();
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Track scroll target
  useEffect(() => {
    const onScroll = () => { scrollTarget.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lerp loop — interpolates toward target for silk-smooth motion
  const startScrollLoop = useCallback(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Smooth interpolation — 0.08 = very smooth, 0.15 = snappier
      scrollCurrent.current = lerp(scrollCurrent.current, scrollTarget.current, 0.1);

      // Snap when close enough
      if (Math.abs(scrollCurrent.current - scrollTarget.current) < 0.5) {
        scrollCurrent.current = scrollTarget.current;
      }

      applyScrollTransforms(scrollCurrent.current);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
  }, []);

  // Direct DOM mutations — no React involvement
  const applyScrollTransforms = (y: number) => {
    const p = Math.min(y / 700, 1); // progress 0→1 over 700px
    const ease = p * p * (3 - 2 * p);  // smoothstep easing

    // Logo — scale up, fade, blur
    if (logoRef.current) {
      const s = 1 + ease * 2;
      const o = 1 - ease * 0.85;
      const b = ease * 6;
      logoRef.current.style.transform = `scale(${s})`;
      logoRef.current.style.opacity = `${Math.max(o, 0)}`;
      logoRef.current.style.filter = `blur(${b}px)`;
    }

    // Glow — intensify then fade
    if (glowRef.current) {
      const glow = p < 0.5
        ? 0.04 + p * 0.12
        : 0.1 - (p - 0.5) * 0.16;
      glowRef.current.style.opacity = `${Math.max(glow / 0.1, 0)}`;
      glowRef.current.style.transform = `scale(${1 + ease * 0.5})`;
    }

    // Headline — slide up, fade
    if (headRef.current) {
      const to = Math.max(1 - p * 2, 0);
      headRef.current.style.opacity = `${to}`;
      headRef.current.style.transform = `translateY(${-ease * 60}px)`;
    }

    // CTAs — slide up, fade (slightly faster)
    if (ctaRef.current) {
      const co = Math.max(1 - p * 2.5, 0);
      ctaRef.current.style.opacity = `${co}`;
      ctaRef.current.style.transform = `translateY(${-ease * 80}px)`;
    }

    // Scroll indicator — fade quickly
    if (scrollRef.current) {
      scrollRef.current.style.opacity = `${Math.max((1 - p * 4) * 0.4, 0)}`;
    }

    // Ambient glow
    if (ambientRef.current) {
      const ao = 0.015 + ease * 0.02;
      ambientRef.current.style.background = `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,${ao}), transparent 60%)`;
    }
  };

  return (
    <section
      id="top"
      className="min-h-[115vh] flex flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        ref={ambientRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: phase >= 1
            ? `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,${phase === 1 ? 0.04 : 0.015}), transparent 60%)`
            : "none",
          transition: "all 1.5s ease",
        }}
      />

      {/* Ring glow — pre-logo entrance */}
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

      {/* Logo — entrance animation handled by phase, scroll by ref */}
      <div
        ref={logoRef}
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)",
          transition: phase < 3 ? "all 1s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          willChange: "transform, opacity, filter",
        }}
      >
        <div className="relative">
          <img
            src="/logo-512.png"
            alt="SUM'N DFRNT"
            width={160}
            height={160}
            className="rounded-full mb-12 relative z-10"
          />
          {/* Breathing glow ring */}
          <div
            ref={glowRef}
            className="absolute inset-0 rounded-full z-0"
            style={{
              margin: "-10px",
              marginBottom: "38px",
              opacity: phase >= 2 ? (phase >= 3 ? 0.3 : 1) : 0,
              boxShadow: "0 0 60px 15px rgba(255,255,255,0.06), 0 0 120px 40px rgba(255,255,255,0.02)",
              animation: phase === 2 ? "logoBreathe 2s ease-in-out" : "none",
              transition: phase < 3 ? "opacity 1s ease" : "none",
              willChange: "transform, opacity",
            }}
          />
        </div>
      </div>

      {/* Headline */}
      <h1
        ref={headRef}
        className="font-display font-bold text-white max-w-[700px]"
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          lineHeight: 1.06,
          letterSpacing: "-0.03em",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(40px)",
          transition: phase < 3 ? "all 1s cubic-bezier(0.16,1,0.3,1) 0.2s" : "none",
          willChange: "transform, opacity",
        }}
      >
        From the culture.
        <br />
        For what&apos;s next.
      </h1>

      {/* CTAs */}
      <div
        ref={ctaRef}
        className="flex gap-4 mt-11"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(25px)",
          transition: phase < 3 ? "all 1s cubic-bezier(0.16,1,0.3,1) 0.4s" : "none",
          willChange: "transform, opacity",
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
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          opacity: phase >= 3 ? 0.4 : 0,
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
