"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// One easing curve, everywhere. Slow start, confident finish.
const ease = [0.25, 0.1, 0, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 1.0,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
