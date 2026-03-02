import { getUpcomingEvents } from "@/lib/events-adapter";
import { SectionTitle } from "@/components/section-title";
import { EventRow } from "@/components/event-row";
import { Reveal } from "@/components/reveal";

export const metadata = {
  title: "Events — SUM'N DFRNT",
  description: "Upcoming events from SUM'N DFRNT.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 max-w-[900px] mx-auto">
      <SectionTitle label="UPCOMING" title="Events." sub="Experience SUM'N DFRNT." />
      <div className="flex flex-col">
        {events.length > 0 ? (
          events.map((event, i) => (
            <Reveal key={event.id} delay={i * 0.06}>
              <EventRow event={event} />
            </Reveal>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-[15px] text-white/35">No upcoming events right now.</p>
          </div>
        )}
      </div>
    </section>
  );
}
