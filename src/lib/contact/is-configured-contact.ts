type ContactLink = { type: string; value: string | null; url: string | null };

/** Hide known seed placeholders and generic provider landing pages. */
export function isConfiguredContact({ type, value, url }: ContactLink) {
  const candidate = `${value ?? ""} ${url ?? ""}`.trim();
  if (!candidate || /example\.(com|org)|your-domain|your-email/i.test(candidate)) return false;
  if (type === "email" && !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url ?? "")) return false;
  if (["linkedin", "github", "x"].includes(type) && url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const providers: Record<string, string[]> = { github: ["github.com", "www.github.com"], linkedin: ["linkedin.com", "www.linkedin.com"], x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"] };
      if (parsed.protocol !== "https:" || !providers[type]?.includes(hostname) || parsed.pathname === "/") return false;
    } catch {
      return false;
    }
  }
  return Boolean(url);
}
