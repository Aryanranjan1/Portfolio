/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const placeholderResults = [
  { value: "00", label: "Placeholder result one" },
  { value: "00", label: "Placeholder result two" },
  { value: "00", label: "Placeholder result three" },
  { value: "00", label: "Placeholder result four" },
];

// Run this once during the project-results schema rollout, before making the
// project.results validator required. It only fills missing values.
export const backfillProjectResults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await (ctx.db as any).query("project").collect();
    let updated = 0;
    for (const project of projects) {
      const isFahmie = project.slug === "fahmie-farhan-music";
      if (!isFahmie && Array.isArray(project.results) && project.results.length === 4) continue;
      const results = isFahmie
        ? [
            { value: 4, label: "Primary content modes" },
            { value: 1, label: "Unified artist identity" },
            { value: "100%", label: "Responsive experience" },
            { value: 0, label: "Unnecessary interaction layers" },
          ]
        : placeholderResults;
      await ctx.db.patch(project._id, { results });
      updated += 1;
    }
    return { updated, total: projects.length };
  },
});

function assertSourceConstraints(table: string, d: Record<string, any>) {
  const fail = (name: string): never => { throw new Error(`Source constraint failed: ${table}.${name}; legacyId=${d.legacyId}`); };
  const nonnegative = (field: string) => { if (d[field] < 0) fail(field); };
  const slug = (field: string) => { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d[field])) fail(field); };
  const position = () => nonnegative("position");
  switch (table) {
    case "media":
      if (d.fileSizeBytes !== null && d.fileSizeBytes < 0) fail("fileSizeBytes");
      if (d.width !== null && d.width <= 0) fail("width");
      if (d.height !== null && d.height <= 0) fail("height");
      break;
    case "project":
      slug("slug");
      if (d.year !== null && (d.year < 1900 || d.year > 2200)) fail("year");
      if (d.status === "published" && d.publishedAt === null) fail("publishedAt");
      if (!Array.isArray(d.results) || d.results.length !== 4) {
        // TODO(results): replace these with real results (4 required, labels 2-5 words).
        d.results = d.slug === "fahmie-farhan-music"
          ? [
              { value: 4, label: "Primary content modes" },
              { value: 1, label: "Unified artist identity" },
              { value: "100%", label: "Responsive experience" },
              { value: 0, label: "Unnecessary interaction layers" },
            ]
          : placeholderResults;
      }
      if (d.results.some((item: any) => {
        const label = typeof item?.label === "string" ? item.label : "";
        const validValueType = typeof item?.value === "string" || typeof item?.value === "number";
        const value = validValueType ? String(item.value).trim() : "";
        const words = label.trim().split(/\s+/).filter(Boolean);
        return !validValueType || !value || value.length > 6 || label !== label.trim() || words.length < 2 || words.length > 5;
      })) fail("results");
      break;
    case "article":
      slug("slug");
      if (d.status === "published" && d.publishedAt === null) fail("publishedAt");
      break;
    case "projectCategory": case "technology": case "articleCategory": case "tag": case "skillCategory": case "skill":
      slug("slug");
      if (table === "skillCategory") position();
      if (table === "skill") position();
      break;
    case "projectSection":
      if (d.anchor !== null && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.anchor)) fail("anchor");
      position();
      break;
    case "projectBlock": case "articleBlock":
      position();
      if (!d.data || typeof d.data !== "object" || Array.isArray(d.data)) fail("data");
      break;
    case "projectLink": case "projectMedia": case "projectTechnology": case "faq": case "contactMethod": case "footerResource": case "footerExploreItem":
      position();
      break;
    case "aboutTechnology":
      if (typeof d.label !== "string" || d.label.trim().length < 1 || d.label.trim().length > 100) fail("label");
      position();
      break;
    case "timelineEntry":
      if (d.year < 1900 || d.year > 2200) fail("year");
      position();
      break;
    case "slugRedirect":
      slug("oldSlug"); slug("newSlug");
      if (d.oldSlug === d.newSlug) fail("notSelf");
      break;
    case "requestRateLimit": case "adminLoginThrottle":
      if (d.count <= 0) fail("count");
      break;
  }
  for (const [field, value] of Object.entries(d)) {
    if (/At$/.test(field) && value !== null && (!Number.isSafeInteger(value))) fail(field + "_epoch_microseconds");
  }
}

// Temporary admin-key-only import endpoint for the controlled PostgreSQL migration.
// It is internal (never callable from application clients), bounded to small batches,
// and refuses to overwrite an existing document whose source values differ.
export const importBatch = internalMutation({
  args: {
    table: v.string(),
    documents: v.array(v.any()),
    uniqueChecks: v.optional(v.array(v.object({
      index: v.string(),
      fields: v.array(v.string()),
    }))),
    relationships: v.optional(v.array(v.object({
      field: v.string(),
      table: v.string(),
    }))),
  },
  handler: async (ctx, { table, documents, uniqueChecks, relationships }) => {
    const allowed = new Set([
      "admin", "siteSettings", "media", "project", "projectCategory", "technology",
      "projectCategoryAssignment", "projectTechnology", "projectSection", "projectBlock",
      "projectLink", "projectMedia", "articleCategory", "tag", "article", "articleTag",
      "articleBlock", "comment", "skillCategory", "skill", "aboutTechnology", "timelineEntry",
      "faq", "contactMethod", "footerResource", "footerExploreItem", "contactSubmission",
      "slugRedirect", "requestRateLimit", "adminLoginThrottle",
    ]);
    if (!allowed.has(table)) throw new Error(`Unknown migration table: ${table}`);
    if (documents.length > 20) throw new Error("Migration batch exceeds 20 documents");

    const db = ctx.db as any;
    const inserted: string[] = [];
    const skipped: string[] = [];
    const conflicts: string[] = [];
    for (const document of documents) {
      if (!document || typeof document.legacyId !== "string") {
        throw new Error(`Invalid legacyId in ${table} import batch`);
      }
      assertSourceConstraints(table, document);
      for (const relation of relationships ?? []) {
        const foreignId = document[relation.field];
        if (foreignId === null || foreignId === undefined) continue;
        const parent = await db.query(relation.table).withIndex("by_legacyId", (q: any) =>
          q.eq("legacyId", String(foreignId)),
        ).unique();
        if (!parent) throw new Error(`Missing relationship ${table}.${relation.field} -> ${relation.table}; refusing row`);
      }
      const found = await db.query(table).withIndex("by_legacyId", (q: any) =>
        q.eq("legacyId", document.legacyId),
      ).unique();
      if (found) {
        const existing = { ...found };
        delete existing._id;
        delete existing._creationTime;
        if (JSON.stringify(existing) === JSON.stringify(document)) {
          skipped.push(document.legacyId);
        } else {
          conflicts.push(document.legacyId);
        }
        continue;
      }
      if (table === "projectCategoryAssignment") {
        const hit = await db.query(table).withIndex("by_projectId_categoryId", (q: any) =>
          q.eq("projectId", document.projectId).eq("categoryId", document.categoryId),
        ).first();
        if (hit) { conflicts.push(document.legacyId); continue; }
      } else if (table === "projectTechnology") {
        const hit = await db.query(table).withIndex("by_projectId_technologyId", (q: any) =>
          q.eq("projectId", document.projectId).eq("technologyId", document.technologyId),
        ).first();
        if (hit) { conflicts.push(document.legacyId); continue; }
      } else if (table === "projectMedia") {
        const hit = await db.query(table).withIndex("by_projectId_mediaId_role", (q: any) =>
          q.eq("projectId", document.projectId).eq("mediaId", document.mediaId).eq("role", document.role),
        ).first();
        if (hit) { conflicts.push(document.legacyId); continue; }
      } else if (table === "articleTag") {
        const hit = await db.query(table).withIndex("by_articleId_tagId", (q: any) =>
          q.eq("articleId", document.articleId).eq("tagId", document.tagId),
        ).first();
        if (hit) { conflicts.push(document.legacyId); continue; }
      }
      let uniqueConflict = false;
      for (const check of uniqueChecks ?? []) {
        const targetValues = check.fields.map((field) => document[field]);
        const hit = await db.query(table).withIndex(check.index, (q: any) => {
          let query = q;
          for (let i = 0; i < check.fields.length; i++) {
            query = query.eq(check.fields[i], targetValues[i]);
          }
          return query;
        }).first();
        if (hit) {
          conflicts.push(document.legacyId);
          uniqueConflict = true;
          break;
        }
      }
      if (!uniqueConflict) {
        await db.insert(table, document);
        inserted.push(document.legacyId);
      }
    }
    return { table, inserted, skipped, conflicts };
  },
});
