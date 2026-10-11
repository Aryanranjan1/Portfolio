import type { MetadataRoute } from "next";
import { getDiscoverableArticles } from "@/lib/convex/queries/articles";
import { getDiscoverableProjects } from "@/lib/convex/queries/projects";
import { getSiteOrigin } from "@/lib/site-origin";
import { dedupeSitemapEntries, getSitemapContentUrl } from "@/lib/seo/sitemap-entries";

export const dynamic = "force-dynamic";

// TODO(hosting): sitemap generation is deferred during development until a real HTTPS origin is configured and verified for production hosting.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();
  if (!origin) return [];
  const [articles, projects] = await Promise.all([getDiscoverableArticles(), getDiscoverableProjects()]);
  const staticRoutes = ["/", "/about", "/projects", "/blog", "/contact", "/privacy", "/terms"];
  const contentUrls = [
    ...projects.map((project) => {
      const url = getSitemapContentUrl(origin.origin, `/projects/${project.slug}`, project.canonicalOverride);
      return url ? { url, lastModified: project.updatedAt } : null;
    }),
    ...articles.map((article) => {
      const url = getSitemapContentUrl(origin.origin, `/blog/${article.slug}`, article.canonicalOverride);
      return url ? { url, lastModified: article.updatedAt } : null;
    }),
  ];
  const entries = [
    ...staticRoutes.map((path) => ({ url: new URL(path, origin).toString() })),
    ...contentUrls.filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  ];
  return dedupeSitemapEntries(entries);
}
