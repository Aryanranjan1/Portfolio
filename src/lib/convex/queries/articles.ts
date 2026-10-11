import { cache } from "react";
import { readPublic } from "@/lib/convex-read";
import { readAdmin } from "@/lib/convex-server";
import { readAllPublicPages } from "./paginate-public";
import type { ConvexRow } from "../types";

type Article = ConvexRow<"article">;
type LlmsArticle = Pick<Article, "slug" | "title" | "canonicalOverride"> & { description: string };
type Category = ConvexRow<"articleCategory">;
type ArticleTag = Pick<ConvexRow<"tag">, "id" | "name" | "slug">;
type Block = ConvexRow<"articleBlock">;
type Image = Pick<ConvexRow<"media">, "url" | "altText" | "width" | "height">;
type BlogArticle = { id: string; slug: string; title: string; excerpt: string; featured: boolean; publishedAt: Date | null; category: Pick<Category, "name" | "slug">; image: Pick<Image, "url" | "altText"> };
type RecentArticle = Pick<Article, "id" | "slug" | "title" | "excerpt" | "publishedAt">;
type ArticlePage = Article & { category: Category | null; tags: ArticleTag[]; blocks: Block[]; socialImage: Image | null; previousArticle: Article | null; nextArticle: Article | null; relatedArticles: Article[]; recentArticles: RecentArticle[] };

export async function getPublishedArticles() { return readAllPublicPages<Article>("articles"); }
export async function getArticleSlugById(id: string) { return readAdmin<string | null>("articleSlugById", { id }); }
export async function getArticleRedirectSlug(slug: string) { return readPublic<string | null>("articleRedirect", { slug }); }
export async function getDiscoverableArticles() { return readAllPublicPages<Pick<Article, "slug" | "title" | "updatedAt" | "canonicalOverride">>("discoverableArticles"); }
export async function getLlmsDiscoverableArticles() { return readAllPublicPages<LlmsArticle>("llmsArticles"); }
export async function getPublishedBlogArticles() {
  const rows = await readAllPublicPages<BlogArticle>("blogArticles");
  return rows.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}
export async function getFeaturedArticle() {
  const rows = await readAllPublicPages<Article>("featuredArticle");
  return rows.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))[0] ?? null;
}
export async function getPublishedArticleBySlug(slug: string) { return readPublic<Article | null>("articleBySlug", { slug }); }
export async function getArticleCategory(id: string) { return readPublic<Category | null>("articleCategory", { id }); }
export async function getArticleTags(id: string) { return readPublic<ArticleTag[]>("articleTags", { id }); }
export async function getArticleBlocks(id: string) { return readPublic<Block[]>("articleBlocks", { id }); }
export async function getRecentArticles(id?: string, limit = 6) { return readPublic<RecentArticle[]>("recentArticles", { id, limit }); }
export async function getPreviousArticle(publishedAt: Date, id: string) { return readPublic<Article | null>("previousArticle", { publishedAt: publishedAt.getTime(), id }); }
export async function getNextArticle(publishedAt: Date, id: string) { return readPublic<Article | null>("nextArticle", { publishedAt: publishedAt.getTime(), id }); }
export async function getRelatedArticles(id: string, categoryId: string) { return readPublic<Article[]>("relatedArticles", { id, categoryId }); }

export const getPublishedArticlePage = cache(async function getPublishedArticlePage(slug: string): Promise<ArticlePage | null> {
  return readPublic<ArticlePage | null>("articlePage", { slug });
});
