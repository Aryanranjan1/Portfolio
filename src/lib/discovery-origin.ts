const CANONICAL_PORTFOLIO_ORIGIN = "https://www.aryanranjan.dev";

/**
 * Public discovery documents must never inherit a stale host from site settings.
 * Honor the deployment setting only when it names this site's canonical origin.
 */
export function getDiscoveryOrigin(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" && url.origin === CANONICAL_PORTFOLIO_ORIGIN && url.pathname === "/" && !url.search && !url.hash) {
        return new URL(CANONICAL_PORTFOLIO_ORIGIN);
      }
    } catch {
      // Fall through to the verified public origin.
    }
  }
  return new URL(CANONICAL_PORTFOLIO_ORIGIN);
}

/** Use only same-origin canonical overrides in public discovery documents. */
export function getDiscoveryUrl(path: string, override?: string | null): string {
  const origin = getDiscoveryOrigin();
  if (override?.trim()) {
    try {
      const url = new URL(override.trim());
      if (url.protocol === "https:" && url.origin === origin.origin && !url.username && !url.password) {
        return url.toString();
      }
    } catch {
      // Invalid overrides fall back to this site's canonical path.
    }
  }
  return new URL(path, origin).toString();
}
