"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const ease = [0.25, 0.1, 0, 1] as const;

export function Statement() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6], [60, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative py-[180px] sm:py-[240px] px-8 sm:px-12 lg:px-20"
    >
      {/* Subtle divider line */}
      <div className="absolute top-0 left-8 sm:left-12 lg:left-20 right-8 sm:right-12 lg:right-20 h-px bg-white/[0.04]" />

      <motion.div
        className="max-w-[1000px]"
        style={reducedMotion ? {} : { opacity, y, translateZ: 0, backfaceVisibility: "hidden" as const }}
      >
        <p
          className="font-display font-semibold text-white leading-[1.08]"
          style={{
            fontSize: "clamp(32px, 6vw, 72px)",
            letterSpacing: "-0.04em",
          }}
        >
          We don&apos;t follow blueprints.{" "}
          <span className="text-white/25">
            We build the rooms that don&apos;t exist yet.
          </span>
        </p>
      </motion.div>
    </section>
  );
}
