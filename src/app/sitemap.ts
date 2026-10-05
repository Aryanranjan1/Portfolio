import type { MetadataRoute } from "next";
import { getDiscoverableArticles } from "@/db/queries/articles";
import { getDiscoverableProjects } from "@/db/queries/projects";
import { getCanonicalSiteUrl, getSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

// TODO(hosting): sitemap generation is deferred during development until a real HTTPS origin is configured and verified for production hosting.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();
  if (!origin) return [];
  const [articles, projects] = await Promise.all([getDiscoverableArticles(), getDiscoverableProjects()]);
  const staticRoutes = ["/", "/about", "/projects", "/blog", "/contact", "/privacy", "/terms"];
  const contentUrls = await Promise.all([
    ...projects.map((project) => getCanonicalSiteUrl(`/projects/${project.slug}`, project.canonicalOverride)
      .then((url) => url ? { url, lastModified: project.updatedAt } : null)),
    ...articles.map((article) => getCanonicalSiteUrl(`/blog/${article.slug}`, article.canonicalOverride)
      .then((url) => url ? { url, lastModified: article.updatedAt } : null)),
  ]);
  return [
    ...staticRoutes.map((path) => ({ url: new URL(path, origin).toString() })),
    ...contentUrls.filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  ].filter((entry, index, all) => all.findIndex((candidate) => candidate.url === entry.url) === index);
}
