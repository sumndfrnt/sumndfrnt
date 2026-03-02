import { MerchSection } from "@/components/merch-section";

export const metadata = {
  title: "Merch — SUM'N DFRNT",
  description: "Official SUM'N DFRNT merch coming soon.",
};

export default function MerchPage() {
  return (
    <div className="pt-20">
      <MerchSection />
    </div>
  );
}
