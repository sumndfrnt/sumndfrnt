import { SectionTitle } from "./section-title";
import { Reveal } from "./reveal";

const COPY = [
  "We\u2019re not a brand that followed a blueprint. SUM\u2019N DFRNT was built because the rooms we wanted didn\u2019t exist yet.",
  "We exist at the intersection of culture, unconventional thinking, and execution. We don\u2019t aim to look different for aesthetics \u2014 we challenge default thinking and deliver real outcomes.",
  "Atlanta-based. Creatively driven. Strategically sharp. This isn\u2019t a moment \u2014 it\u2019s a movement.",
];

export function AboutSection() {
  return (
    <section id="about" className="py-[200px] px-6">
      <div className="max-w-[800px] mx-auto">
        <SectionTitle
          label="ABOUT"
          title="What's all the SUM'N about?"
        />

        <div className="flex flex-col gap-6">
          {COPY.map((text, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p
                className={`leading-relaxed ${
                  i === 0
                    ? "text-[28px] font-medium text-white/85 leading-[1.3]"
                    : "text-[17px] text-white/40"
                }`}
              >
                {text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
