import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { EventsSection } from "@/components/events-section";
import { ShopSection } from "@/components/shop-section";
import { AboutSection } from "@/components/about-section";

export default async function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <EventsSection />
      <ShopSection />
      <AboutSection />
    </>
  );
}
