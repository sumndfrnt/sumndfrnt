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
    <section id="merch" className="py-[120px] px-6 max-w-[900px] mx-auto text-center">
      <Reveal>
        <h2 className="font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.06] tracking-tight text-white mb-12">
          Shop.
        </h2>
      </Reveal>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06}>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-400 hover:border-white/[0.12] hover:-translate-y-0.5"
                >
                  <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/10 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-4 text-left">
                    {!product.available && (
                      <span className="inline-block text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-white/[0.06] text-white/30 mb-2">
                        Sold out
                      </span>
                    )}
                    {product.compareAtPrice && product.available && (
                      <span className="inline-block text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 mb-2">
                        Sale
                      </span>
                    )}
                    <p className="text-[15px] font-semibold text-white tracking-tight leading-snug">
                      {product.title}
                    </p>
                    <p className="text-[14px] text-white/50 mt-1.5">
                      {product.compareAtPrice && (
                        <span className="line-through text-white/25 mr-2">
                          {formatPrice(product.compareAtPrice, product.priceCurrency)}
                        </span>
                      )}
                      {formatPrice(product.priceAmount, product.priceCurrency)}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-12">
              <a
                href={shopUrl + "/collections/all"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[14px] font-medium text-white/50 border border-white/[0.08] rounded-full px-7 py-3 hover:text-white hover:border-white/25 transition-all"
              >
                View All
              </a>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal delay={0.1}>
          <p className="text-[17px] font-normal leading-relaxed text-white/35 max-w-[400px] mx-auto mb-10">
            Official SUM&apos;N DFRNT merch is live.
          </p>
          <a
            href={shopUrl !== "#" ? shopUrl + "/collections/all" : "/"}
            target={shopUrl !== "#" ? "_blank" : undefined}
            rel={shopUrl !== "#" ? "noopener noreferrer" : undefined}
            className="inline-block bg-white text-black font-medium text-[15px] rounded-full px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            Visit Shop
          </a>
        </Reveal>
      )}
    </section>
  );
}
