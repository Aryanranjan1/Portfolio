import assert from "node:assert/strict";
import test from "node:test";
import {
  aboutContentPlan,
  articleContentPlan,
  articleTaxonomyPlan,
  faqContentPlan,
  footerContentPlan,
  mediaContentPlan,
  projectContentPlan,
  projectTaxonomyPlan,
  runAfterSuccessfulMutation,
  siteContentPlan,
} from "./public-invalidation-plan";

test("project create, publish, edit, slug change, delete invalidate discovery, listings, detail paths and project data", () => {
  assert.deepEqual(projectContentPlan(["old-slug", "new-slug", "old-slug"]), {
    tags: ["public-projects"],
    paths: ["/", "/projects", "/projects/old-slug", "/projects/new-slug", "/sitemap.xml", "/llms.txt"],
  });
});

test("project taxonomy updates refresh listing, detail pages, and project data without changing discovery entries", () => {
  assert.deepEqual(projectTaxonomyPlan(), {
    tags: ["public-projects"],
    paths: ["/", "/projects", "/projects/[slug]"],
  });
});

test("article publishing, editing, slug changes, and deletion refresh blog, details, discovery and all blog-index caches", () => {
  assert.deepEqual(articleContentPlan(["old-post", "new-post"]), {
    tags: ["public-articles", "public-blog-index", "blog-index"],
    paths: ["/", "/blog", "/blog/old-post", "/blog/new-post", "/sitemap.xml", "/llms.txt"],
  });
});

test("article taxonomy and featured changes refresh category counts and filtering", () => {
  assert.deepEqual(articleTaxonomyPlan(), {
    tags: ["public-articles", "public-blog-index", "blog-index"],
    paths: ["/", "/blog", "/blog/[slug]"],
  });
});

test("homepage and site-level changes target the content data and relevant routes", () => {
  assert.deepEqual(aboutContentPlan(), { tags: ["public-about"], paths: ["/", "/about"] });
  assert.deepEqual(faqContentPlan(), { tags: ["public-faq"], paths: ["/", "/contact"] });
  assert.deepEqual(siteContentPlan(), {
    tags: ["public-site", "public-media"],
    paths: ["/sitemap.xml", "/llms.txt"],
    layoutPaths: ["/"],
  });
});

test("footer and media changes invalidate their dependent shell and content caches", () => {
  assert.deepEqual(footerContentPlan(), { tags: ["public-footer"], paths: ["/(public)"] });
  assert.deepEqual(mediaContentPlan(false), { tags: ["public-media"], paths: [] });
  assert.deepEqual(mediaContentPlan(), {
    tags: ["public-media", "public-site", "public-projects", "public-articles", "public-blog-index", "blog-index", "public-about"],
    paths: ["/", "/projects", "/blog", "/about", "/projects/[slug]", "/blog/[slug]"],
  });
});

test("failed CMS writes do not run cache invalidation", async () => {
  let invalidationRan = false;
  await assert.rejects(
    runAfterSuccessfulMutation(async () => { throw new Error("write failed"); }, () => { invalidationRan = true; }),
    /write failed/,
  );
  assert.equal(invalidationRan, false);
});

test("successful CMS writes invalidate using the returned new slug", async () => {
  let invalidated: string[] = [];
  const result = await runAfterSuccessfulMutation(
    async () => ({ slug: "new-project" }),
    (created) => { invalidated = projectContentPlan([created.slug]).paths; },
  );
  assert.equal(result.slug, "new-project");
  assert.ok(invalidated.includes("/projects/new-project"));
  assert.ok(invalidated.includes("/sitemap.xml"));
  assert.ok(invalidated.includes("/llms.txt"));
});
