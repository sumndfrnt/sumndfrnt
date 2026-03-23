"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const STATEMENT = "We build the rooms that don't exist yet.";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Each word lights up based on scroll position
  // Spread the reveal across 0.05 → 0.85 of scroll progress
  const start = 0.05 + (index / total) * 0.7;
  const end = start + 0.08;
  const opacity = useTransform(progress, [start, end], [0.08, 1]);

  return (
    <motion.span
      className="inline-block mr-[0.3em]"
      style={{ opacity }}
    >
      {word}
    </motion.span>
  );
}

export function Statement() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const words = STATEMENT.split(" ");

  // Fade out the entire statement as user scrolls past
  const containerOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.1]);

  if (reducedMotion) {
    return (
      <section className="relative py-[160px] px-[6vw]">
        <div className="max-w-[1100px] mx-auto">
          <p
            className="font-display font-semibold text-white leading-[1.15]"
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              letterSpacing: "-0.03em",
            }}
          >
            {STATEMENT}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 h-screen flex items-center px-[6vw]">
        <motion.div
          className="max-w-[1100px] mx-auto"
          style={{ opacity: containerOpacity }}
        >
          <p
            className="font-display font-semibold text-white leading-[1.15]"
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              letterSpacing: "-0.03em",
            }}
          >
            {words.map((word, i) => (
              <Word
                key={i}
                word={word}
                index={i}
                total={words.length}
                progress={scrollYProgress}
              />
            ))}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
