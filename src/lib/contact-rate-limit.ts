const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_KEYS = 10_000;

type RateLimitEntry = { count: number; resetAt: number };
const globalRateLimit = globalThis as typeof globalThis & {
  contactRateLimit?: Map<string, RateLimitEntry>;
};
const rateLimit = globalRateLimit.contactRateLimit ??= new Map();

export function allowContactSubmission(
  key: string,
  now = Date.now(),
): boolean {
  const current = rateLimit.get(key);
  if (!current || current.resetAt <= now) {
    if (!current && rateLimit.size >= MAX_KEYS) {
      for (const [entryKey, entry] of rateLimit) {
        if (entry.resetAt <= now) rateLimit.delete(entryKey);
      }
      if (rateLimit.size >= MAX_KEYS) return false;
    }
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}
