import { getBlogIndexData } from "@/db/queries/blog";
import BlogPage from "@/sections/BlogPage";
import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";
import { normalizeBlogSearchParams } from "@/lib/blog/search-params";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([getAbsoluteSiteUrl("/blog"), getDefaultSocialImageMetadata()]);
  return { title: "Blog", description: "Technical writing about software engineering, web development, databases, and systems.", ...(canonical ? { alternates: { canonical } } : {}), openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) } };
}

type SearchParams = { q?: string | string[]; category?: string | string[]; sort?: string | string[]; page?: string | string[] };

export default async function BlogRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const normalizedParams = normalizeBlogSearchParams(params);
  const result = await getBlogIndexData(normalizedParams);

  return (
    <PublicSiteShell>
      <BlogPage articles={result.articles} featured={result.featured} categories={result.categories} totalPages={result.totalPages} currentPage={result.page} searchParams={normalizedParams} />
    </PublicSiteShell>
  );
}
