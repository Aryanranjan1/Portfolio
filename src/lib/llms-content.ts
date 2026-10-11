import { getDiscoveryUrl } from "./discovery-origin";

export type LlmsItem = {
  slug: string;
  title: string;
  description: string | null;
  canonicalOverride: string | null;
};

export function buildLlmsContent(input: {
  siteName?: string | null;
  siteDescription?: string | null;
  shortDescription?: string | null;
  projects: LlmsItem[];
  articles: LlmsItem[];
}): string {
  const name = cleanText(input.siteName) || "Portfolio";
  const summary = cleanText(input.siteDescription) || cleanText(input.shortDescription) ||
    "Personal portfolio featuring selected projects and articles.";
  const publicPages = [
    ["Home", "/"], ["About", "/about"], ["Projects", "/projects"], ["Blog", "/blog"],
    ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"],
  ] as const;

  return [
    `# ${name}`,
    "",
    summary,
    "",
    "## Public pages",
    ...publicPages.map(([label, path]) => `- [${label}](${getDiscoveryUrl(path)})`),
    "",
    "## Projects",
    ...input.projects.map((item) => formatItem(item, `/projects/${item.slug}`)),
    "",
    "## Articles",
    ...input.articles.map((item) => formatItem(item, `/blog/${item.slug}`)),
    "",
  ].join("\n");
}

function formatItem(item: LlmsItem, path: string) {
  const title = cleanText(item.title).replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]");
  const description = cleanText(item.description);
  return `- [${title}](${getDiscoveryUrl(path, item.canonicalOverride)})${description ? `: ${description}` : ""}`;
}

function cleanText(value: string | null | undefined) {
  return value?.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim() ?? "";
}
