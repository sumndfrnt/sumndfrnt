"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;
const springConfig = { stiffness: 80, damping: 30, mass: 0.5 };

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Smooth spring-wrapped scroll values
  const smoothProgress = useSpring(scrollYProgress, springConfig);
  const p = reducedMotion ? scrollYProgress : smoothProgress;

  // Logo transforms
  const logoScale = useTransform(p, [0, 0.6], [1, 2.2]);
  const logoOpacity = useTransform(p, [0, 0.5], [1, 0]);
  const logoBlur = useTransform(p, [0, 0.6], [0, 8]);

  // Glow transforms
  const glowOpacity = useTransform(p, [0, 0.3, 0.6], [0.5, 0.8, 0]);
  const glowScale = useTransform(p, [0, 0.6], [1, 1.4]);

  // Headline transforms
  const headOpacity = useTransform(p, [0, 0.35], [1, 0]);
  const headY = useTransform(p, [0, 0.5], [0, -60]);

  // CTA transforms — fade slightly faster
  const ctaOpacity = useTransform(p, [0, 0.3], [1, 0]);
  const ctaY = useTransform(p, [0, 0.4], [0, -80]);

  // Scroll indicator
  const scrollIndicatorOpacity = useTransform(p, [0, 0.15], [0.4, 0]);

  // Ambient background
  const ambientOpacity = useTransform(p, [0, 0.5], [0.015, 0.035]);

  // Entrance animation variants
  const entrance = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.15 } },
  };

  const logoEntrance = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1, ease },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease },
    },
  };

  const ctaEntrance = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease, delay: 0.1 },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      id="top"
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{ paddingBottom: "15vh" }}
      variants={entrance}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            ambientOpacity,
            (v) => `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,${v}), transparent 60%)`
          ),
        }}
      />

      {/* Logo */}
      <motion.div
        variants={logoEntrance}
        style={{
          scale: logoScale,
          opacity: logoOpacity,
          filter: useTransform(logoBlur, (v) => `blur(${v}px)`),
        }}
      >
        <div className="relative">
          <img
            src="/logo-hq.png"
            alt="SUM'N DFRNT"
            width={280}
            height={280}
            className="rounded-full mb-12 relative z-10"
          />
          {/* Soft halo glow */}
          <motion.div
            className="absolute z-0 pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              width: 520,
              height: 520,
              x: "-50%",
              y: "calc(-50% - 24px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.01) 55%, transparent 70%)",
              opacity: glowOpacity,
              scale: glowScale,
            }}
          />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        className="font-display font-bold text-white max-w-[700px]"
        style={{
          fontSize: "clamp(44px, 8vw, 88px)",
          lineHeight: 1.06,
          letterSpacing: "-0.04em",
          opacity: headOpacity,
          y: headY,
        }}
      >
        From the culture.
        <br />
        For what&apos;s next.
      </motion.h1>

      {/* CTAs */}
      <motion.div
        variants={ctaEntrance}
        className="flex gap-4 mt-11"
        style={{
          opacity: ctaOpacity,
          y: ctaY,
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
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.8, duration: 1 }}
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <motion.div
          className="w-px h-12"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }}
          animate={{ scaleY: [1, 1.3, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.section>
  );
}
