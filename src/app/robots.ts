import type { MetadataRoute } from "next";
import { getDiscoveryOrigin } from "@/lib/discovery-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getDiscoveryOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: new URL("/sitemap.xml", origin).toString(),
  };
}
