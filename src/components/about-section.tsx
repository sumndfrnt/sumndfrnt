import { SectionTitle } from "./section-title";
import { Reveal } from "./reveal";

const COPY = [
  "We\u2019re not a brand that followed a blueprint. SUM\u2019N DFRNT was built because the rooms we wanted didn\u2019t exist yet.",
  "We exist at the intersection of culture, unconventional thinking, and execution. We don\u2019t aim to look different for aesthetics \u2014 we challenge default thinking and deliver real outcomes.",
  "Atlanta-based. Creatively driven. Strategically sharp. This isn\u2019t a moment \u2014 it\u2019s a movement.",
];

const VALUES = [
  { title: "Culture-Led", desc: "Everything starts from the culture. Not trends. Not algorithms." },
  { title: "Strategic", desc: "Every move is intentional. Creativity with discipline." },
  { title: "Different", desc: "If it looks like everything else, it\u2019s not us." },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-[140px] px-6"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.015) 50%, transparent 100%)",
      }}
    >
      <div className="max-w-[680px] mx-auto">
        <SectionTitle
          label="ABOUT"
          title="What's all the SUM'N about?"
        />

        <div className="flex flex-col gap-5">
          {COPY.map((text, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p
                className={`leading-relaxed ${
                  i === 0
                    ? "text-xl font-medium text-white/85"
                    : "text-[17px] text-white/40"
                }`}
              >
                {text}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Values */}
        <Reveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-16">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-7 border border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <h4 className="font-display text-[17px] font-bold text-white mb-2 tracking-tight">
                  {v.title}
                </h4>
                <p className="text-sm text-white/35 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
