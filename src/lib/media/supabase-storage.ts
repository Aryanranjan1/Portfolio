import "server-only";

export async function deleteSupabaseMediaObject(storageKey: string) {
  const baseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "portfolio-media";
  if (!baseUrl || !secret) throw new Error("STORAGE_NOT_CONFIGURED");
  const encodedKey = storageKey.split("/").map(encodeURIComponent).join("/");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedKey}`, {
      method: "DELETE",
      headers: { apikey: secret, Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
  } catch {
    throw new Error("STORAGE_DELETE_FAILED");
  }
  if (!response.ok && response.status !== 404) throw new Error("STORAGE_DELETE_FAILED");
}
