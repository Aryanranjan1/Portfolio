import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveResumeUrl } from "./resume-state";

test("resume resolution reports unavailable when no valid resume is configured", () => {
  assert.equal(resolveResumeUrl(null), null);
  assert.equal(resolveResumeUrl(undefined), null);
});

test("resume resolution returns the configured storage URL", () => {
  assert.equal(resolveResumeUrl({ url: "https://storage.example/resume/current.pdf" }), "https://storage.example/resume/current.pdf");
});
