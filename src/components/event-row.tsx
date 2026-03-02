"use client";

import { useState } from "react";
import type { SDEvent } from "@/data/events";

export function EventRow({ event, isPast = false }: { event: SDEvent; isPast?: boolean }) {
  const [hov, setHov] = useState(false);

  const dateObj = new Date(event.date + "T00:00:00");
  const day = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dateNum = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  const Wrapper = isPast ? "div" : "a";
  const wrapperProps = isPast
    ? {}
    : {
        href: event.ticketUrl || "#",
        target: event.ticketUrl?.startsWith("http") ? "_blank" : undefined,
        rel: "noopener noreferrer",
      };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="block py-6 sm:py-7 border-b border-white/[0.06] transition-all duration-300 no-underline"
      style={{ opacity: isPast ? 0.4 : hov ? 1 : 0.75, cursor: isPast ? "default" : "pointer" }}
    >
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-8 flex-1">
          <div className="text-center min-w-[56px]">
            <div className="text-[11px] font-semibold tracking-widest text-white/35">{day}</div>
            <div className="font-display text-[28px] font-bold tracking-tight text-white leading-none">{dateNum}</div>
            <div className="text-[11px] font-medium text-white/35">{month}</div>
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-semibold text-white mb-1">{event.title}</div>
            <div className="text-sm text-white/35">
              {event.venue} · {event.city} · {event.time}
            </div>
            {event.description && (
              <div className="text-[13px] text-white/25 mt-1">{event.description}</div>
            )}
          </div>
        </div>
        {isPast ? (
          <span className="text-[12px] font-medium text-white/20 border border-white/10 rounded-full px-5 py-2 shrink-0">
            History
          </span>
        ) : (
          <div
            className="text-[13px] font-medium text-black bg-white rounded-full px-6 py-2.5 transition-all duration-300 shrink-0"
            style={{
              opacity: hov ? 1 : 0.7,
              transform: hov ? "translateX(0)" : "translateX(4px)",
            }}
          >
            {event.ticketUrl ? "Tickets" : "RSVP"}
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-start gap-4">
          <div className="text-center min-w-[44px]">
            <div className="text-[10px] font-semibold tracking-widest text-white/35">{day}</div>
            <div className="font-display text-[22px] font-bold tracking-tight text-white leading-none">{dateNum}</div>
            <div className="text-[10px] font-medium text-white/35">{month}</div>
          </div>
          <div className="flex-1">
            <div className="font-display text-[15px] font-semibold text-white mb-1">{event.title}</div>
            <div className="text-[13px] text-white/35 leading-relaxed">
              {event.venue} · {event.time}
            </div>
            {event.description && (
              <div className="text-[12px] text-white/25 mt-1">{event.description}</div>
            )}
            <div className="mt-3">
              {isPast ? (
                <span className="text-[11px] font-medium text-white/20 border border-white/10 rounded-full px-4 py-1.5 inline-block">
                  History
                </span>
              ) : (
                <span className="text-[12px] font-medium text-black bg-white rounded-full px-5 py-2 inline-block">
                  {event.ticketUrl ? "Tickets" : "RSVP"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
