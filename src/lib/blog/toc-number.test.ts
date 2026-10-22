import assert from "node:assert/strict";
import test from "node:test";
import { getDiscussionTocNumber } from "./toc-number";

test("Discussion TOC number follows the number of preceding headings", () => {
  assert.equal(getDiscussionTocNumber(0), "01");
  assert.equal(getDiscussionTocNumber(3), "04");
  assert.equal(getDiscussionTocNumber(27), "28");
});
