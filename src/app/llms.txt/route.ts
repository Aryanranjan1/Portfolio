import { getSiteSettings } from "@/db/queries/site";
import { getCanonicalSiteUrl } from "@/lib/site-origin";
import { getDiscoverableArticles } from "@/db/queries/articles";
import { getDiscoverableProjects } from "@/db/queries/projects";

export const dynamic = "force-dynamic";
export async function GET() {
  const [settings, articles, projects] = await Promise.all([getSiteSettings(), getDiscoverableArticles(), getDiscoverableProjects()]);
  const siteName = settings?.siteName ?? "";
  const siteDescription = settings?.siteDescription?.trim() ?? "";
  const [homeUrl, aboutUrl, projectsUrl, blogUrl, contactUrl, privacyUrl, termsUrl] = await Promise.all([
    getCanonicalSiteUrl("/"), getCanonicalSiteUrl("/about"), getCanonicalSiteUrl("/projects"),
    getCanonicalSiteUrl("/blog"), getCanonicalSiteUrl("/contact"), getCanonicalSiteUrl("/privacy"),
    getCanonicalSiteUrl("/terms"),
  ]);
  const lines = [
    `# ${siteName || "Public website"}`,
    "",
    siteDescription,
    "",
    "## Public pages",
    ...[
      ["Home", homeUrl], ["About", aboutUrl], ["Projects", projectsUrl], ["Blog", blogUrl],
      ["Contact", contactUrl], ["Privacy", privacyUrl], ["Terms", termsUrl],
    ].filter((item): item is [string, string] => typeof item[1] === "string").map(([label, url]) => `- ${label}: ${url}`),
    ...(await getCanonicalSiteUrl("/sitemap.xml").then((url) => url ? ["", "## Discovery resources", `- XML sitemap: ${url}`] : [])),
    "",
    "## Public projects",
    ...await Promise.all(projects.map(async (item) => {
      const url = await getCanonicalSiteUrl(`/projects/${item.slug}`, item.canonicalOverride);
      return url ? `- ${item.title}: ${url}` : null;
    })).then((items) => items.filter((item): item is string => item !== null)),
    "",
    "## Public articles",
    ...await Promise.all(articles.map(async (item) => {
      const url = await getCanonicalSiteUrl(`/blog/${item.slug}`, item.canonicalOverride);
      return url ? `- ${item.title}: ${url}` : null;
    })).then((items) => items.filter((item): item is string => item !== null)),
  ];
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
