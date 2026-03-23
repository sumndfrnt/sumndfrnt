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

  // Scroll transforms — restrained, uniform
  const logoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const headY = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 0.4], [0, -40]);
  const scrollLineOpacity = useTransform(scrollYProgress, [0, 0.1], [0.3, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
    >
      {/* Atmosphere — barely-visible radial warmth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.008), transparent)",
        }}
      />

      {/* Logo — still, confident, already present */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease }}
        style={reducedMotion ? {} : { opacity: logoOpacity }}
      >
        <img
          src="/logo-hq.png"
          alt="SUM'N DFRNT"
          width={200}
          height={200}
          className="rounded-full mb-16"
        />
      </motion.div>

      {/* Headline — massive, weight contrast between lines */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease, delay: 0.3 }}
        style={reducedMotion ? {} : { opacity: headOpacity, y: headY }}
      >
        <h1
          className="font-display max-w-[900px]"
          style={{
            fontSize: "clamp(56px, 12vw, 140px)",
            lineHeight: 1.0,
            letterSpacing: "-0.05em",
          }}
        >
          <span className="block font-bold text-white">
            From the culture.
          </span>
          <span className="block font-normal text-white/40 mt-1">
            For what&apos;s next.
          </span>
        </h1>
      </motion.div>

      {/* Single CTA */}
      <motion.div
        className="mt-14"
        initial={reducedMotion ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease, delay: 0.7 }}
        style={reducedMotion ? {} : { opacity: ctaOpacity, y: ctaY }}
      >
        <a
          href="#events"
          className="text-[15px] font-medium text-black bg-white rounded-full px-10 py-4 hover:opacity-85 transition-opacity duration-500"
        >
          See What&apos;s Next
        </a>
      </motion.div>

      {/* Scroll line — single thin pulse */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        style={reducedMotion ? {} : { opacity: scrollLineOpacity }}
      >
        <motion.div
          className="w-px h-16"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
          }}
          animate={reducedMotion ? {} : {
            scaleY: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
