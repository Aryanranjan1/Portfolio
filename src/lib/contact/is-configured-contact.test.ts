import assert from "node:assert/strict";
import test from "node:test";
import { isConfiguredContact } from "./is-configured-contact";

test("configured social methods accept provider profiles and reject unrelated hosts", () => {
  for (const [type, url] of [
    ["threads", "https://www.threads.net/@person"],
    ["threads", "https://www.threads.com/@aryan.systems/"],
    ["instagram", "https://www.instagram.com/person/"],
    ["youtube", "https://www.youtube.com/@person"],
    ["github", "https://github.com/person"],
    ["linkedin", "https://www.linkedin.com/in/person"],
    ["x", "https://x.com/person"],
  ]) {
    assert.equal(isConfiguredContact({ type, value: null, url }), true, `${type} profile should be accepted`);
  }

  for (const type of ["threads", "instagram", "youtube"]) {
    assert.equal(isConfiguredContact({ type, value: null, url: "https://example.org/profile" }), false);
    assert.equal(isConfiguredContact({ type, value: null, url: `https://${type}.com/` }), false);
  }
});

test("Threads accepts profile paths only on HTTPS Threads domains", () => {
  for (const url of [
    "https://threads.com/",
    "https://threads.com/@person/posts/123",
    "https://threads.com/@person/",
    "http://www.threads.com/@person",
    "https://threads.example/@person",
  ]) {
    assert.equal(isConfiguredContact({ type: "threads", value: "@person", url }), url === "https://threads.com/@person/");
  }
});
