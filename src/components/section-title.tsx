import { Reveal } from "./reveal";

interface SectionTitleProps {
  label?: string;
  title: string;
  sub?: string;
}

export function SectionTitle({ label, title, sub }: SectionTitleProps) {
  return (
    <Reveal>
      <div className="mb-14 max-w-[680px]">
        {label && (
          <p className="text-xs font-semibold tracking-[0.12em] text-white/30 mb-4">
            {label}
          </p>
        )}
        <h2 className="font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.06] tracking-tight text-white">
          {title}
        </h2>
        {sub && (
          <p className="text-[17px] font-normal leading-relaxed text-white/45 mt-4 max-w-[480px]">
            {sub}
          </p>
        )}
      </div>
    </Reveal>
  );
}
