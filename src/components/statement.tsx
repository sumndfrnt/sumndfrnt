"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.25, 0.1, 0, 1] as const;

export function Statement() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-[200px] px-[6vw]">
      <motion.div
        className="max-w-[1100px] mx-auto"
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease }}
      >
        <p
          className="font-display font-semibold text-white leading-[1.12]"
          style={{
            fontSize: "clamp(28px, 5vw, 56px)",
            letterSpacing: "-0.03em",
          }}
        >
          We build the rooms that don&apos;t exist yet.
        </p>
      </motion.div>
    </section>
  );
}
