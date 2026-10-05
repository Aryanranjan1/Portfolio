import { getContactMethods, getFAQs, getSiteSettings } from "@/db/queries/site";
import { isConfiguredContact } from "./is-configured-contact";

export async function getContactContent() {
  const [settings, methods, faqs] = await Promise.all([
    getSiteSettings(),
    getContactMethods(),
    getFAQs(),
  ]);
  const configuredMethods = methods.filter(isConfiguredContact);
  const contactMethods = configuredMethods
    .filter((method) => method.type !== "location" && method.url)
    .map((method) => ({
      id: method.id,
      label: method.label,
      value: method.value ?? method.url ?? "",
      href: method.url!,
      icon: method.type,
    }));
  if (settings?.primaryEmail && !/example\.(com|org)|your-email/i.test(settings.primaryEmail) && !configuredMethods.some((method) => method.type === "email")) {
    contactMethods.unshift({
      id: "primary-email",
      label: "Email",
      value: settings.primaryEmail,
      href: `mailto:${settings.primaryEmail}`,
      icon: "email",
    });
  }
  return {
    contactMethods,
    faqs: faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer })),
    location: settings?.location ?? "",
    availabilityText: settings?.availabilityText ?? "",
  };
}
