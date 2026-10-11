import assert from "node:assert/strict";
import test from "node:test";
import { collectPublicPages } from "./collect-pages";

test("public pagination returns all pages in cursor order", async () => {
  const calls: (string | null)[] = [];
  const rows = await collectPublicPages(async (cursor) => {
    calls.push(cursor);
    if (cursor === null) return { page: [1, 2], continueCursor: "next", isDone: false };
    return { page: [3], continueCursor: "done", isDone: true };
  });
  assert.deepEqual(rows, [1, 2, 3]);
  assert.deepEqual(calls, [null, "next"]);
});

test("public pagination handles empty, partial, boundary-sized, and multi-page collections", async () => {
  for (const count of [0, 99, 100, 101, 200, 201, 350]) {
    const expected = Array.from({ length: count }, (_, index) => index);
    const cursors: (string | null)[] = [];
    const rows = await collectPublicPages(async (cursor) => {
      cursors.push(cursor);
      const offset = cursor === null ? 0 : Number(cursor);
      const page = expected.slice(offset, offset + 100);
      const next = offset + page.length;
      return {
        page,
        continueCursor: String(next),
        isDone: next >= count,
      };
    });

    assert.deepEqual(rows, expected, `collection size ${count}`);
    assert.equal(new Set(rows).size, count, `no duplicates for collection size ${count}`);
    assert.equal(cursors.length, Math.max(1, Math.ceil(count / 100)), `page count for collection size ${count}`);
  }
});

test("public pagination fails rather than returning a partial result on a stalled cursor", async () => {
  await assert.rejects(
    collectPublicPages(async () => ({ page: [1], continueCursor: "same", isDone: false })),
    /Invalid pagination cursor/,
  );
});
