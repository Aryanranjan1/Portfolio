import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

type ServerArgs = { secret: string; operation: string; input: Record<string, unknown> };
const adminQuery = makeFunctionReference<"query", ServerArgs, unknown>("admin:read");
const applicationMutation = makeFunctionReference<"mutation", ServerArgs, unknown>("applicationMutations:run");
const domainErrors = new Set([
  "UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND", "CONFLICT",
  "MEDIA_NOT_FOUND", "STORAGE_NOT_CONFIGURED", "STORAGE_DELETE_PENDING", "STORAGE_UPLOAD_FAILED",
]);

let client: ConvexHttpClient | undefined;

function getClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  client ??= new ConvexHttpClient(url, {
    // Admin reads and mutation responses are private and must never enter a Next data cache.
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  });
  return client;
}

function serverSecret() {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret) throw new Error("CONVEX_SERVER_SECRET is not configured");
  return secret;
}

export async function readAdmin<T>(operation: string, input: Record<string, unknown> = {}): Promise<T> {
  try {
    return restoreDates(await getClient().query(adminQuery, { secret: serverSecret(), operation, input })) as T;
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

function restoreDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(restoreDates);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    (/(At$|^at$)/.test(key) && typeof item === "number") ? new Date(item) : restoreDates(item),
  ]));
}

export async function mutateApplication<T>(operation: string, input: Record<string, unknown> = {}): Promise<T> {
  try {
    const result = await getClient().mutation(applicationMutation, { secret: serverSecret(), operation, input: serializeDates(input) as Record<string, unknown> });
    return restoreMutationDates(result) as T;
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

function normalizeDomainError(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const code = (error as { data?: unknown }).data;
    if (typeof code === "string" && domainErrors.has(code)) return new Error(code, { cause: error });
  }
  return error;
}

function serializeDates(value: unknown): unknown {
  if (value instanceof Date) return value.getTime() * 1000;
  if (Array.isArray(value)) return value.map(serializeDates);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeDates(item)]));
}

function restoreMutationDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(restoreMutationDates);
  if (!value || typeof value !== "object") return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    (/(At$|^at$)/.test(key) && typeof item === "number") ? new Date(item / 1000) : restoreMutationDates(item),
  ]));
  if (typeof result.legacyId === "string") {
    result.id ??= result.legacyId;
    delete result.legacyId;
  }
  delete result._id;
  delete result._creationTime;
  return result;
}
