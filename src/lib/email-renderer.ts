import type { EmailBlock, Campaign, Subscriber, Automation } from "./data";
import { mergeFields } from "./data";

/**
 * Render a campaign for a specific subscriber.
 * Supports two modes:
 * - "html" — raw HTML with {{merge_tags}} replaced
 * - "builder" — block-based rendering
 */
export function renderCampaignEmail(
  campaign: Campaign | Automation,
  subscriber: Subscriber,
  baseUrl: string
): string {
  const trackingPixel = `<img src="${baseUrl}/api/campaigns/track?c=${campaign.id}&s=${subscriber.id}&t=open" width="1" height="1" style="display:none;" alt="" />`;

  if (campaign.mode === "html" && campaign.html) {
    // Replace {{site_url}} first
    let html = campaign.html.replace(/\{\{site_url\}\}/gi, baseUrl);
    // Merge subscriber fields
    html = mergeFields(html, subscriber, baseUrl);
    // Inject tracking pixel before </body>
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${trackingPixel}</body>`);
    } else {
      html += trackingPixel;
    }
    // Replace link hrefs with tracked versions
    html = injectClickTracking(html, campaign.id, subscriber.id, baseUrl);
    return html;
  }

  // Builder mode
  const blocksHtml = campaign.blocks
    .map((block) => renderBlock(block, campaign.id, subscriber.id, baseUrl))
    .join("");

  const unsubLink = `${baseUrl}/unsubscribe?id=${subscriber.id}`;

  let fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${"subject" in campaign ? campaign.subject : ""}</title></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
${"preheader" in campaign && campaign.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#000;font-size:1px;">${campaign.preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td>${blocksHtml}</td></tr>
<tr><td style="padding:32px 0 0;text-align:center;">
<p style="margin:0;font-size:11px;line-height:1.5;color:rgba(255,255,255,0.15);">
You received this because you signed up at sumndfrnt.com<br>
<a href="${unsubLink}" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Unsubscribe</a>
</p></td></tr></table></td></tr></table>
${trackingPixel}
</body></html>`;

  // Merge subscriber fields in builder mode too
  fullHtml = mergeFields(fullHtml, subscriber, baseUrl);
  return fullHtml;
}

function injectClickTracking(html: string, campaignId: string, subscriberId: string, baseUrl: string): string {
  // Replace href="..." with tracked redirect (skip unsubscribe and # links)
  return html.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url) => {
      if (url.includes("/unsubscribe") || url.includes("/api/campaigns/track")) return match;
      const tracked = `${baseUrl}/api/campaigns/track?c=${campaignId}&s=${subscriberId}&t=click&url=${encodeURIComponent(url)}`;
      return `href="${tracked}"`;
    }
  );
}

function renderBlock(block: EmailBlock, campaignId: string, subscriberId: string, baseUrl: string): string {
  const align = block.align || "center";
  const ta = `text-align:${align};`;

  switch (block.type) {
    case "header": {
      const s: Record<string, string> = { sm: "18px", md: "24px", lg: "32px", xl: "42px" };
      return `<tr><td style="padding:8px 0;${ta}"><h1 style="margin:0;font-size:${s[block.size || "lg"]};line-height:1.1;font-weight:700;color:#fff;letter-spacing:-0.02em;">${esc(block.content)}</h1></td></tr>`;
    }
    case "text": {
      const s: Record<string, string> = { sm: "13px;color:rgba(255,255,255,0.3)", md: "16px;color:rgba(255,255,255,0.55)", lg: "18px;color:rgba(255,255,255,0.65)", xl: "20px;color:rgba(255,255,255,0.7)" };
      return `<tr><td style="padding:6px 0;${ta}"><p style="margin:0;font-size:${s[block.size || "md"]};line-height:1.6;">${esc(block.content).replace(/\n/g, "<br>")}</p></td></tr>`;
    }
    case "image": {
      const w: Record<string, string> = { sm: "80", md: "200", lg: "400", xl: "600" };
      const src = block.content.startsWith("/") ? `${baseUrl}${block.content}` : block.content;
      const img = `<img src="${src}" width="${w[block.size || "md"]}" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto;" alt="" />`;
      if (block.url) {
        const t = `${baseUrl}/api/campaigns/track?c=${campaignId}&s=${subscriberId}&t=click&url=${encodeURIComponent(block.url)}`;
        return `<tr><td style="padding:12px 0;${ta}"><a href="${t}">${img}</a></td></tr>`;
      }
      return `<tr><td style="padding:12px 0;${ta}">${img}</td></tr>`;
    }
    case "button": {
      const t = `${baseUrl}/api/campaigns/track?c=${campaignId}&s=${subscriberId}&t=click&url=${encodeURIComponent(block.url || "#")}`;
      return `<tr><td style="padding:16px 0;${ta}"><a href="${t}" style="display:inline-block;background:#fff;color:#000;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:980px;">${esc(block.content)}</a></td></tr>`;
    }
    case "divider":
      return `<tr><td style="padding:16px 0;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0;" /></td></tr>`;
    case "spacer": {
      const h: Record<string, string> = { sm: "16", md: "32", lg: "48", xl: "64" };
      return `<tr><td style="height:${h[block.size || "md"]}px;"></td></tr>`;
    }
    default: return "";
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
