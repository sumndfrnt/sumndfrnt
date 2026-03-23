"use client";

import { Reveal } from "./reveal";

const COPY = [
  "We exist at the intersection of culture, unconventional thinking, and execution.",
  "We don\u2019t aim to look different for aesthetics \u2014 we challenge default thinking and deliver real outcomes.",
  "Atlanta-based. Creatively driven. Strategically sharp. This isn\u2019t a moment \u2014 it\u2019s a movement.",
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-[180px] sm:py-[240px] px-8 sm:px-12 lg:px-20">
      {/* Divider */}
      <div className="absolute top-0 left-8 sm:left-12 lg:left-20 right-8 sm:right-12 lg:right-20 h-px bg-white/[0.04]" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Left column — label + heading */}
        <div className="lg:col-span-4">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-6">
              About
            </p>
            <h2
              className="font-display font-bold text-white leading-[1.05]"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "-0.04em",
              }}
            >
              What&apos;s all the SUM&apos;N about?
            </h2>
          </Reveal>
        </div>

        {/* Right column — body copy, offset */}
        <div className="lg:col-span-7 lg:col-start-6 lg:pt-4">
          <div className="flex flex-col gap-8">
            {COPY.map((text, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <p
                  className={
                    i === 0
                      ? "text-[22px] sm:text-[28px] font-normal text-white/70 leading-[1.4]"
                      : "text-[17px] text-white/30 leading-[1.7]"
                  }
                >
                  {text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
