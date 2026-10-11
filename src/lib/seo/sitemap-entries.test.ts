import assert from "node:assert/strict";
import test from "node:test";
import { dedupeSitemapEntries, getSitemapContentUrl } from "./sitemap-entries";

const origin = "https://www.example.dev";

test("sitemap URLs use the configured origin when canonical is missing or invalid", () => {
  assert.equal(getSitemapContentUrl(origin, "/projects/one"), `${origin}/projects/one`);
  assert.equal(getSitemapContentUrl(origin, "/projects/one", null), `${origin}/projects/one`);
  assert.equal(getSitemapContentUrl(origin, "/projects/one", ""), `${origin}/projects/one`);
  assert.equal(getSitemapContentUrl(origin, "/projects/one", "http://example.dev/one"), `${origin}/projects/one`);
  assert.equal(getSitemapContentUrl(origin, "/projects/one", "not a URL"), `${origin}/projects/one`);
});

test("sitemap preserves same-origin canonical URLs and rejects off-origin overrides", () => {
  assert.equal(getSitemapContentUrl(origin, "/projects/one", "https://WWW.example.dev:443/canonical"), `${origin}/canonical`);
  assert.equal(getSitemapContentUrl(origin, "/projects/one", "https://other.example.dev/canonical"), null);
  assert.equal(getSitemapContentUrl("https://example.dev:8443", "/one", "https://example.dev/one"), null);
});

test("sitemap deduplication is stable and keeps the first URL entry", () => {
  const first = { url: `${origin}/projects`, lastModified: "static" };
  const duplicate = { url: `${origin}/projects`, lastModified: "content" };
  const second = { url: `${origin}/projects/one` };
  assert.deepEqual(dedupeSitemapEntries([first, duplicate, second]), [first, second]);
});

test("sitemap deduplication preserves distinct content URLs and static route precedence", () => {
  const staticProjects = { url: `${origin}/projects`, lastModified: "static" };
  const project = { url: `${origin}/projects/example` };
  const article = { url: `${origin}/blog/example` };
  const duplicateProject = { url: `${origin}/projects/example`, lastModified: "duplicate" };

  assert.deepEqual(
    dedupeSitemapEntries([staticProjects, project, article, duplicateProject]),
    [staticProjects, project, article],
  );
});
