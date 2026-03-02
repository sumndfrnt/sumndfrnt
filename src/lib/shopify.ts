const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || "";

export interface ShopProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceAmount: string;
  priceCurrency: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
  url: string;
}

const PRODUCTS_QUERY = `
{
  products(first: 12, sortKey: BEST_SELLING) {
    edges {
      node {
        id
        title
        handle
        description
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          maxVariantPrice {
            amount
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  }
}
`;

export async function getProducts(): Promise<ShopProduct[]> {
  if (!domain || !token) {
    console.log("[Shopify] Not configured — domain:", !!domain, "token:", !!token);
    return [];
  }

  try {
    const url = `https://${domain}/api/2024-10/graphql.json`;
    console.log("[Shopify] Fetching from:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.log("[Shopify] API error:", res.status, res.statusText);
      return [];
    }

    const json = await res.json();

    if (json.errors) {
      console.log("[Shopify] GraphQL errors:", JSON.stringify(json.errors));
      return [];
    }

    const edges = json?.data?.products?.edges || [];
    console.log("[Shopify] Found", edges.length, "products");

    const shopDomain = domain.replace(".myshopify.com", "");
    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_URL || `https://${shopDomain}.myshopify.com`;

    return edges.map((edge: any) => {
      const p = edge.node;
      const price = p.priceRange?.minVariantPrice;
      const compareAt = p.compareAtPriceRange?.maxVariantPrice?.amount;
      const hasCompare = compareAt && parseFloat(compareAt) > parseFloat(price?.amount || "0");

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description || "",
        priceAmount: price?.amount || "0",
        priceCurrency: price?.currencyCode || "USD",
        compareAtPrice: hasCompare ? compareAt : null,
        imageUrl: p.featuredImage?.url || null,
        imageAlt: p.featuredImage?.altText || p.title,
        available: p.availableForSale,
        url: `${storeUrl}/products/${p.handle}`,
      };
    });
  } catch (err) {
    console.log("[Shopify] Fetch error:", err);
    return [];
  }
}

export function getShopUrl(): string {
  if (!domain) return "#";
  const shopDomain = domain.replace(".myshopify.com", "");
  return process.env.NEXT_PUBLIC_SHOPIFY_URL || `https://${shopDomain}.com`;
}

export function isShopConfigured(): boolean {
  return !!(domain && token);
}
