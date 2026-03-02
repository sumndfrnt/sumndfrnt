import { getAutomations, saveAutomation, type Automation, type Subscriber, mergeFields } from "./data";
import { renderCampaignEmail } from "./email-renderer";
import { sendEmail } from "./email-sender";

/**
 * Fire automations for a new subscriber.
 * Called from the subscribe API.
 */
export async function fireAutomations(subscriber: Subscriber, tag: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sumndfrnt.com";
  const autos = getAutomations().filter((a) => a.enabled);

  for (const auto of autos) {
    let shouldFire = false;
    if (auto.trigger === "signup_any") shouldFire = true;
    if (auto.trigger === "signup_events" && tag === "events") shouldFire = true;
    if (auto.trigger === "signup_merch" && tag === "merch") shouldFire = true;

    if (!shouldFire || !subscriber.email) continue;

    if (auto.delayMinutes > 0) {
      setTimeout(async () => {
        await sendAutomationEmail(auto, subscriber, baseUrl);
      }, auto.delayMinutes * 60 * 1000);
    } else {
      await sendAutomationEmail(auto, subscriber, baseUrl);
    }
  }
}

async function sendAutomationEmail(auto: Automation, subscriber: Subscriber, baseUrl: string) {
  const html = renderCampaignEmail(auto, subscriber, baseUrl);
  const subject = mergeFields(auto.subject, subscriber, baseUrl);

  const success = await sendEmail({ to: subscriber.email, subject, html });
  if (success) {
    auto.stats.sent++;
    saveAutomation(auto);
  }
}
