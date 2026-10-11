import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { unstable_cache } from "next/cache";
import { api } from "../../convex/_generated/api";

let client: ConvexHttpClient | undefined;

const publicCacheTags = [
  "public-projects", "public-articles", "public-blog-index", "public-site",
  "public-contact", "public-about", "public-faq", "public-footer", "public-media", "public-comments",
] as const;
type PublicCacheTag = (typeof publicCacheTags)[number];

function cacheTagFor(operation: string, input: Record<string, unknown>): PublicCacheTag {
  if (operation === "contentPage") {
    const collection = String(input.collection ?? "");
    if (["projects", "featuredProjects", "discoverableProjects", "llmsProjects"].includes(collection)) return "public-projects";
    if (collection === "blogIndex") return "public-blog-index";
    return "public-articles";
  }
  if (operation.startsWith("project") || operation === "publishedProjectCategoryNames") return "public-projects";
  if (operation === "commentsByArticleSlug") return "public-comments";
  if (["articleRedirect", "articleBySlug", "articleCategory", "recentArticles", "previousArticle", "nextArticle", "relatedArticles", "articleTags", "articleBlocks", "articlePage"].includes(operation)) return "public-articles";
  if (["contactMethods"].includes(operation)) return "public-contact";
  if (operation === "faqs") return "public-faq";
  if (["footerResources", "footerExploreItems"].includes(operation)) return "public-footer";
  if (["timeline", "faqs", "aboutTechnologies", "skills"].includes(operation)) return "public-about";
  if (operation === "mediaById") return "public-media";
  return "public-site";
}

const cachedPublicRead = Object.fromEntries(publicCacheTags.map((tag) => [tag,
  unstable_cache(
    async (operation: string, input: Record<string, unknown>) => getClient().query(api.public.read, { operation, input }),
    ["convex-public-read", tag],
    { revalidate: 86_400, tags: [tag] },
  ),
])) as Record<PublicCacheTag, (operation: string, input: Record<string, unknown>) => Promise<unknown>>;

function getClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  client ??= new ConvexHttpClient(url, {
    // Public query results are cached by the tagged unstable_cache wrapper below.
    // Keep Next's implicit POST fetch cache out of the persistence path.
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  });
  return client;
}

function restoreDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(restoreDates);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    /At$/.test(key) && typeof item === "number" ? new Date(item) : restoreDates(item),
  ]));
}

export async function readPublic<T = unknown>(operation: string, input: Record<string, unknown> = {}): Promise<T> {
  const result = await cachedPublicRead[cacheTagFor(operation, input)](operation, input);
  return restoreDates(result) as T;
}
