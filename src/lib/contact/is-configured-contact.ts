type ContactLink = { type: string; value: string | null; url: string | null };

/** Hide known seed placeholders and generic provider landing pages. */
export function isConfiguredContact({ type, value, url }: ContactLink) {
  const candidate = `${value ?? ""} ${url ?? ""}`.trim();
  if (!candidate || /example\.(com|org)|your-domain|your-email/i.test(candidate)) return false;
  if (type === "email" && !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url ?? "")) return false;
  if (["linkedin", "github", "x", "threads", "instagram", "youtube"].includes(type) && url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const providers: Record<string, string[]> = { github: ["github.com", "www.github.com"], linkedin: ["linkedin.com", "www.linkedin.com"], x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"], threads: ["threads.net", "www.threads.net", "threads.com", "www.threads.com"], instagram: ["instagram.com", "www.instagram.com"], youtube: ["youtube.com", "www.youtube.com", "youtu.be"] };
      if (parsed.protocol !== "https:" || !providers[type]?.includes(hostname) || parsed.pathname === "/") return false;
      if (type === "threads" && !/^\/@[A-Za-z0-9._]+\/?$/.test(parsed.pathname)) return false;
    } catch {
      return false;
    }
  }
  return Boolean(url);
}
