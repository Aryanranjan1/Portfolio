import { unstable_cache } from "next/cache";
import { readAllPublicPages } from "./paginate-public";
import { buildBlogIndexData, type BlogIndexData, type BlogIndexArticle } from "./blog-index-data";

export type BlogArticle = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
};

export type BlogContent = { featured: BlogArticle | null; recent: BlogArticle[] };

export async function getBlogContent(): Promise<BlogContent> {
  const rows = await readAllPublicPages<BlogIndexArticle>("blogArticles");
  rows.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  const featured = rows.find((row) => row.featured) ?? null;
  const toArticle = (row: BlogIndexArticle): BlogArticle => ({
    id: row.id, title: row.title, category: row.category.name,
    date: row.publishedAt?.toISOString() ?? "", description: row.excerpt,
    image: row.image?.url ?? "", imageAlt: row.image?.altText ?? "", url: `/blog/${row.slug}`,
  });
  return { featured: featured ? toArticle(featured) : null, recent: rows.filter((row) => row.id !== featured?.id).slice(0, 6).map(toArticle) };
}

export const getBlogIndexData = unstable_cache(
  async (params: { q?: string; category?: string; sort?: string; page?: string }): Promise<BlogIndexData> => {
    const all = await readAllPublicPages<BlogIndexArticle>("blogIndex");
    return buildBlogIndexData(all, params);
  },
  ["convex-blog-index"],
  { revalidate: 86_400, tags: ["blog-index", "public-blog-index", "public-articles"] },
);
