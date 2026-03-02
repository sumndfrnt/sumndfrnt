# SUM'N DFRNT — V2

From the culture. For what's next.

## Stack

- **Next.js 14** — React framework
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations (available but minimal — Apple-clean approach)
- **Shopify Storefront API** — Headless merch
- **PeerPop** — Event ticketing (adapter ready, awaiting API access)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Events

Events come from two sources that merge automatically:

1. **Manual** — Edit `src/data/events.ts` to add events not on PeerPop
2. **PeerPop** — Auto-pulls when API credentials are configured (see `src/lib/events-adapter.ts`)

## Merch / Shopify

Add these to `.env.local`:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=sumn-dfrnt.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-token-here
```

Without these, mock products are shown.

## Deploy

Push to GitHub → Vercel auto-deploys. See DEPLOYMENT-GUIDE.md for full walkthrough.
