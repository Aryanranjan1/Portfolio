import assert from "node:assert/strict";
import test from "node:test";
import { validateContactSubmissionId } from "./validate-contact-submission-id";

test("accepts UUIDs and opaque legacy contact submission IDs", () => {
  assert.equal(validateContactSubmissionId("b6d0f34e-c6ec-4db2-9b77-8cd5e50fc784"), "b6d0f34e-c6ec-4db2-9b77-8cd5e50fc784");
  assert.equal(validateContactSubmissionId("01a106be-c5e1-72ee-9acc-7521181bdb7a"), "01a106be-c5e1-72ee-9acc-7521181bdb7a");
  assert.equal(validateContactSubmissionId("01a10280-5c51-7139-8d70-7015bed7a16b"), "01a10280-5c51-7139-8d70-7015bed7a16b");
  assert.equal(validateContactSubmissionId("legacy-contact:42"), "legacy-contact:42");
});

test("rejects empty, oversized, and control-character contact submission IDs", () => {
  for (const value of ["", "   ", "bad\nid", "x".repeat(256), null]) {
    assert.throws(() => validateContactSubmissionId(value), { message: "VALIDATION_ERROR" });
  }
});
