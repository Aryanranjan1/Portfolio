import assert from "node:assert/strict";
import test from "node:test";
import { buildBlogIndexData, sortBlogIndexRows, type BlogIndexArticle } from "./blog-index-data";

function article(id: string, title: string, date: string, category = "notes", featured = false): BlogIndexArticle {
  return { id, slug: id, title, excerpt: `${title} excerpt`, featured, publishedAt: new Date(date), category: { name: category, slug: category.toLowerCase() }, image: null };
}

test("blog index preserves date ordering with deterministic id ties", () => {
  const tiedA = article("a", "A", "2026-01-01");
  const tiedB = article("b", "B", "2026-01-01");
  const older = article("c", "C", "2025-01-01");
  assert.deepEqual(sortBlogIndexRows([older, tiedB, tiedA], "newest").map((row) => row.id), ["b", "a", "c"]);
  assert.deepEqual(sortBlogIndexRows([older, tiedB, tiedA], "oldest").map((row) => row.id), ["c", "a", "b"]);
});

test("blog pagination keeps category totals global, filters before paging, and selects featured once", () => {
  const rows = [
    article("featured", "Featured cloud", "2026-06-01", "Cloud", true),
    ...Array.from({ length: 7 }, (_, index) => article(`cloud-${index}`, `Cloud ${index}`, `2026-05-${String(20 - index).padStart(2, "0")}`, "Cloud")),
    article("web", "Web note", "2026-04-01", "Web"),
  ];
  const page = buildBlogIndexData(rows, { q: "cloud", category: "cloud", page: "2" });
  assert.equal(page.featured?.id, "featured");
  assert.equal(page.total, 7);
  assert.equal(page.totalPages, 2);
  assert.equal(page.page, 2);
  assert.equal(page.articles.length, 1);
  assert.deepEqual(page.categories, [{ name: "Cloud", slug: "cloud", total: 8 }, { name: "Web", slug: "web", total: 1 }]);
});
