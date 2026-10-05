import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBlogSearchParams } from "./search-params";

test("normalizes missing, empty, repeated, and malformed query values", () => {
  assert.deepEqual(normalizeBlogSearchParams({}), { q: undefined, category: undefined, sort: undefined, page: undefined });
  assert.deepEqual(normalizeBlogSearchParams({ q: "", category: ["all", "systems"], sort: ["oldest", "newest"], page: ["3", "4"] }), { q: "", category: "all", sort: "oldest", page: "3" });
  assert.equal(normalizeBlogSearchParams({ q: "x".repeat(300) }).q?.length, 200);
  assert.equal(normalizeBlogSearchParams({ q: 42 as never }).q, undefined);
});
