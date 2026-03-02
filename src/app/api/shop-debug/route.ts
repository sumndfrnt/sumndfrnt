import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN || "";
  const shopUrl = process.env.NEXT_PUBLIC_SHOPIFY_URL || "";

  const status: Record<string, unknown> = {
    hasDomain: !!domain,
    domainValue: domain ? domain.substring(0, 10) + "..." : "MISSING",
    hasToken: !!token,
    tokenLength: token.length,
    shopUrl: shopUrl || "MISSING",
  };

  if (!domain || !token) {
    return NextResponse.json({ ...status, error: "Missing env vars" });
  }

  try {
    const url = `https://${domain}/api/2024-10/graphql.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query: `{ products(first: 3) { edges { node { id title availableForSale } } } }`,
      }),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({ ...status, error: "Non-JSON response", httpStatus: res.status, body: text.substring(0, 500) });
    }

    if (!res.ok) {
      return NextResponse.json({ ...status, error: "API error", httpStatus: res.status, response: json });
    }

    if (json.errors) {
      return NextResponse.json({ ...status, error: "GraphQL errors", errors: json.errors });
    }

    const products = json?.data?.products?.edges || [];
    return NextResponse.json({
      ...status,
      success: true,
      productCount: products.length,
      products: products.map((e: any) => ({
        title: e.node.title,
        available: e.node.availableForSale,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ ...status, error: "Fetch failed", message: err.message });
  }
}
