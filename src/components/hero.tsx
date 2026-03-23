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

  // Parallax layers — reduced movement, slower fadeout
  const layer0Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const ctaFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const entrance = (delay: number, duration = 1.2) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          transition: { duration, ease, delay },
        };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-screen flex items-end overflow-hidden"
      style={{ height: "110vh" }}
    >
      {/* Atmosphere — soft gradient from center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,255,255,0.012), transparent)",
        }}
      />

      {/* Logo — top left, small, confident */}
      <motion.div
        className="absolute top-8 left-8 z-10"
        style={reducedMotion ? {} : { y: layer0Y, opacity: fadeOut }}
        {...entrance(0.2, 1.0)}
      >
        <img
          src="/logo-hq.png"
          alt="SUM'N DFRNT"
          width={48}
          height={48}
          className="rounded-full opacity-60"
        />
      </motion.div>

      {/* Main content — bottom-left aligned, editorial */}
      <div className="relative z-10 w-full px-8 sm:px-12 lg:px-20 pb-[12vh]">
        {/* Overline */}
        <motion.p
          className="text-[11px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-6"
          style={reducedMotion ? {} : { y: layer1Y, opacity: fadeOut }}
          {...entrance(0)}
        >
          Atlanta
        </motion.p>

        {/* Headline — massive, left-aligned, weight contrast */}
        <motion.div
          style={reducedMotion ? {} : { y: layer1Y, opacity: fadeOut, translateZ: 0 }}
        >
          <motion.h1
            className="font-display"
            style={{
              fontSize: "clamp(48px, 11vw, 160px)",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              backfaceVisibility: "hidden",
            }}
            {...entrance(0.15)}
          >
            <span className="block font-bold text-white">
              From the
            </span>
            <span className="block font-bold text-white">
              culture.
            </span>
          </motion.h1>

          <motion.p
            className="font-display mt-4"
            style={{
              fontSize: "clamp(28px, 5vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
            {...entrance(0.4)}
          >
            <span className="font-normal text-white/30">
              For what&apos;s next.
            </span>
          </motion.p>
        </motion.div>

        {/* CTA row — bottom */}
        <motion.div
          className="mt-12 flex items-center gap-8"
          style={reducedMotion ? {} : { y: layer2Y, opacity: ctaFade }}
          {...entrance(0.7, 0.9)}
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
      </div>

      {/* Scroll line — right edge */}
      <motion.div
        className="absolute bottom-12 right-8 sm:right-12"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 2.0 }}
        style={reducedMotion ? {} : { opacity: useTransform(scrollYProgress, [0, 0.1], [0.2, 0]) }}
      >
        <motion.div
          className="w-px h-20"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
          }}
          animate={reducedMotion ? {} : {
            scaleY: [1, 1.1, 1],
            opacity: [0.2, 0.06, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
