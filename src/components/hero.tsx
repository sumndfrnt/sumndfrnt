"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const ease = [0.25, 0.1, 0, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Three depth layers — each wraps content, not text directly
  // Layer 0 (overline): furthest back, moves slowest
  const layer0Y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const layer0Opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Layer 1 (headline): mid-depth
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const layer1Opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Layer 2 (subtitle + CTA): closest, moves fastest, fades first
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const layer2Opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex items-end overflow-hidden"
      style={{ height: "110vh", minHeight: "100vh" }}
    >
      {/* Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,255,255,0.012), transparent)",
        }}
      />

      <div className="relative z-10 w-full px-8 sm:px-12 lg:px-20 pb-[12vh]">

        {/* LAYER 0: Overline — furthest back */}
        <motion.div
          style={reducedMotion ? {} : { y: layer0Y, opacity: layer0Opacity }}
        >
          <motion.p
            className="text-[11px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-6"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease, delay: 0 }}
          >
            Atlanta
          </motion.p>
        </motion.div>

        {/* LAYER 1: Headline — mid-depth */}
        <motion.div
          style={reducedMotion ? {} : { y: layer1Y, opacity: layer1Opacity }}
        >
          <motion.h1
            className="font-display"
            style={{
              fontSize: "clamp(48px, 11vw, 160px)",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease, delay: 0.15 }}
          >
            <span className="block font-bold text-white">From the</span>
            <span className="block font-bold text-white">culture.</span>
          </motion.h1>
        </motion.div>

        {/* LAYER 2: Subtitle + CTA — closest to viewer */}
        <motion.div
          style={reducedMotion ? {} : { y: layer2Y, opacity: layer2Opacity }}
        >
          <motion.p
            className="font-display mt-4"
            style={{
              fontSize: "clamp(28px, 5vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 0.35, y: 0 }}
            transition={{ duration: 1.2, ease, delay: 0.4 }}
          >
            <span className="font-normal text-white">For what&apos;s next.</span>
          </motion.p>

          <motion.div
            className="mt-12 flex items-center gap-8"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
          >
            <a
              href="#events"
              className="text-[14px] font-medium text-black bg-white rounded-full px-8 py-3.5 hover:opacity-80 transition-opacity duration-500"
            >
              See What&apos;s Next
            </a>
            <a
              href="#about"
              className="text-[13px] text-white/30 hover:text-white/60 transition-colors duration-500"
            >
              Learn more &darr;
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll line */}
      <motion.div
        className="absolute bottom-12 right-8 sm:right-12"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 2.0 }}
      >
        <motion.div
          className="w-px h-20"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
          }}
          animate={reducedMotion ? {} : {
            scaleY: [1, 1.1, 1],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
