import { getSiteSettings } from "@/lib/convex/queries/site";
import { getLlmsDiscoverableArticles } from "@/lib/convex/queries/articles";
import { getLlmsDiscoverableProjects } from "@/lib/convex/queries/projects";
import { buildLlmsContent } from "@/lib/llms-content";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [settings, articles, projects] = await Promise.all([
      getSiteSettings(), getLlmsDiscoverableArticles(), getLlmsDiscoverableProjects(),
    ]);
    const body = buildLlmsContent({
      siteName: settings?.siteName ?? settings?.personName,
      siteDescription: settings?.siteDescription,
      shortDescription: settings?.shortDescription,
      projects,
      articles,
    });
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    console.error("Unable to generate llms.txt because a required public data source failed.");
    return new Response("llms.txt is temporarily unavailable.\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
