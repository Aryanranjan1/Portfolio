import assert from "node:assert/strict";
import test from "node:test";
import { isUsableCanonicalOverride, normalizeUsableCanonicalOverride, normalizeUsableSiteOrigin } from "./origin-validation";
import { validateCanonicalUrl } from "../validation";

test("requires HTTPS and rejects HTTP canonical overrides", () => {
  assert.equal(isUsableCanonicalOverride("http://portfolio.dev"), false);
  assert.equal(isUsableCanonicalOverride("https://portfolio.dev"), true);
  assert.equal(normalizeUsableSiteOrigin("http://portfolio.dev"), null);
  assert.throws(() => validateCanonicalUrl("https://[::ffff:7f00:1]"), /VALIDATION_ERROR/);
  assert.equal(validateCanonicalUrl("https://portfolio.dev/articles/post"), "https://portfolio.dev/articles/post");
  assert.equal(normalizeUsableCanonicalOverride("https://portfolio.dev./articles/post"), "https://portfolio.dev/articles/post");
});

test("rejects dotted localhost, placeholders, and private addresses", () => {
  for (const value of ["https://localhost.", "https://localhost..", "https://sub.localhost.", "https://example.com.", "https://example.org", "https://127.0.0.1", "https://[::1]", "https://[::ffff:7f00:1]"]) {
    assert.equal(normalizeUsableSiteOrigin(value), null, value);
    assert.equal(isUsableCanonicalOverride(value), false, value);
  }
});

test("accepts a regular public host and canonicalizes its origin", () => {
  assert.equal(normalizeUsableSiteOrigin("  https://portfolio.dev/path?x=1  "), "https://portfolio.dev");
});
