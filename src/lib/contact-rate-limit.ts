import "server-only";

import { createHash } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

const MAX_REQUESTS = 5;

export function getTrustedClientAddress(headersList: Headers): string | null {
  if (process.env.NODE_ENV === "production" && process.env.TRUSTED_PROXY_HEADERS !== "true") return null;
  const address = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip")?.trim();
  return address && address.length <= 128 ? address : null;
}

export async function allowRateLimit(key: string, limit = MAX_REQUESTS) {
  const keyHash = createHash("sha256").update(key).digest("hex");
  return mutateApplication<boolean>("rateLimit", { keyHash, limit });
}

export async function allowAdminLogin() {
  return mutateApplication<boolean>("adminLoginAttempt");
}

export async function resetAdminLoginThrottle() {
  await mutateApplication("adminLoginReset");
}
