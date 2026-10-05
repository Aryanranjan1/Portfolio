const PLACEHOLDER_HOSTS = ["example.com", "example.org", "example.net", "example", "test", "invalid", "your-domain.com"];

export function normalizeUsableSiteOrigin(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const hostname = normalizeHostname(url.hostname);
    if (url.protocol !== "https:" || url.username || url.password || !hostname || isPrivateHostname(hostname) || isPlaceholderHostname(hostname)) return null;
    url.hostname = hostname.includes(":") ? `[${hostname}]` : hostname;
    return url.origin;
  } catch {
    return null;
  }
}

export function isUsableCanonicalOverride(value: string | null | undefined): value is string {
  return normalizeUsableCanonicalOverride(value) !== null;
}

export function normalizeUsableCanonicalOverride(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const hostname = normalizeHostname(url.hostname);
    if (url.protocol !== "https:" || url.username || url.password || !hostname || isPrivateHostname(hostname) || isPlaceholderHostname(hostname)) return null;
    url.hostname = hostname.includes(":") ? `[${hostname}]` : hostname;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeHostname(input: string) {
  return input.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.+$/, "");
}

function isPlaceholderHostname(hostname: string) {
  return PLACEHOLDER_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function isPrivateHostname(hostname: string) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;
  if (hostname.includes(":")) {
    if (hostname === "::" || hostname === "::1" || /^(?:fc|fd)/.test(hostname) || /^fe[89ab]/.test(hostname)) return true;
    const mapped = hostname.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]);
    const hexMapped = hostname.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMapped) {
      const value = (Number.parseInt(hexMapped[1], 16) << 16) | Number.parseInt(hexMapped[2], 16);
      return isPrivateIpv4([24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join("."));
    }
    return false;
  }
  if (/^[\d.]+$/.test(hostname)) return isPrivateIpv4(hostname);
  return false;
}

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true;
  const [first, second] = octets;
  return first === 0 || first === 10 || first === 127 || (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127);
}
