import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getSiteOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ...(origin ? { sitemap: new URL("/sitemap.xml", origin).toString() } : {}),
  };
}
