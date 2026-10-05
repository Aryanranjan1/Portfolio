import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { slugRedirect } from "@/db/schema/slug-redirects";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type RedirectKind = "article" | "project";

export async function recordPublishedSlugChange(tx: Transaction, kind: RedirectKind, entityId: string, oldSlug: string, newSlug: string) {
  if (!oldSlug || oldSlug === newSlug) return;
  const [existing] = await tx.select({ newSlug: slugRedirect.newSlug }).from(slugRedirect)
    .where(and(eq(slugRedirect.kind, kind), eq(slugRedirect.oldSlug, oldSlug))).limit(1);
  if (existing) {
    await tx.update(slugRedirect).set({ entityId, newSlug, createdAt: new Date() })
      .where(and(eq(slugRedirect.kind, kind), eq(slugRedirect.oldSlug, oldSlug)));
  } else {
    await tx.insert(slugRedirect).values({ kind, entityId, oldSlug, newSlug });
  }
  await tx.update(slugRedirect).set({ newSlug, createdAt: new Date() })
    .where(and(eq(slugRedirect.kind, kind), eq(slugRedirect.entityId, entityId), eq(slugRedirect.newSlug, oldSlug), ne(slugRedirect.oldSlug, newSlug)));
}

export async function getPublishedSlugRedirect(kind: RedirectKind, oldSlug: string) {
  const [row] = await db.select({ entityId: slugRedirect.entityId, newSlug: slugRedirect.newSlug }).from(slugRedirect)
    .where(and(eq(slugRedirect.kind, kind), eq(slugRedirect.oldSlug, oldSlug))).limit(1);
  return row?.newSlug ?? null;
}
