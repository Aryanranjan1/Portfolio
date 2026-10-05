import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { article, articleCategory } from "@/db/schema/articles";
import { media } from "@/db/schema/media";

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

export type BlogContent = {
  featured: BlogArticle | null;
  recent: BlogArticle[];
};

export async function getBlogContent(): Promise<BlogContent> {
  const selectArticle = {
      id: article.id,
      title: article.title,
      category: articleCategory.name,
      date: article.publishedAt,
      description: article.excerpt,
      image: media.url,
      imageAlt: media.altText,
      slug: article.slug,
  };
  const fromArticle = () => db
    .select(selectArticle)
    .from(article)
    .innerJoin(articleCategory, eq(article.categoryId, articleCategory.id))
    .leftJoin(media, eq(article.socialImageId, media.id));
  const order = [desc(article.publishedAt), asc(article.title), asc(article.id)] as const;

  const [featuredRows, recentRows] = await Promise.all([
    fromArticle()
      .where(and(eq(article.status, "published"), eq(article.featured, true)))
      .orderBy(...order)
      .limit(1),
    fromArticle()
      .where(eq(article.status, "published"))
      .orderBy(...order)
      .limit(7),
  ]);

  const mapArticle = (item: (typeof recentRows)[number]): BlogArticle => ({
    id: item.id,
    title: item.title,
    category: item.category,
    date: item.date?.toISOString() ?? "",
    description: item.description ?? "",
    image: item.image ?? "",
    imageAlt: item.imageAlt ?? "",
    url: `/blog/${item.slug}`,
  });
  const featuredRow = featuredRows[0];

  return {
    featured: featuredRow ? mapArticle(featuredRow) : null,
    recent: recentRows
      .filter((item) => item.id !== featuredRow?.id)
      .slice(0, 6)
      .map(mapArticle),
  };
}

export async function getBlogIndexData(params: { q?: string; category?: string; sort?: string; page?: string }) {
  const query = params.q?.trim().slice(0, 120) ?? "";
  const filters = [eq(article.status, "published")];
  if (params.category && params.category !== "all") filters.push(eq(articleCategory.slug, params.category));
  if (query) {
    const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(or(ilike(article.title, pattern), ilike(article.excerpt, pattern), ilike(articleCategory.name, pattern))!);
  }
  const order = params.sort === "oldest" ? [asc(article.publishedAt), asc(article.id)] : [desc(article.publishedAt), desc(article.id)];
  const where = and(...filters);
  const select = {
    id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt,
    featured: article.featured, publishedAt: article.publishedAt,
    category: { name: articleCategory.name, slug: articleCategory.slug },
    image: { url: media.url, altText: media.altText },
  };

  const [featuredMatch, categoryRows] = await Promise.all([
    db.select(select).from(article).innerJoin(articleCategory, eq(article.categoryId, articleCategory.id))
      .leftJoin(media, eq(article.socialImageId, media.id))
      .where(and(where, eq(article.featured, true))).orderBy(...order).limit(1),
    db.select({ name: articleCategory.name, slug: articleCategory.slug, total: count(article.id) })
      .from(articleCategory).innerJoin(article, eq(article.categoryId, articleCategory.id))
      .where(eq(article.status, "published")).groupBy(articleCategory.id, articleCategory.name, articleCategory.slug)
      .orderBy(desc(count(article.id)), asc(articleCategory.name)),
  ]);

  // A featured slot must reflect the editorial flag. Do not silently promote
  // an ordinary article when no published article is marked featured.
  const featured = featuredMatch[0] ?? null;
  const countRows = await db.select({ total: count(article.id) }).from(article)
    .innerJoin(articleCategory, eq(article.categoryId, articleCategory.id)).where(where);
  const total = Math.max(0, Number(countRows[0]?.total ?? 0) - (featured ? 1 : 0));
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const rows = await db.select(select).from(article)
    .innerJoin(articleCategory, eq(article.categoryId, articleCategory.id)).leftJoin(media, eq(article.socialImageId, media.id))
    .where(featured ? and(where, ne(article.id, featured.id)) : where)
    .orderBy(...order).limit(perPage).offset((page - 1) * perPage);

  return { articles: rows, featured, categories: categoryRows, total, page, totalPages };
}
