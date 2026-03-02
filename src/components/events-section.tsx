import { getUpcomingEvents, getPastEvents } from "@/lib/events-adapter";
import { SectionTitle } from "./section-title";
import { EventRow } from "./event-row";
import { KeepInTouch } from "./keep-in-touch";
import { Reveal } from "./reveal";

export async function EventsSection() {
  const upcoming = await getUpcomingEvents();
  const past = await getPastEvents();

  return (
    <section id="events" className="py-[120px] px-6 max-w-[900px] mx-auto">
      <SectionTitle label="UPCOMING" title="Events." sub="Experience SUM'N DFRNT." />

      {/* Upcoming */}
      <div className="flex flex-col">
        {upcoming.length > 0 ? (
          upcoming.map((event, i) => (
            <Reveal key={event.id} delay={i * 0.08}>
              <EventRow event={event} />
            </Reveal>
          ))
        ) : (
          <Reveal>
            <KeepInTouch />
          </Reveal>
        )}
      </div>

      {/* Past events */}
      {past.length > 0 && (
        <div className="mt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.12em] text-white/20 mb-6">
              HISTORY
            </p>
          </Reveal>
          <div className="flex flex-col">
            {past.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.06}>
                <EventRow event={event} isPast />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
