/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { isProjectBlockType, isValidProjectBlockData } from "../src/lib/validation";
import { getBlockDataErrors } from "../src/lib/blog/block-schema";

const WINDOW_MICROS = 10 * 60 * 1_000_000;
const PROJECT_SECTION_TYPES = ["about", "problem", "solution", "build", "results", "gallery", "whats_next"];
const PROJECT_LINK_TYPES = ["live", "repository", "case_study", "documentation", "demo", "other"];
const PROJECT_MEDIA_ROLES = ["hero", "preview", "problem_gallery", "wireframe", "gallery", "other"];

function assertUnique(values: unknown[]) { if (new Set(values).size !== values.length) throw new ConvexError("VALIDATION_ERROR"); }
function assertPositions(values: unknown[]) {
  if (values.some((v) => !Number.isSafeInteger(v) || (v as number) < 0)) throw new ConvexError("VALIDATION_ERROR");
  assertUnique(values);
}

function convexStorageId(storageKey: string) {
  const match = /^(?:[a-z]+\/)?convex:(.+)$/.exec(storageKey);
  return match?.[1];
}

async function requireLegacy(ctx: any, table: string, id: string) {
  const row = await ctx.db.query(table).withIndex("by_legacyId", (q: any) => q.eq("legacyId", id)).unique();
  if (!row) throw new ConvexError("NOT_FOUND");
  return row;
}

async function replaceProjectChildren(ctx: any, projectId: string, input: any) {
  const [assignments, technologies, media, sections, links] = await Promise.all([
    ctx.db.query("projectCategoryAssignment").withIndex("by_projectId", (q: any) => q.eq("projectId", projectId)).collect(),
    ctx.db.query("projectTechnology").withIndex("by_projectId_position", (q: any) => q.eq("projectId", projectId)).collect(),
    ctx.db.query("projectMedia").withIndex("by_projectId_position", (q: any) => q.eq("projectId", projectId)).collect(),
    ctx.db.query("projectSection").withIndex("by_projectId_position", (q: any) => q.eq("projectId", projectId)).collect(),
    ctx.db.query("projectLink").withIndex("by_projectId_position", (q: any) => q.eq("projectId", projectId)).collect(),
  ]);
  const blocks = (await Promise.all(sections.map((section: any) => ctx.db.query("projectBlock").withIndex("by_projectSectionId_position", (q: any) => q.eq("projectSectionId", section.legacyId)).collect()))).flat();
  for (const row of [...assignments, ...technologies, ...media, ...links, ...blocks, ...sections]) await ctx.db.delete(row._id);
  for (const item of input.categories) await ctx.db.insert("projectCategoryAssignment", { legacyId: `${projectId}:${item.categoryId}`, projectId, categoryId: item.categoryId });
  for (const item of input.technologies) await ctx.db.insert("projectTechnology", { legacyId: `${projectId}:${item.technologyId}`, projectId, technologyId: item.technologyId, position: item.position });
  for (const item of input.media) await ctx.db.insert("projectMedia", { legacyId: `${projectId}:${item.mediaId}:${item.role}`, projectId, mediaId: item.mediaId, role: item.role, position: item.position, caption: item.caption, altTextOverride: item.altTextOverride });
  for (const section of input.sections) {
    const { legacyId: sectionId, blocks: sectionBlocks, ...sectionData } = section;
    await ctx.db.insert("projectSection", { legacyId: sectionId, projectId, ...sectionData });
    for (const block of sectionBlocks) await ctx.db.insert("projectBlock", { legacyId: block.legacyId, projectSectionId: sectionId, type: block.type, position: block.position, data: block.data });
  }
  for (const item of input.links) {
    const { legacyId, ...data } = item;
    await ctx.db.insert("projectLink", { legacyId, projectId, ...data });
  }
}

async function validateProjectInput(ctx: any, input: any, existingId?: string) {
  if (!input || typeof input !== "object" || !Array.isArray(input.categories) || !Array.isArray(input.technologies) || !Array.isArray(input.media) || !Array.isArray(input.sections) || !Array.isArray(input.links)) throw new ConvexError("VALIDATION_ERROR");
  if (typeof input.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || !["draft", "published", "archived"].includes(input.status) || (input.status === "published" && input.publishedAt == null) || (input.year !== null && (input.year < 1900 || input.year > 2200))) throw new ConvexError("VALIDATION_ERROR");
  const duplicateSlug = await ctx.db.query("project").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
  if (duplicateSlug && duplicateSlug.legacyId !== existingId) throw new ConvexError("CONFLICT");
  if (input.socialImageId && !(await ctx.db.query("media").withIndex("by_legacyId", (q: any) => q.eq("legacyId", input.socialImageId)).unique())) throw new ConvexError("NOT_FOUND");
  assertUnique(input.categories.map((r: any) => r.categoryId));
  assertUnique(input.technologies.map((r: any) => r.technologyId));
  assertPositions(input.technologies.map((r: any) => r.position));
  assertUnique(input.media.map((r: any) => r.mediaId));
  assertUnique(input.media.map((r: any) => `${r.mediaId}:${r.role}`));
  assertPositions(input.media.map((r: any) => r.position));
  assertPositions(input.sections.map((r: any) => r.position));
  assertUnique(input.sections.map((r: any) => r.type));
  assertPositions(input.links.map((r: any) => r.position));
  for (const item of input.categories) await requireLegacy(ctx, "projectCategory", item.categoryId);
  for (const item of input.technologies) await requireLegacy(ctx, "technology", item.technologyId);
  for (const item of input.media) {
    if (!PROJECT_MEDIA_ROLES.includes(item.role)) throw new ConvexError("VALIDATION_ERROR");
    await requireLegacy(ctx, "media", item.mediaId);
  }
  for (const section of input.sections) {
    if (!PROJECT_SECTION_TYPES.includes(section.type) || !Array.isArray(section.blocks)) throw new ConvexError("VALIDATION_ERROR");
    assertPositions(section.blocks.map((r: any) => r.position));
    for (const block of section.blocks) {
      if (!isProjectBlockType(block.type) || !isValidProjectBlockData(block.type, block.data)) throw new ConvexError("VALIDATION_ERROR");
      const attached = new Set(input.media.map((r: any) => r.mediaId));
      if (block.type === "image" && !attached.has(block.data.mediaId)) throw new ConvexError("VALIDATION_ERROR");
      if (block.type === "gallery" && block.data.mediaIds.some((id: string) => !attached.has(id))) throw new ConvexError("VALIDATION_ERROR");
    }
  }
  for (const link of input.links) if (!PROJECT_LINK_TYPES.includes(link.type)) throw new ConvexError("VALIDATION_ERROR");
}

async function replaceArticleChildren(ctx: any, articleId: string, input: any) {
  const [tags, blocks] = await Promise.all([
    ctx.db.query("articleTag").withIndex("by_articleId", (q: any) => q.eq("articleId", articleId)).collect(),
    ctx.db.query("articleBlock").withIndex("by_articleId_position", (q: any) => q.eq("articleId", articleId)).collect(),
  ]);
  for (const row of [...tags, ...blocks]) await ctx.db.delete(row._id);
  for (const item of input.tags) await ctx.db.insert("articleTag", { legacyId: `${articleId}:${item.tagId}`, articleId, tagId: item.tagId });
  for (const block of input.blocks) await ctx.db.insert("articleBlock", { legacyId: block.legacyId, articleId, type: block.type, position: block.position, data: block.data });
}

async function validateArticleInput(ctx: any, input: any, existingId?: string) {
  if (!input || typeof input !== "object" || !Array.isArray(input.tags) || !Array.isArray(input.blocks)) throw new ConvexError("VALIDATION_ERROR");
  if (typeof input.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || !["draft", "published", "archived"].includes(input.status) || (input.status === "published" && input.publishedAt == null)) throw new ConvexError("VALIDATION_ERROR");
  const duplicateSlug = await ctx.db.query("article").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
  if (duplicateSlug && duplicateSlug.legacyId !== existingId) throw new ConvexError("CONFLICT");
  await requireLegacy(ctx, "articleCategory", input.categoryId);
  if (input.socialImageId) await requireLegacy(ctx, "media", input.socialImageId);
  assertUnique(input.tags.map((r: any) => r.tagId));
  for (const item of input.tags) await requireLegacy(ctx, "tag", item.tagId);
  assertPositions(input.blocks.map((r: any) => r.position));
  for (const block of input.blocks) {
    if (!block || typeof block.type !== "string" || !block.data || typeof block.data !== "object" || Array.isArray(block.data) || Object.keys(getBlockDataErrors(block.type, block.data)).length) throw new ConvexError("VALIDATION_ERROR");
  }
}

async function recordSlugChange(ctx: any, kind: "project" | "article", entityId: string, oldSlug: string, newSlug: string, now: number) {
  if (!oldSlug || oldSlug === newSlug) return;
  const old = await ctx.db.query("slugRedirect").withIndex("by_kind_oldSlug", (q: any) => q.eq("kind", kind).eq("oldSlug", oldSlug)).unique();
  if (old) await ctx.db.patch(old._id, { entityId, newSlug, createdAt: now });
  else await ctx.db.insert("slugRedirect", { legacyId: `${kind}:${oldSlug}`, kind, entityId, oldSlug, newSlug, createdAt: now });
  const entityRedirects = await ctx.db.query("slugRedirect").withIndex("by_kind_entityId", (q: any) => q.eq("kind", kind).eq("entityId", entityId)).collect();
  for (const row of entityRedirects) if (row.newSlug === oldSlug && row.oldSlug !== newSlug) await ctx.db.patch(row._id, { newSlug, createdAt: now });
}

function authorize(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || secret !== expected) throw new ConvexError("UNAUTHORIZED");
}

export const run = mutation({
  args: { secret: v.string(), operation: v.string(), input: v.any() },
  handler: async (ctx, { secret, operation, input }): Promise<any> => {
    authorize(secret);
    const now = Date.now() * 1000;

    if (operation === "rateLimit") {
      const existing = await ctx.db.query("requestRateLimit").withIndex("by_keyHash", (q) => q.eq("keyHash", input.keyHash)).unique();
      const expiredBefore = now - WINDOW_MICROS;
      const count = !existing || existing.windowStartedAt <= expiredBefore ? 1 : existing.count + 1;
      if (existing) await ctx.db.patch(existing._id, { count, windowStartedAt: count === 1 ? now : existing.windowStartedAt });
      else await ctx.db.insert("requestRateLimit", { legacyId: input.keyHash, keyHash: input.keyHash, count, windowStartedAt: now });

      // Reclaim one expired key per successful request, keeping cleanup bounded
      // and inside the same transaction as the counter update.
      const stale = await ctx.db.query("requestRateLimit").withIndex("by_windowStartedAt", (q) => q.lt("windowStartedAt", now - 24 * WINDOW_MICROS)).first();
      if (stale && stale.legacyId !== input.keyHash) await ctx.db.delete(stale._id);
      const limit = Number.isInteger(input.limit) && input.limit > 0 ? input.limit : 5;
      return count <= limit;
    }

    if (operation === "adminLoginAttempt") {
      const existing = await ctx.db.query("adminLoginThrottle").withIndex("by_scope", (q) => q.eq("scope", "admin")).unique();
      const count = !existing || existing.windowStartedAt <= now - WINDOW_MICROS ? 1 : existing.count + 1;
      if (existing) await ctx.db.patch(existing._id, { count, windowStartedAt: count === 1 ? now : existing.windowStartedAt });
      else await ctx.db.insert("adminLoginThrottle", { legacyId: "admin", scope: "admin", count, windowStartedAt: now });
      return count <= 5;
    }

    if (operation === "adminLoginReset") {
      const existing = await ctx.db.query("adminLoginThrottle").withIndex("by_scope", (q) => q.eq("scope", "admin")).unique();
      if (existing) await ctx.db.delete(existing._id);
      return true;
    }

    if (operation === "submitContact") {
      const { legacyId, name, email, subject, message } = input;
      if (typeof legacyId !== "string" || !legacyId || typeof name !== "string" || typeof email !== "string" || typeof subject !== "string" || typeof message !== "string") throw new ConvexError("VALIDATION_ERROR");
      const normalized = { name: name.trim(), email: email.trim().toLowerCase(), subject: subject.trim(), message: message.trim() };
      if (!normalized.name || normalized.name.length > 100 || !normalized.email || normalized.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || !normalized.subject || normalized.subject.length > 200 || !normalized.message || normalized.message.length > 5000) throw new ConvexError("VALIDATION_ERROR");
      if (await ctx.db.query("contactSubmission").withIndex("by_legacyId", (q) => q.eq("legacyId", legacyId)).unique()) throw new ConvexError("CONFLICT");
      await ctx.db.insert("contactSubmission", { legacyId, ...normalized, status: "unread", submittedAt: now, readAt: null, repliedAt: null, archivedAt: null });
      return { id: legacyId };
    }

    if (operation === "createComment") {
      const { legacyId, slug, name, content } = input;
      if (typeof legacyId !== "string" || typeof slug !== "string" || typeof name !== "string" || typeof content !== "string") throw new ConvexError("VALIDATION_ERROR");
      const article = await ctx.db.query("article").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
      if (!article || article.status !== "published") throw new ConvexError("NOT_FOUND");
      const normalizedName = name.trim();
      const normalizedContent = content.trim();
      if (!normalizedName || normalizedName.length > 100 || !normalizedContent || normalizedContent.length > 5000) throw new ConvexError("VALIDATION_ERROR");
      if (await ctx.db.query("comment").withIndex("by_legacyId", (q) => q.eq("legacyId", legacyId)).unique()) throw new ConvexError("CONFLICT");
      await ctx.db.insert("comment", { legacyId, articleId: article.legacyId, name: normalizedName, content: normalizedContent, status: "pending", createdAt: now, updatedAt: now });
      return { id: legacyId };
    }

    if (operation === "updateContactStatus") {
      const record = await ctx.db.query("contactSubmission").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record) throw new ConvexError("NOT_FOUND");
      if (!["unread", "read", "replied", "archived"].includes(input.status)) throw new ConvexError("VALIDATION_ERROR");
      await ctx.db.patch(record._id, {
        status: input.status,
        ...(input.status === "read" || input.status === "replied" ? { readAt: record.readAt ?? now } : {}),
        ...(input.status === "replied" ? { repliedAt: record.repliedAt ?? now } : {}),
        ...(input.status === "archived" ? { archivedAt: record.archivedAt ?? now } : {}),
      });
      return { id: record.legacyId };
    }

    if (operation === "moderateComment") {
      const record = await ctx.db.query("comment").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record || !["approved", "rejected"].includes(input.status) || record.status === input.status) throw new ConvexError("NOT_FOUND");
      await ctx.db.patch(record._id, { status: input.status, updatedAt: now });
      return (await ctx.db.query("article").withIndex("by_legacyId", (q) => q.eq("legacyId", record.articleId)).unique())?.slug;
    }

    if (operation === "deleteComment") {
      const record = await ctx.db.query("comment").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record) throw new ConvexError("NOT_FOUND");
      await ctx.db.delete(record._id);
      return (await ctx.db.query("article").withIndex("by_legacyId", (q) => q.eq("legacyId", record.articleId)).unique())?.slug;
    }

    if (operation === "generateUploadUrl") {
      return await ctx.storage.generateUploadUrl();
    }

    if (operation === "deleteStorageFile") {
      if (typeof input.storageId !== "string") throw new ConvexError("VALIDATION_ERROR");
      await ctx.storage.delete(input.storageId as any);
      return true;
    }

    if (operation === "createUploadedMedia") {
      const { legacyId, storageId, filename, mimeType, fileSizeBytes, width, height, altText, category } = input;
      if (typeof legacyId !== "string" || typeof storageId !== "string" || typeof filename !== "string" || typeof mimeType !== "string" || !Number.isSafeInteger(fileSizeBytes) || fileSizeBytes <= 0 || (width !== null && (!Number.isSafeInteger(width) || width <= 0)) || (height !== null && (!Number.isSafeInteger(height) || height <= 0)) || !["images", "videos", "documents", "resume", "other"].includes(category)) throw new ConvexError("VALIDATION_ERROR");
      const url = await ctx.storage.getUrl(storageId as any);
      if (!url) throw new ConvexError("STORAGE_UPLOAD_FAILED");
      const storageKey = `${category}/convex:${storageId}`;
      if (await ctx.db.query("media").withIndex("by_storageKey", (q) => q.eq("storageKey", storageKey)).unique()) throw new ConvexError("CONFLICT");
      await ctx.db.insert("media", { legacyId, storageKey, url, filename, mimeType, fileSizeBytes, width, height, altText: typeof altText === "string" && altText ? altText : null, deletionPending: false, createdAt: now, updatedAt: now });
      return { id: legacyId, url, filename, mimeType, fileSizeBytes, width, height };
    }

    if (operation === "createMedia") {
      const record = input.media;
      if (typeof input.legacyId !== "string" || !record || typeof record.storageKey !== "string" || typeof record.url !== "string" || typeof record.filename !== "string" || typeof record.mimeType !== "string") throw new ConvexError("VALIDATION_ERROR");
      if (await ctx.db.query("media").withIndex("by_storageKey", (q) => q.eq("storageKey", record.storageKey)).unique()) throw new ConvexError("CONFLICT");
      const row = { legacyId: input.legacyId, ...record, deletionPending: false, createdAt: now, updatedAt: now };
      await ctx.db.insert("media", row);
      return { id: row.legacyId, ...record, deletionPending: false, createdAt: now, updatedAt: now };
    }

    if (operation === "updateMedia") {
      const record = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record) throw new ConvexError("NOT_FOUND");
      const media = input.media;
      const duplicate = await ctx.db.query("media").withIndex("by_storageKey", (q) => q.eq("storageKey", media.storageKey)).unique();
      if (duplicate && duplicate._id !== record._id) throw new ConvexError("CONFLICT");
      await ctx.db.patch(record._id, { ...media, updatedAt: now });
      return { id: record.legacyId, ...media, deletionPending: record.deletionPending, createdAt: record.createdAt, updatedAt: now };
    }

    if (operation === "updateMediaAltText") {
      const record = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record || record.deletionPending) throw new ConvexError("NOT_FOUND");
      await ctx.db.patch(record._id, { altText: input.altText, updatedAt: now });
      return true;
    }

    if (operation === "deleteMedia") {
      const record = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique();
      if (!record) throw new ConvexError("NOT_FOUND");
      const [projectMedia, projectBlocks, articleBlocks, projects, articles, technologies, skills, about, settings] = await Promise.all([
        ctx.db.query("projectMedia").withIndex("by_mediaId", (q) => q.eq("mediaId", input.id)).collect(),
        ctx.db.query("projectBlock").collect(), ctx.db.query("articleBlock").collect(),
        ctx.db.query("project").withIndex("by_socialImageId", (q) => q.eq("socialImageId", input.id)).collect(),
        ctx.db.query("article").withIndex("by_socialImageId", (q) => q.eq("socialImageId", input.id)).collect(),
        ctx.db.query("technology").withIndex("by_iconMediaId", (q) => q.eq("iconMediaId", input.id)).collect(),
        ctx.db.query("skill").withIndex("by_iconMediaId", (q) => q.eq("iconMediaId", input.id)).collect(),
        ctx.db.query("aboutTechnology").withIndex("by_mediaId", (q) => q.eq("mediaId", input.id)).collect(),
        ctx.db.query("siteSettings").withIndex("by_singleton", (q) => q.eq("singleton", true)).collect(),
      ]);
      for (const row of projectMedia) await ctx.db.delete(row._id);
      for (const row of projectBlocks) if (row.data.mediaId === input.id || (Array.isArray(row.data.mediaIds) && row.data.mediaIds.includes(input.id))) await ctx.db.delete(row._id);
      for (const row of articleBlocks) { const images = Array.isArray(row.data.images) ? row.data.images : []; if (row.data.url === record.url || images.some((image: any) => image?.url === record.url)) await ctx.db.delete(row._id); }
      for (const row of projects) await ctx.db.patch(row._id, { socialImageId: null, updatedAt: now });
      for (const row of articles) await ctx.db.patch(row._id, { socialImageId: null, updatedAt: now });
      for (const row of technologies) await ctx.db.patch(row._id, { iconMediaId: null });
      for (const row of skills) await ctx.db.patch(row._id, { iconMediaId: null });
      for (const row of about) await ctx.db.patch(row._id, { mediaId: null, updatedAt: now });
      for (const row of settings) {
        if (row.defaultSocialImageId === input.id || row.resumeMediaId === input.id) await ctx.db.patch(row._id, { ...(row.defaultSocialImageId === input.id ? { defaultSocialImageId: null } : {}), ...(row.resumeMediaId === input.id ? { resumeMediaId: null } : {}), updatedAt: now });
      }
      const storageId = convexStorageId(record.storageKey);
      if (storageId) await ctx.storage.delete(storageId as any);
      await ctx.db.delete(record._id);
      return true;
    }

    if (["createProject", "updateProject", "setProjectStatus", "deleteProject"].includes(operation)) {
      if (operation === "createProject" || operation === "updateProject") {
        const id = operation === "createProject" ? input.legacyId : input.id;
        const data = input.data;
        const existing = operation === "updateProject" ? await requireLegacy(ctx, "project", id) : null;
        await validateProjectInput(ctx, data, existing?.legacyId);
        if (operation === "createProject" && await ctx.db.query("project").withIndex("by_legacyId", (q) => q.eq("legacyId", id)).unique()) throw new ConvexError("CONFLICT");
        const { categories, technologies, media, sections, links } = data;
        const fields = { ...data };
        for (const key of ["categories", "technologies", "media", "sections", "links", "id"]) delete fields[key];
        const row = { ...fields, legacyId: id, createdAt: existing?.createdAt ?? now, updatedAt: now };
        if (existing) await ctx.db.patch(existing._id, row);
        else await ctx.db.insert("project", row);
        if (existing && existing.status === "published" && row.status === "published") await recordSlugChange(ctx, "project", id, existing.slug, row.slug, now);
        await replaceProjectChildren(ctx, id, { categories, technologies, media, sections, links });
        return { ...row, id };
      }
      if (operation === "setProjectStatus") {
        if (!["draft", "published", "archived"].includes(input.status) || (input.status === "published" && input.publishedAt == null)) throw new ConvexError("VALIDATION_ERROR");
        const existing = await requireLegacy(ctx, "project", input.id);
        await ctx.db.patch(existing._id, { status: input.status, publishedAt: input.publishedAt, updatedAt: now });
        return { ...existing, status: input.status, publishedAt: input.publishedAt, updatedAt: now };
      }
      const existing = await requireLegacy(ctx, "project", input.id);
      const [assignments, technologies, media, sections, links] = await Promise.all([
        ctx.db.query("projectCategoryAssignment").withIndex("by_projectId", (q) => q.eq("projectId", existing.legacyId)).collect(),
        ctx.db.query("projectTechnology").withIndex("by_projectId_position", (q) => q.eq("projectId", existing.legacyId)).collect(),
        ctx.db.query("projectMedia").withIndex("by_projectId_position", (q) => q.eq("projectId", existing.legacyId)).collect(),
        ctx.db.query("projectSection").withIndex("by_projectId_position", (q) => q.eq("projectId", existing.legacyId)).collect(),
        ctx.db.query("projectLink").withIndex("by_projectId_position", (q) => q.eq("projectId", existing.legacyId)).collect(),
      ]);
      const blocks = (await Promise.all(sections.map((section) => ctx.db.query("projectBlock").withIndex("by_projectSectionId_position", (q) => q.eq("projectSectionId", section.legacyId)).collect()))).flat();
      for (const row of [...assignments, ...technologies, ...media, ...links, ...blocks, ...sections]) await ctx.db.delete(row._id);
      await ctx.db.delete(existing._id);
      return { id: existing.legacyId, slug: existing.slug };
    }

    if (["createArticle", "updateArticle", "setArticleStatus", "deleteArticle"].includes(operation)) {
      if (operation === "createArticle" || operation === "updateArticle") {
        const id = operation === "createArticle" ? input.legacyId : input.id;
        const data = input.data;
        const existing = operation === "updateArticle" ? await requireLegacy(ctx, "article", id) : null;
        await validateArticleInput(ctx, data, existing?.legacyId);
        if (operation === "createArticle" && await ctx.db.query("article").withIndex("by_legacyId", (q) => q.eq("legacyId", id)).unique()) throw new ConvexError("CONFLICT");
        const { tags, blocks } = data;
        const fields = { ...data };
        for (const key of ["tags", "blocks", "id"]) delete fields[key];
        const row = { ...fields, legacyId: id, createdAt: existing?.createdAt ?? now, updatedAt: now };
        if (existing) await ctx.db.patch(existing._id, row);
        else await ctx.db.insert("article", row);
        if (existing && existing.status === "published" && row.status === "published") await recordSlugChange(ctx, "article", id, existing.slug, row.slug, now);
        await replaceArticleChildren(ctx, id, { tags, blocks });
        return { ...row, id };
      }
      if (operation === "setArticleStatus") {
        if (!["draft", "published", "archived"].includes(input.status) || (input.status === "published" && input.publishedAt == null)) throw new ConvexError("VALIDATION_ERROR");
        const existing = await requireLegacy(ctx, "article", input.id);
        await ctx.db.patch(existing._id, { status: input.status, publishedAt: input.publishedAt, updatedAt: now });
        return { ...existing, status: input.status, publishedAt: input.publishedAt, updatedAt: now };
      }
      const existing = await requireLegacy(ctx, "article", input.id);
      const [tags, blocks, comments] = await Promise.all([
        ctx.db.query("articleTag").withIndex("by_articleId", (q) => q.eq("articleId", existing.legacyId)).collect(),
        ctx.db.query("articleBlock").withIndex("by_articleId_position", (q) => q.eq("articleId", existing.legacyId)).collect(),
        ctx.db.query("comment").withIndex("by_articleId_status_createdAt_legacyId", (q) => q.eq("articleId", existing.legacyId)).collect(),
      ]);
      for (const row of [...tags, ...blocks, ...comments]) await ctx.db.delete(row._id);
      await ctx.db.delete(existing._id);
      return { id: existing.legacyId, slug: existing.slug };
    }

    if (operation === "simpleCreate" || operation === "simpleUpdate" || operation === "simpleDelete") {
      const table = input.table as string;
      const allowed = new Set(["projectCategory", "technology", "articleCategory", "tag", "aboutTechnology", "contactMethod", "footerResource", "footerExploreItem", "timelineEntry", "faq", "skillCategory", "skill"]);
      if (!allowed.has(table)) throw new ConvexError("VALIDATION_ERROR");
      const existing = operation === "simpleCreate" ? null : await ctx.db.query(table as any).withIndex("by_legacyId", (q: any) => q.eq("legacyId", input.id)).unique();
      if (operation !== "simpleCreate" && !existing) throw new ConvexError("NOT_FOUND");
      if (operation === "simpleDelete") {
        if (table === "projectCategory" && await ctx.db.query("projectCategoryAssignment").withIndex("by_categoryId_projectId", (q) => q.eq("categoryId", input.id)).first()) throw new ConvexError("CONFLICT");
        if (table === "technology" && await ctx.db.query("projectTechnology").withIndex("by_technologyId_projectId", (q) => q.eq("technologyId", input.id)).first()) throw new ConvexError("CONFLICT");
        if (table === "articleCategory" && await ctx.db.query("article").withIndex("by_categoryId", (q) => q.eq("categoryId", input.id)).first()) throw new ConvexError("CONFLICT");
        if (table === "tag" && await ctx.db.query("articleTag").withIndex("by_tagId_articleId", (q) => q.eq("tagId", input.id)).first()) throw new ConvexError("CONFLICT");
        if (table === "skillCategory") for (const row of await ctx.db.query("skill").withIndex("by_categoryId_position", (q) => q.eq("categoryId", input.id)).collect()) await ctx.db.delete(row._id);
        await ctx.db.delete(existing._id);
        return { id: existing.legacyId };
      }
      const data = input.data as Record<string, any>;
      const slugTables = new Set(["projectCategory", "technology", "articleCategory", "tag", "skillCategory", "skill"]);
      if (slugTables.has(table) && (typeof data.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug))) throw new ConvexError("VALIDATION_ERROR");
      if ("position" in data && (!Number.isInteger(data.position) || data.position < 0)) throw new ConvexError("VALIDATION_ERROR");
      if (table === "aboutTechnology" && (typeof data.label !== "string" || data.label.trim().length < 1 || data.label.trim().length > 100)) throw new ConvexError("VALIDATION_ERROR");
      if (table === "timelineEntry" && (!Number.isInteger(data.year) || data.year < 1900 || data.year > 2200)) throw new ConvexError("VALIDATION_ERROR");
      if (table === "technology" && data.iconMediaId) { const ref = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", data.iconMediaId)).unique(); if (!ref) throw new ConvexError("NOT_FOUND"); }
      if (table === "aboutTechnology" && data.mediaId) { const ref = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", data.mediaId)).unique(); if (!ref || ref.deletionPending || !ref.mimeType.startsWith("image/")) throw new ConvexError("MEDIA_NOT_FOUND"); }
      if (table === "skill") {
        const category = await ctx.db.query("skillCategory").withIndex("by_legacyId", (q) => q.eq("legacyId", data.categoryId)).unique();
        if (!category) throw new ConvexError("NOT_FOUND");
        if (data.iconMediaId && !(await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", data.iconMediaId)).unique())) throw new ConvexError("NOT_FOUND");
      }
      const uniqueFields: Record<string, string[][]> = {
        projectCategory: [["name"], ["slug"]], technology: [["name"], ["slug"]], articleCategory: [["name"], ["slug"]], tag: [["name"], ["slug"]],
        contactMethod: [["position"]], timelineEntry: [["position"]], faq: [["position"]],
        skillCategory: [["name"], ["slug"], ["position"]], skill: [["slug"], ["name", "categoryId"], ["categoryId", "position"]],
      };
      for (const fields of uniqueFields[table] ?? []) {
        const index = `by_${fields.join("_")}`;
        const duplicates = await ctx.db.query(table as any).withIndex(index, (q: any) => fields.reduce((range: any, field) => range.eq(field, data[field]), q)).take(2);
        if (duplicates.some((row: any) => row._id !== existing?._id)) throw new ConvexError("CONFLICT");
      }
      if (operation === "simpleCreate") {
        if (typeof input.legacyId !== "string" || await ctx.db.query(table as any).withIndex("by_legacyId", (q: any) => q.eq("legacyId", input.legacyId)).unique()) throw new ConvexError("CONFLICT");
        const value = { legacyId: input.legacyId, ...data, ...(table === "aboutTechnology" ? { createdAt: now, updatedAt: now } : {}) };
        await ctx.db.insert(table as any, value as any);
        return { ...value, id: value.legacyId };
      }
      const value = { ...data, ...(["aboutTechnology"].includes(table) ? { updatedAt: now } : {}) };
      await ctx.db.patch(existing._id, value as any);
      return { ...existing, ...value, id: existing.legacyId };
    }

    if (operation === "simpleReorder") {
      const table = input.table as string;
      if (!["footerResource", "footerExploreItem"].includes(table) || !Array.isArray(input.items)) throw new ConvexError("VALIDATION_ERROR");
      const current = await ctx.db.query(table as any).collect();
      const ids = input.items.map((item: any) => item.id);
      if (ids.length !== current.length || new Set(ids).size !== ids.length || current.some((row: any) => !ids.includes(row.legacyId))) throw new ConvexError("CONFLICT");
      for (const item of input.items) {
        if (!Number.isInteger(item.position) || item.position < 0) throw new ConvexError("VALIDATION_ERROR");
        const row = current.find((r: any) => r.legacyId === item.id);
        await ctx.db.patch(row._id, { position: item.position });
      }
      return true;
    }

    if (operation === "updateSiteSettings" || operation === "setDefaultSocialImage" || operation === "setResumeMediaReference") {
      const settings = (await ctx.db.query("siteSettings").collect()).find((row) => row.singleton === true);
      if (!settings) throw new ConvexError("NOT_FOUND");
      if (operation === "updateSiteSettings") {
        const data = input.data as Record<string, any>;
        if (data.defaultSocialImageId) { const image = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", data.defaultSocialImageId)).unique(); if (!image || !image.mimeType.startsWith("image/")) throw new ConvexError("MEDIA_NOT_FOUND"); }
        await ctx.db.patch(settings._id, { ...data, updatedAt: now });
      } else if (operation === "setDefaultSocialImage") {
        if (input.id) { const image = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique(); if (!image || !image.mimeType.startsWith("image/")) throw new ConvexError("MEDIA_NOT_FOUND"); }
        await ctx.db.patch(settings._id, { defaultSocialImageId: input.id ?? null, updatedAt: now });
      } else {
        const previous = settings.resumeMediaId;
        if (input.id) { const resume = await ctx.db.query("media").withIndex("by_legacyId", (q) => q.eq("legacyId", input.id)).unique(); if (!resume || resume.deletionPending || resume.mimeType !== "application/pdf" || !resume.filename.toLowerCase().endsWith(".pdf") || !resume.storageKey.startsWith("resume/")) throw new ConvexError("MEDIA_NOT_FOUND"); }
        await ctx.db.patch(settings._id, { resumeMediaId: input.id ?? null, updatedAt: now });
        return previous;
      }
      const updated = await ctx.db.get(settings._id);
      return { ...updated, id: settings.legacyId };
    }

    if (operation === "reorderTimelineEntry" || operation === "reorderFaq") {
      const table = operation === "reorderTimelineEntry" ? "timelineEntry" : "faq";
      const all = (await ctx.db.query(table).collect()).sort((a, b) => a.position - b.position || a.legacyId.localeCompare(b.legacyId));
      const currentIndex = all.findIndex((r) => r.legacyId === input.id);
      if (currentIndex < 0) throw new ConvexError("NOT_FOUND");
      if (!Number.isInteger(input.data.position) || input.data.position < 0 || input.data.position >= all.length) throw new ConvexError("VALIDATION_ERROR");
      const ordered = [...all]; const [moving] = ordered.splice(currentIndex, 1); ordered.splice(input.data.position, 0, moving!);
      let updated;
      for (const [position, row] of ordered.entries()) {
        const patch = row.legacyId === input.id ? { ...input.data, position } : { position };
        delete (patch as any).id;
        if (row.legacyId === input.id && table === "timelineEntry") delete (patch as any).position;
        if (row.legacyId === input.id && table === "faq") delete (patch as any).position;
        const finalPatch = row.legacyId === input.id ? { ...patch, position } : patch;
        await ctx.db.patch(row._id, finalPatch as any);
        if (row.legacyId === input.id) updated = { ...row, ...finalPatch };
      }
      if (!updated) throw new ConvexError("INTERNAL_ERROR");
      return { ...updated, id: updated.legacyId };
    }

    throw new Error(`Unsupported application mutation: ${operation}`);
  },
});
