"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

// One curve. Slow out, confident finish.
const ease = [0.25, 0.1, 0, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // --- Scroll parallax: three layers at different speeds ---

  // Layer 0 (logo) — furthest back, moves slowest
  const logoScrollY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const logoScrollOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Layer 1 (headline) — middle depth
  const headScrollY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const headScrollOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Layer 2 (CTA) — closest, moves fastest, disappears first
  const ctaScrollY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const ctaScrollOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  // Scroll indicator
  const scrollLineOpacity = useTransform(scrollYProgress, [0, 0.08], [0.25, 0]);

  // --- Reduced motion: show everything immediately ---
  if (reducedMotion) {
    return (
      <section
        ref={sectionRef}
        id="top"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.008), transparent)" }} />
        <img src="/logo-hq.png" alt="SUM'N DFRNT" width={200} height={200} className="rounded-full mb-12" />
        <h1 className="font-display max-w-[900px]" style={{ fontSize: "clamp(56px, 12vw, 140px)", lineHeight: 1.0, letterSpacing: "-0.05em" }}>
          <span className="block font-bold text-white">From the culture.</span>
          <span className="block font-normal text-white/40 mt-1">For what&apos;s next.</span>
        </h1>
        <div className="mt-14">
          <a href="#events" className="text-[15px] font-medium text-black bg-white rounded-full px-10 py-4 hover:opacity-85 transition-opacity duration-500">See What&apos;s Next</a>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
    >
      {/* Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.008), transparent)",
        }}
      />

      {/* LAYER 0: Logo — emerges from behind, blur clears slowly */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, scale: 1.15, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.0, ease, delay: 0.8 }}
        style={{ y: logoScrollY, opacity: logoScrollOpacity }}
      >
        <img
          src="/logo-hq.png"
          alt="SUM'N DFRNT"
          width={200}
          height={200}
          className="rounded-full"
        />
      </motion.div>

      {/* LAYER 1: Headline — two lines at different depths */}
      <motion.div
        style={{ y: headScrollY, opacity: headScrollOpacity }}
      >
        <h1
          className="font-display max-w-[900px]"
          style={{
            fontSize: "clamp(56px, 12vw, 140px)",
            lineHeight: 1.0,
            letterSpacing: "-0.05em",
          }}
        >
          {/* Line 1 — close, emerges first, larger blur */}
          <motion.span
            className="block font-bold text-white"
            initial={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease, delay: 0.1 }}
          >
            From the culture.
          </motion.span>

          {/* Line 2 — further back, arrives later, less scale */}
          <motion.span
            className="block font-normal text-white/40 mt-1"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(4px)" }}
            animate={{ opacity: 0.4, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease, delay: 0.5 }}
          >
            For what&apos;s next.
          </motion.span>
        </h1>
      </motion.div>

      {/* LAYER 2: CTA — closest layer, arrives last, rises from below */}
      <motion.div
        className="mt-14"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 1.8 }}
        style={{ y: ctaScrollY, opacity: ctaScrollOpacity }}
      >
        <a
          href="#events"
          className="text-[15px] font-medium text-black bg-white rounded-full px-10 py-4 hover:opacity-85 transition-opacity duration-500"
        >
          See What&apos;s Next
        </a>
      </motion.div>

      {/* Scroll indicator — appears last */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.5, delay: 2.5 }}
        style={{ opacity: scrollLineOpacity }}
      >
        <motion.div
          className="w-px h-16"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)",
          }}
          animate={{
            scaleY: [1, 1.15, 1],
            opacity: [0.25, 0.08, 0.25],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
