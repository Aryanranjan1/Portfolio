import assert from "node:assert/strict";
import test from "node:test";
import { getMessageDeletionFeedback } from "./message-deletion-feedback";

test("keeps the message on deletion failures and refreshes for an already-missing record", () => {
  assert.deepEqual(getMessageDeletionFeedback({ success: false, error: "INTERNAL_ERROR" }), {
    kind: "failed",
    message: "The message could not be deleted. Please try again.",
    refresh: false,
  });
  assert.deepEqual(getMessageDeletionFeedback({ success: false, error: "NOT_FOUND" }), {
    kind: "failed",
    message: "This message was already deleted.",
    refresh: true,
  });
});

test("distinguishes confirmed deletion with successful or failed cache invalidation", () => {
  assert.deepEqual(getMessageDeletionFeedback({ success: true, data: { cacheInvalidated: true } }), {
    kind: "deleted",
    cacheInvalidated: true,
  });
  assert.deepEqual(getMessageDeletionFeedback({ success: true, data: { cacheInvalidated: false } }), {
    kind: "deleted",
    cacheInvalidated: false,
  });
});
