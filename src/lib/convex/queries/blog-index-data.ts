export type BlogIndexArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured: boolean;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  image: { url: string; altText: string | null } | null;
};

export type BlogIndexData = {
  articles: BlogIndexArticle[];
  featured: BlogIndexArticle | null;
  categories: { name: string; slug: string; total: number }[];
  total: number;
  page: number;
  totalPages: number;
};

export function sortBlogIndexRows(rows: BlogIndexArticle[], sort?: string) {
  const direction = sort === "oldest" ? 1 : -1;
  return [...rows].sort((a, b) => direction * ((a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0) || a.id.localeCompare(b.id)));
}

export function buildBlogIndexData(all: BlogIndexArticle[], params: { q?: string; category?: string; sort?: string; page?: string }): BlogIndexData {
  const query = String(params.q ?? "").trim().slice(0, 120).toLocaleLowerCase();
  const categorySlug = String(params.category ?? "all");
  const categoryTotals = new Map<string, { name: string; slug: string; total: number }>();
  for (const row of all) {
    const category = row.category;
    const value = categoryTotals.get(category.slug) ?? { name: category.name, slug: category.slug, total: 0 };
    value.total++;
    categoryTotals.set(category.slug, value);
  }
  const categories = [...categoryTotals.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const matching = sortBlogIndexRows(all.filter((row) => {
    if (categorySlug !== "all" && row.category.slug !== categorySlug) return false;
    return !query || [row.title, row.excerpt, row.category.name].some((value) => value.toLocaleLowerCase().includes(query));
  }), params.sort);
  const featured = matching.find((row) => row.featured) ?? null;
  const total = Math.max(0, matching.length - (featured ? 1 : 0));
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const requestedPage = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  return { articles: matching.filter((row) => row !== featured).slice((page - 1) * perPage, page * perPage), featured, categories, total, page, totalPages };
}
