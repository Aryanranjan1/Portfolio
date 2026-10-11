import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getDiscoveryOrigin, getDiscoveryUrl } from "../discovery-origin";

const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => {
  if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
});

describe("public discovery origin", () => {
  it("uses the canonical portfolio host when configuration is absent", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(getDiscoveryOrigin().origin, "https://www.aryanranjan.dev");
  });

  it("does not use an unrelated configured host", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.youtube.com";
    assert.equal(getDiscoveryUrl("/sitemap.xml"), "https://www.aryanranjan.dev/sitemap.xml");
  });

  it("rejects cross-origin canonical overrides", () => {
    assert.equal(
      getDiscoveryUrl("/projects/example", "https://www.youtube.com/watch?v=abc"),
      "https://www.aryanranjan.dev/projects/example",
    );
  });

  it("retains same-origin canonical overrides", () => {
    assert.equal(
      getDiscoveryUrl("/projects/example", "https://www.aryanranjan.dev/featured/example"),
      "https://www.aryanranjan.dev/featured/example",
    );
  });
});
