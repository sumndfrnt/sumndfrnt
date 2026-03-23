import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="relative px-8 sm:px-12 lg:px-20 py-16">
      {/* Divider */}
      <div className="absolute top-0 left-8 sm:left-12 lg:left-20 right-8 sm:right-12 lg:right-20 h-px bg-white/[0.04]" />

      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <span className="text-[12px] text-white/20">
          &copy; {new Date().getFullYear()} SUM&apos;N DFRNT
        </span>

        <div className="flex items-center gap-6">
          {siteConfig.socials.instagram && (
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-500"
            >
              Instagram
            </a>
          )}
          {siteConfig.socials.tiktok && (
            <a
              href={siteConfig.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-white/20 hover:text-white/50 transition-colors duration-500"
            >
              TikTok
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
