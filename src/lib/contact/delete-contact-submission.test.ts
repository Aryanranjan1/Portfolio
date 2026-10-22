import assert from "node:assert/strict";
import test from "node:test";
import { deleteContactSubmissionAndInvalidate } from "./delete-contact-submission";

test("reports success only after the delete mutation confirms the requested ID", async () => {
  const events: string[] = [];
  const result = await deleteContactSubmissionAndInvalidate(
    "record-1",
    async (id) => { events.push(`delete:${id}`); return { id }; },
    () => { events.push("invalidate"); },
  );

  assert.deepEqual(events, ["delete:record-1", "invalidate"]);
  assert.deepEqual(result, { deleted: { id: "record-1" }, cacheInvalidated: true });
});

test("preserves confirmed deletion when cache invalidation throws", async () => {
  const invalidationError = new Error("revalidation unavailable");
  const result = await deleteContactSubmissionAndInvalidate(
    "record-1",
    async (id) => ({ id }),
    () => { throw invalidationError; },
  );

  assert.equal(result.deleted.id, "record-1");
  assert.equal(result.cacheInvalidated, false);
  assert.equal(result.cacheInvalidationError, invalidationError);
});

test("does not invalidate or report deletion when the mutation fails", async () => {
  let invalidated = false;
  await assert.rejects(
    deleteContactSubmissionAndInvalidate(
      "record-1",
      async () => { throw new Error("NOT_FOUND"); },
      () => { invalidated = true; },
    ),
    { message: "NOT_FOUND" },
  );
  assert.equal(invalidated, false);
});

test("rejects a mutation response for a different record", async () => {
  await assert.rejects(
    deleteContactSubmissionAndInvalidate("record-1", async () => ({ id: "record-2" }), () => {}),
    { message: "DELETE_RESULT_MISMATCH" },
  );
});
