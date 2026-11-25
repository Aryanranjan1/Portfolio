import type { MetadataRoute } from "next";
import { getDiscoveryOrigin } from "@/lib/discovery-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getDiscoveryOrigin();
  const aiAgents = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User", "OAI-AdsBot",
    "ClaudeBot", "Claude-SearchBot", "Claude-User",
    "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      ...aiAgents.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin", "/api/"] })),
    ],
    sitemap: new URL("/sitemap.xml", origin).toString(),
  };
}
