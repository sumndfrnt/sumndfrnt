import { Hero } from "@/components/hero";
import { EventsSection } from "@/components/events-section";
import { MerchSection } from "@/components/merch-section";
import { AboutSection } from "@/components/about-section";

export default function Home() {
  return (
    <>
      <Hero />
      <EventsSection />
      <MerchSection />
      <AboutSection />
    </>
  );
}
