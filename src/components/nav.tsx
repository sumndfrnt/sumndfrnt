"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Events", href: "/#events", sectionId: "events" },
  { label: "Shop", href: "/#shop", sectionId: "shop" },
  { label: "About", href: "/#about", sectionId: "about" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          padding: "16px 32px",
          opacity: scrolled ? 1 : 0,
          pointerEvents: scrolled ? "auto" : "none",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-[13px] font-display font-bold text-white/70 tracking-tight hover:text-white transition-colors duration-500">
            SUM&apos;N DFRNT
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[12px] text-white/30 hover:text-white/70 transition-colors duration-500"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-[1px] bg-white/50 transition-all duration-300"
              style={{ transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none" }}
            />
            <span
              className="block w-5 h-[1px] bg-white/50 transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-[1px] bg-white/50 transition-all duration-300"
              style={{ transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 flex flex-col items-start justify-end px-8 pb-24 gap-6 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-[32px] font-bold text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
