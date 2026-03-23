import { getUpcomingEvents, getPastEvents } from "@/lib/events-adapter";
import { EventRow } from "./event-row";
import { KeepInTouch } from "./keep-in-touch";
import { Reveal } from "./reveal";

export async function EventsSection() {
  const upcoming = await getUpcomingEvents();
  const past = await getPastEvents();

  return (
    <section id="events" className="relative py-[140px] sm:py-[180px] px-8 sm:px-12 lg:px-20">
      {/* Divider */}
      <div className="absolute top-0 left-8 sm:left-12 lg:left-20 right-8 sm:right-12 lg:right-20 h-px bg-white/[0.04]" />

      <div className="max-w-[720px]">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-6">
            Events
          </p>
          <h2
            className="font-display font-bold text-white leading-[1.05] mb-12"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              letterSpacing: "-0.04em",
            }}
          >
            Upcoming.
          </h2>
        </Reveal>

        {upcoming.length > 0 ? (
          <div className="flex flex-col">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.08}>
                <EventRow event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <KeepInTouch />
          </Reveal>
        )}

        {past.length > 0 && (
          <div className="mt-20">
            <div className="h-px bg-white/[0.04] mb-8" />
            <div className="flex flex-col">
              {past.map((event, i) => (
                <Reveal key={event.id} delay={i * 0.06}>
                  <EventRow event={event} isPast />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
