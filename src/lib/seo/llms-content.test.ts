import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicIndexable, isPublishedSlugMatch } from "../../../convex/discoveryHelpers";
import { buildLlmsContent } from "../llms-content";

describe("llms.txt content", () => {
  it("uses current titles and descriptions in markdown links", () => {
    const body = buildLlmsContent({
      siteName: "Aryan Ranjan",
      siteDescription: "Portfolio and writing.",
      projects: [{ slug: "work", title: "Updated project", description: "Updated summary.", canonicalOverride: null }],
      articles: [{ slug: "story", title: "Updated article", description: "Updated excerpt.", canonicalOverride: null }],
    });
    assert.match(body, /\[Updated project\]\(https:\/\/www\.aryanranjan\.dev\/projects\/work\): Updated summary\./);
    assert.match(body, /\[Updated article\]\(https:\/\/www\.aryanranjan\.dev\/blog\/story\): Updated excerpt\./);
    assert.match(body, /Portfolio and writing\./);
  });

  it("uses safe defaults when optional profile fields are empty", () => {
    const body = buildLlmsContent({ siteName: "", siteDescription: " ", projects: [], articles: [] });
    assert.match(body, /^# Portfolio\n\nPersonal portfolio featuring selected projects and articles\./);
  });

  it("accepts only published, indexable content for the llms queries", () => {
    assert.equal(isPublicIndexable({ status: "published", robotsIndex: true }), true);
    assert.equal(isPublicIndexable({ status: "draft", robotsIndex: true }), false);
    assert.equal(isPublicIndexable({ status: "archived", robotsIndex: true }), false);
    assert.equal(isPublicIndexable({ status: "published", robotsIndex: false }), false);
  });

  it("resolves a slug only for the exact published record", () => {
    assert.equal(isPublishedSlugMatch({ slug: "current", status: "published" }, "current"), true);
    assert.equal(isPublishedSlugMatch({ slug: "current", status: "draft" }, "current"), false);
    assert.equal(isPublishedSlugMatch({ slug: "old", status: "published" }, "current"), false);
    assert.equal(isPublishedSlugMatch(null, "current"), false);
  });
});
