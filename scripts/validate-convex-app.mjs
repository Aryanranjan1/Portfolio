import fs from "node:fs";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

dotenv.config({ path: ".env.local" });
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const secret = process.env.CONVEX_SERVER_SECRET;
if (!url || !secret) throw new Error("Convex application URL or server secret is not configured");

const expectedCounts = {
  media: 86, contactMethod: 4, footerExploreItem: 2, footerResource: 2, siteSettings: 1,
  project: 10, projectBlock: 140, projectCategory: 15, projectCategoryAssignment: 31,
  projectLink: 30, projectMedia: 40, projectSection: 70, projectTechnology: 47, technology: 14,
  article: 33, articleBlock: 312, articleCategory: 11, articleTag: 96, tag: 23, comment: 15,
  skill: 10, skillCategory: 4, aboutTechnology: 10, contactSubmission: 2, faq: 4,
  timelineEntry: 3, admin: 0, adminLoginThrottle: 0, requestRateLimit: 0, slugRedirect: 0,
};

const schema = fs.readFileSync("convex/schema.ts", "utf8");
const tableStarts = [...schema.matchAll(/^  ([A-Za-z][A-Za-z0-9]*): defineTable\(/gm)];
const checks = [];
for (let i = 0; i < tableStarts.length; i++) {
  const start = tableStarts[i].index;
  const end = tableStarts[i + 1]?.index ?? schema.length;
  const table = tableStarts[i][1];
  const body = schema.slice(start, end);
  for (const [, index] of body.matchAll(/\.index\("([^"]+)"/g)) checks.push({ table, index });
}

const client = new ConvexHttpClient(url);
const publicRead = makeFunctionReference("public:read");
const adminRead = makeFunctionReference("admin:read");
const readPublic = (operation, input = {}) => client.query(publicRead, { operation, input });
const readAdmin = (operation, input = {}) => client.query(adminRead, { secret, operation, input });

const [settings, projects, articles, blog, stats, inventory] = await Promise.all([
  readPublic("siteSettings"),
  readPublic("publishedProjects"),
  readPublic("publishedArticles"),
  readPublic("blogIndexData", { page: "1", sort: "newest" }),
  readAdmin("dashboardStats"),
  readAdmin("remoteInventory", { checks }),
]);
const sampleProject = projects[0] ? await readPublic("projectPage", { slug: projects[0].slug }) : null;
const sampleArticle = articles[0] ? await readPublic("articlePage", { slug: articles[0].slug }) : null;
const expectedTotal = Object.values(expectedCounts).reduce((sum, count) => sum + count, 0);
const actualCounts = Object.fromEntries(inventory.tables.map(({ name, count }) => [name, count]));
const tableMatches = Object.entries(expectedCounts).every(([name, count]) => actualCounts[name] === count);
const indexMatches = inventory.indexes.length === checks.length;

const report = {
  deployment: new URL(url).hostname,
  collections: inventory.tables.length,
  collectionsMatch: inventory.tables.length === 30,
  indexesVerified: inventory.indexes.length,
  expectedIndexes: checks.length,
  indexMatch: indexMatches,
  totalDocuments: Object.values(actualCounts).reduce((sum, count) => sum + count, 0),
  expectedDocuments: expectedTotal,
  inventoryCountsMatch: tableMatches,
  siteSettingsPresent: Boolean(settings),
  publishedProjects: projects.length,
  publishedArticles: articles.length,
  blogListShapeValid: Array.isArray(blog.articles) && Array.isArray(blog.categories) && Number.isInteger(blog.totalPages),
  projectDetailShapeValid: !projects.length || Boolean(sampleProject && Array.isArray(sampleProject.sections) && Array.isArray(sampleProject.media)),
  articleDetailShapeValid: !articles.length || Boolean(sampleArticle && Array.isArray(sampleArticle.blocks) && Array.isArray(sampleArticle.tags)),
  adminStats: stats,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.collectionsMatch || !indexMatches || !tableMatches || !report.siteSettingsPresent || !report.blogListShapeValid || !report.projectDetailShapeValid || !report.articleDetailShapeValid) process.exitCode = 1;
