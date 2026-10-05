import assert from "node:assert/strict";
import test from "node:test";

import { getPublicAboutTechnologies } from "./technologies";

test("public About technologies filters inactive items and sorts by position", () => {
  const result = getPublicAboutTechnologies([
    { id: "b", label: "B", position: 2, active: true, logoUrl: "/b.svg" },
    { id: "a", label: "A", position: 1, active: true, logoUrl: null },
    { id: "c", label: "C", position: 0, active: false, logoUrl: "/c.svg" },
  ]);
  assert.deepEqual(result.map(({ label }) => label), ["A", "B"]);
});

test("missing or empty logos safely use the required text label", () => {
  const [item] = getPublicAboutTechnologies([
    { id: "a", label: "TypeScript", position: 0, active: true, logoUrl: "" },
  ]);
  assert.equal(item.label, "TypeScript");
  assert.equal(item.logoUrl, null);
});
