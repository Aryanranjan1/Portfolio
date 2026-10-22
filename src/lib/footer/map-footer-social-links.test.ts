import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FooterSocialLinks from "../../components/FooterSocialLinks";
import SocialIcon from "../../components/SocialIcon";
import { mapFooterSocialLinks } from "./map-footer-social-links";

const contact = (type: string, url: string, active = true) => ({
  type,
  url,
  value: null,
  active,
});

test("maps supported configured providers and renders their icon data", () => {
  const links = mapFooterSocialLinks([
    contact("threads", "https://www.threads.com/@aryan.systems/"),
    contact("github", "https://github.com/aryan"),
    contact("instagram", "https://www.instagram.com/aryan/"),
    contact("youtube", "https://www.youtube.com/@aryan"),
    contact("x", "https://x.com/aryan"),
    contact("linkedin", "https://www.linkedin.com/in/aryan"),
  ], null);

  assert.deepEqual(links.map(({ type }) => type), ["github", "linkedin", "x", "youtube", "threads", "instagram"]);
  assert.equal(links.find(({ type }) => type === "threads")?.href, "https://www.threads.com/@aryan.systems/");
  assert.match(renderToStaticMarkup(createElement(SocialIcon, { name: "threads" })), /<svg/);
  const markup = renderToStaticMarkup(createElement(FooterSocialLinks, {
    links,
    className: "socials",
    linkClassName: "social-link",
  }));
  assert.match(markup, /href="https:\/\/www\.threads\.com\/@aryan\.systems\/"/);
  assert.match(markup, /aria-label="Threads"/);
  assert.doesNotMatch(markup, /href="undefined"/);
});

test("omits inactive, missing, invalid, and ambiguous provider links", () => {
  const links = mapFooterSocialLinks([
    contact("threads", "https://www.threads.com/@inactive/", false),
    contact("instagram", "", true),
    contact("github", "https://github.com/first"),
    contact("github", "https://github.com/second"),
    contact("other", "https://example.net/profile"),
  ], null);

  assert.deepEqual(links, []);
});

test("uses the primary email fallback when no unique configured email link exists", () => {
  assert.deepEqual(mapFooterSocialLinks([], "aryan@example.net"), [
    { type: "email", href: "mailto:aryan@example.net", label: "Email" },
  ]);
  assert.deepEqual(mapFooterSocialLinks([], "your-email@example.com"), []);
});

test("does not choose between duplicate email records", () => {
  const links = mapFooterSocialLinks([
    contact("email", "mailto:first@example.net"),
    contact("email", "mailto:second@example.net"),
  ], null);
  assert.deepEqual(links, []);
});
