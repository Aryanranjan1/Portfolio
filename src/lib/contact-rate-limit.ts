import "server-only";

import { createHash } from "node:crypto";
import { eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminLoginThrottle, requestRateLimit } from "@/db/schema/rate-limit";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export function getTrustedClientAddress(headersList: Headers): string | null {
  if (process.env.NODE_ENV === "production" && process.env.TRUSTED_PROXY_HEADERS !== "true") return null;
  const address = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip")?.trim();
  return address && address.length <= 128 ? address : null;
}

export async function allowRateLimit(key: string, limit = MAX_REQUESTS) {
  const now = new Date();
  const keyHash = createHash("sha256").update(key).digest("hex");
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const [result] = await db.insert(requestRateLimit).values({ keyHash, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: requestRateLimit.keyHash,
      set: {
        count: sql`CASE WHEN ${requestRateLimit.windowStartedAt} <= ${windowStart} THEN 1 ELSE ${requestRateLimit.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${requestRateLimit.windowStartedAt} <= ${windowStart} THEN ${now} ELSE ${requestRateLimit.windowStartedAt} END`,
      },
    }).returning({ count: requestRateLimit.count });
  if (Math.random() < 0.01) await db.delete(requestRateLimit).where(lte(requestRateLimit.windowStartedAt, new Date(now.getTime() - 24 * WINDOW_MS)));
  return (result?.count ?? limit + 1) <= limit;
}

export async function allowAdminLogin() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const [result] = await db.insert(adminLoginThrottle).values({ scope: "admin", count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: adminLoginThrottle.scope,
      set: {
        count: sql`CASE WHEN ${adminLoginThrottle.windowStartedAt} <= ${windowStart} THEN 1 ELSE ${adminLoginThrottle.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${adminLoginThrottle.windowStartedAt} <= ${windowStart} THEN ${now} ELSE ${adminLoginThrottle.windowStartedAt} END`,
      },
    }).returning({ count: adminLoginThrottle.count });
  return (result?.count ?? 6) <= 5;
}

export async function resetAdminLoginThrottle() {
  await db.delete(adminLoginThrottle).where(eq(adminLoginThrottle.scope, "admin"));
}
