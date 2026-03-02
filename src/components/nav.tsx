"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/", sectionId: "top" },
  { label: "Events", href: "/#events", sectionId: "events" },
  { label: "Shop", href: "/#merch", sectionId: "merch" },
  { label: "About", href: "/#about", sectionId: "about" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);

      // Scroll spy — find which section is in view
      const sections = NAV_LINKS.map((l) => l.sectionId);
      let current = "top";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = (sectionId: string) => {
    setMenuOpen(false);
    setActiveSection(sectionId);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          padding: scrolled ? "12px 24px" : "20px 24px",
          background: scrolled || menuOpen ? "rgba(0,0,0,0.9)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(30px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(30px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between sm:justify-center relative">
          {/* Mobile: logo left */}
          <div className="sm:hidden flex items-center">
            <img src="/logo-512.png" alt="SUM'N DFRNT" width={30} height={30} className="rounded-full" />
          </div>

          {/* Desktop: centered links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => handleLinkClick(link.sectionId)}
                  className="relative text-[13px] px-4 py-1.5 rounded-full transition-all duration-300"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Follow button — desktop only, pinned right */}
          <a
            href="https://instagram.com/sumn.dfrnt"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block absolute right-0 text-xs font-medium text-black bg-white rounded-full px-5 py-2 hover:opacity-85 transition-opacity"
          >
            Follow
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-[1.5px] bg-white/70 transition-all duration-300"
              style={{
                transform: menuOpen ? "rotate(45deg) translateY(6.5px)" : "none",
              }}
            />
            <span
              className="block w-5 h-[1.5px] bg-white/70 transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-[1.5px] bg-white/70 transition-all duration-300"
              style={{
                transform: menuOpen ? "rotate(-45deg) translateY(-6.5px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 sm:hidden"
          style={{ paddingTop: 80 }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.sectionId;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleLinkClick(link.sectionId)}
                className="transition-colors"
                style={{
                  fontSize: 24,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href="https://instagram.com/sumn.dfrnt"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-4 text-sm font-medium text-black bg-white rounded-full px-8 py-3 hover:opacity-85 transition-opacity"
          >
            Follow
          </a>
        </div>
      )}
    </>
  );
}
