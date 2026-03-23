import { getProducts, getShopUrl, isShopConfigured } from "@/lib/shopify";
import { Reveal } from "./reveal";

function formatPrice(amount: string, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export async function ShopSection() {
  const configured = isShopConfigured();
  const products = configured ? await getProducts() : [];
  const shopUrl = getShopUrl();

  return (
    <section id="shop" className="relative py-[140px] sm:py-[180px] px-8 sm:px-12 lg:px-20">
      {/* Divider */}
      <div className="absolute top-0 left-8 sm:left-12 lg:left-20 right-8 sm:right-12 lg:right-20 h-px bg-white/[0.04]" />

      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-6">
            Shop
          </p>
          <h2
            className="font-display font-bold text-white leading-[1.05] mb-16"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              letterSpacing: "-0.04em",
            }}
          >
            Merch.
          </h2>
        </Reveal>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product, i) => (
                <Reveal key={product.id} delay={i * 0.08}>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden border border-white/[0.04] bg-white/[0.015] transition-all duration-700 hover:border-white/[0.1] hover:-translate-y-[3px]"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-[#060608]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.imageAlt}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/8 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-5 flex items-center justify-between">
                      <div>
                        {!product.available && (
                          <span className="inline-block text-[10px] font-semibold tracking-widest px-2.5 py-1 rounded-md bg-white/[0.04] text-white/20 mb-2 uppercase">
                            Sold out
                          </span>
                        )}
                        <p className="text-[15px] font-medium text-white/80 tracking-tight">
                          {product.title}
                        </p>
                      </div>
                      <p className="text-[14px] text-white/30">
                        {formatPrice(product.priceAmount, product.priceCurrency)}
                      </p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-14">
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-white/25 hover:text-white/50 transition-colors duration-500"
                >
                  View all &rarr;
                </a>
              </div>
            </Reveal>
          </>
        ) : (
          <Reveal delay={0.1}>
            <p className="text-[17px] text-white/30 max-w-[400px] mb-8">
              Official SUM&apos;N DFRNT merch is live.
            </p>
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[14px] font-medium text-black bg-white rounded-full px-8 py-3.5 hover:opacity-80 transition-opacity duration-500"
            >
              Visit Shop
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
