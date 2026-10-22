/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { query } from "./_generated/server";
import { isPublicIndexable, isPublishedSlugMatch } from "./discoveryHelpers";

type Row = Record<string, any> & { _id: string; legacyId: string };
const tables = [
  "siteSettings", "media", "contactMethod", "footerResource", "footerExploreItem",
  "timelineEntry", "faq", "aboutTechnology", "skillCategory", "skill",
  "project", "projectCategory", "projectCategoryAssignment", "technology",
  "projectTechnology", "projectSection", "projectBlock", "projectLink", "projectMedia",
  "article", "articleCategory", "articleTag", "tag", "articleBlock", "comment", "slugRedirect",
] as const;

function table(ctx: any, name: string) {
  if (!tables.includes(name as (typeof tables)[number])) throw new Error("Unsupported public data table");
  return ctx.db.query(name);
}

async function all(ctx: any, name: string): Promise<Row[]> {
  return table(ctx, name).collect();
}

async function one(ctx: any, name: string, legacyId: string): Promise<Row | null> {
  return table(ctx, name).withIndex("by_legacyId", (q: any) => q.eq("legacyId", legacyId)).unique();
}

async function byIndex(ctx: any, name: string, index: string, field: string, value: unknown): Promise<Row[]> {
  return table(ctx, name).withIndex(index, (q: any) => q.eq(field, value)).collect();
}

async function blogIndexItem(ctx: any, row: Row) {
  const category = await one(ctx, "articleCategory", row.categoryId);
  if (!category) return null;
  const image = row.socialImageId ? await one(ctx, "media", row.socialImageId) : null;
  return {
    id: row.legacyId, slug: row.slug, title: row.title, excerpt: row.excerpt, featured: row.featured,
    publishedAt: row.publishedAt === null ? null : row.publishedAt / 1000,
    category: { name: category.name, slug: category.slug },
    image: image ? { url: image.url, altText: image.altText } : null,
  };
}

function external(row: Row | null | undefined): any {
  if (!row) return null;
  const value = { ...row } as Record<string, any>;
  delete value._id;
  delete value._creationTime;
  delete value.legacyId;
  const result = { ...value, id: row.legacyId } as Record<string, any>;
  for (const [key, item] of Object.entries(result)) {
    if (/At$/.test(key) && typeof item === "number") result[key] = item / 1000;
  }
  return result;
}

const comparePosition = (a: any, b: any) => a.position - b.position || String(a.legacyId).localeCompare(String(b.legacyId));

export const read = query({
  args: { operation: v.string(), input: v.any() },
  handler: async (ctx, { operation, input }): Promise<any> => {
    const settingsRows = async () => byIndex(ctx, "siteSettings", "by_singleton", "singleton", true);
    switch (operation) {
      case "contentPage": {
        const pageSize = Number.isInteger(input.numItems) ? Math.max(1, Math.min(100, input.numItems)) : 100;
        const cursor = typeof input.cursor === "string" ? input.cursor : null;
        let query: any;
        let indexableOnly = false;
        let map: (row: Row) => any | Promise<any> = external;
        switch (input.collection) {
          case "projects":
            query = table(ctx, "project").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).order("desc");
            break;
          case "featuredProjects":
            query = table(ctx, "project").withIndex("by_status_featured_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("featured", true)).order("desc");
            break;
          case "discoverableProjects":
          case "llmsProjects":
            indexableOnly = true;
            query = table(ctx, "project").withIndex("by_status_robotsIndex_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("robotsIndex", true)).order("desc");
            map = input.collection === "discoverableProjects"
              ? (row) => ({ slug: row.slug, title: row.title, updatedAt: row.updatedAt / 1000, canonicalOverride: row.canonicalOverride })
              : (row) => ({ slug: row.slug, title: row.title, description: row.seoDescription?.trim() || row.shortDescription || row.description, canonicalOverride: row.canonicalOverride });
            break;
          case "articles":
            query = table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).order("desc");
            break;
          case "blogArticles":
          case "blogIndex":
            query = table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).order("desc");
            map = (row) => blogIndexItem(ctx, row);
            break;
          case "featuredArticle":
            query = table(ctx, "article").withIndex("by_status_featured_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("featured", true)).order("desc");
            break;
          case "discoverableArticles":
          case "llmsArticles":
            indexableOnly = true;
            query = table(ctx, "article").withIndex("by_status_robotsIndex_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("robotsIndex", true)).order("desc");
            map = input.collection === "discoverableArticles"
              ? (row) => ({ slug: row.slug, title: row.title, updatedAt: row.updatedAt / 1000, canonicalOverride: row.canonicalOverride })
              : (row) => ({ slug: row.slug, title: row.title, description: row.seoDescription?.trim() || row.excerpt, canonicalOverride: row.canonicalOverride });
            break;
          default: throw new Error("Unsupported public content collection");
        }
        const result = await query.paginate({ numItems: pageSize, cursor });
        const rows = indexableOnly ? result.page.filter(isPublicIndexable) : result.page;
        const mapped = await Promise.all(rows.map(map));
        return { ...result, page: mapped.filter((row: any) => row !== null) };
      }
      case "siteSettings": return external((await settingsRows())[0]);
      case "defaultSocialImage": {
        const settings = (await settingsRows())[0];
        const item = settings?.defaultSocialImageId ? await one(ctx, "media", settings.defaultSocialImageId) : null;
        if (!item || !item.mimeType.startsWith("image/")) return null;
        return { id: item.legacyId, url: item.url, filename: item.filename, mimeType: item.mimeType, width: item.width, height: item.height, altText: item.altText };
      }
      case "configuredResume": {
        const settings = (await settingsRows())[0];
        const item = settings?.resumeMediaId ? await one(ctx, "media", settings.resumeMediaId) : null;
        if (!item || item.deletionPending || item.mimeType !== "application/pdf" || !item.filename.toLowerCase().endsWith(".pdf") || !item.storageKey.startsWith("resume/")) return null;
        return external(item);
      }
      case "contactMethods": return Promise.all((await all(ctx, "contactMethod")).filter((r) => r.active).sort(comparePosition).map(async (r) => {
        const iconMedia = r.iconMode === "uploaded" && r.iconMediaId ? await one(ctx, "media", r.iconMediaId) : null;
        return { ...external(r), iconUrl: iconMedia && !iconMedia.deletionPending && iconMedia.mimeType.startsWith("image/") ? iconMedia.url : null };
      }));
      case "footerResources": return (await all(ctx, "footerResource")).filter((r) => r.active).sort(comparePosition).map((r) => ({ id: r.legacyId, label: r.label, url: r.url }));
      case "footerExploreItems": return (await all(ctx, "footerExploreItem")).filter((r) => r.active).sort(comparePosition).map((r) => ({ id: r.legacyId, label: r.label, url: r.url }));
      case "timeline": return (await all(ctx, "timelineEntry")).filter((r) => r.active).sort(comparePosition).map(external);
      case "faqs": return (await all(ctx, "faq")).filter((r) => r.active).sort(comparePosition).map(external);
      case "aboutTechnologies": {
        const rows = (await byIndex(ctx, "aboutTechnology", "by_active_position", "active", true)).sort(comparePosition);
        return Promise.all(rows.map(async (row) => {
          const image = row.mediaId ? await one(ctx, "media", row.mediaId) : null;
          return { id: row.legacyId, label: row.label, position: row.position, active: true, logoUrl: image && !image.deletionPending && image.mimeType.startsWith("image/") ? image.url : null };
        }));
      }
      case "skills": {
        const categories = (await all(ctx, "skillCategory")).sort(comparePosition);
        return Promise.all(categories.map(async (category) => {
          const skills = (await byIndex(ctx, "skill", "by_categoryId_position", "categoryId", category.legacyId)).sort(comparePosition);
          const mapped = await Promise.all(skills.map(async (item) => {
            const icon = item.iconMediaId ? await one(ctx, "media", item.iconMediaId) : null;
            return { id: item.legacyId, categoryId: item.categoryId, name: item.name, slug: item.slug, description: item.description, details: item.details, position: item.position, iconMediaId: item.iconMediaId, icon: icon ? { id: icon.legacyId, url: icon.url, filename: icon.filename, altText: icon.altText, width: icon.width, height: icon.height } : null };
          }));
          return { ...external(category), skills: mapped };
        }));
      }
      case "mediaById": {
        const item = await one(ctx, "media", String(input.id));
        return item && !item.deletionPending && item.mimeType.startsWith("image/") ? { id: item.legacyId, url: item.url, filename: item.filename, mimeType: item.mimeType, width: item.width, height: item.height, altText: item.altText } : null;
      }
      case "commentsByArticleSlug": {
        const article = await table(ctx, "article").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
        if (!article || article.status !== "published") return [];
        return (await table(ctx, "comment").withIndex("by_articleId_status_createdAt_legacyId", (q: any) => q.eq("articleId", article.legacyId).eq("status", "approved")).order("desc").take(20))
          .map((item: Row) => ({ id: item.legacyId, name: item.name, content: item.content, createdAt: item.createdAt / 1000 }));
      }
      case "projectBySlug": {
        const item = await table(ctx, "project").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
        return isPublishedSlugMatch(item, input.slug) ? external(item) : null;
      }
      case "projectRedirect": {
        const redirect = await table(ctx, "slugRedirect").withIndex("by_kind_oldSlug", (q: any) => q.eq("kind", "project").eq("oldSlug", input.slug)).unique();
        const target = redirect ? await one(ctx, "project", redirect.entityId) : null;
        return target && target.slug === redirect?.newSlug && target.status === "published" ? target.slug : null;
      }
      case "projectCategories": {
        const parent = await one(ctx, "project", String(input.id)); if (!parent || parent.status !== "published") return [];
        const assignments = await byIndex(ctx, "projectCategoryAssignment", "by_projectId", "projectId", input.id);
        const categories = await Promise.all(assignments.map((row) => one(ctx, "projectCategory", row.categoryId)));
        return categories.flatMap((item) => item ? [{ id: item.legacyId, name: item.name, slug: item.slug, description: item.description }] : []);
      }
      case "publishedProjectCategoryNames": {
        const projects = await table(ctx, "project").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).collect();
        const assignmentGroups = await Promise.all(projects.map((project: Row) => byIndex(ctx, "projectCategoryAssignment", "by_projectId", "projectId", project.legacyId)));
        const categoryIds = [...new Set(assignmentGroups.flatMap((rows: Row[]) => rows.map((row) => row.categoryId)))];
        const categories = await Promise.all(categoryIds.map((id) => one(ctx, "projectCategory", id)));
        return [...new Set(categories.flatMap((category) => category ? [category.name] : []))].sort().map((name) => ({ name }));
      }
      case "projectTechnologies": {
        const parent = await one(ctx, "project", String(input.id)); if (!parent || parent.status !== "published") return [];
        const relations = await byIndex(ctx, "projectTechnology", "by_projectId_position", "projectId", input.id);
        return (await Promise.all(relations.sort(comparePosition).map((row) => one(ctx, "technology", row.technologyId))))
          .flatMap((item) => item ? [{ id: item.legacyId, name: item.name, slug: item.slug, description: item.description, websiteUrl: item.websiteUrl, iconMediaId: item.iconMediaId }] : []);
      }
      case "projectSections": {
        const parent = await one(ctx, "project", String(input.id)); if (!parent || parent.status !== "published") return [];
        const rows = (await byIndex(ctx, "projectSection", "by_projectId_position", "projectId", input.id)).sort(comparePosition);
        return rows.map(external);
      }
      case "projectBlocks": {
        const section = await one(ctx, "projectSection", String(input.id)); const parent = section ? await one(ctx, "project", section.projectId) : null;
        return parent?.status === "published" ? (await byIndex(ctx, "projectBlock", "by_projectSectionId_position", "projectSectionId", input.id)).sort(comparePosition).map(external) : [];
      }
      case "projectLinks": {
        const parent = await one(ctx, "project", String(input.id));
        return parent?.status === "published" ? (await byIndex(ctx, "projectLink", "by_projectId_position", "projectId", input.id)).sort(comparePosition).map(external) : [];
      }
      case "projectMedia": {
        const parent = await one(ctx, "project", String(input.id)); if (!parent || parent.status !== "published") return [];
        const relations = (await byIndex(ctx, "projectMedia", "by_projectId_position", "projectId", input.id)).sort(comparePosition);
        return (await Promise.all(relations.map(async (r) => {
          const item = await one(ctx, "media", r.mediaId);
          return item ? { projectId: r.projectId, mediaId: r.mediaId, role: r.role, position: r.position, caption: r.caption, altTextOverride: r.altTextOverride, storageKey: item.storageKey, url: item.url, filename: item.filename, mimeType: item.mimeType, width: item.width, height: item.height, altText: item.altText } : null;
        }))).filter((item) => item !== null);
      }
      case "projectPage": {
        const item = await table(ctx, "project").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
        if (!isPublishedSlugMatch(item, input.slug)) return null;
        const [assignments, projectTech, projectSections, links, relations] = await Promise.all([
          byIndex(ctx, "projectCategoryAssignment", "by_projectId", "projectId", item.legacyId),
          byIndex(ctx, "projectTechnology", "by_projectId_position", "projectId", item.legacyId),
          byIndex(ctx, "projectSection", "by_projectId_position", "projectId", item.legacyId),
          byIndex(ctx, "projectLink", "by_projectId_position", "projectId", item.legacyId),
          byIndex(ctx, "projectMedia", "by_projectId_position", "projectId", item.legacyId),
        ]);
        projectSections.sort(comparePosition);
        const [categories, technologies, projectMedia, sectionBlocks] = await Promise.all([
          Promise.all(assignments.map((row) => one(ctx, "projectCategory", row.categoryId))),
          Promise.all(projectTech.sort(comparePosition).map((row) => one(ctx, "technology", row.technologyId))),
          Promise.all(relations.sort(comparePosition).map(async (row) => ({ relation: row, media: await one(ctx, "media", row.mediaId) }))),
          Promise.all(projectSections.map(async (section) => ({ sectionId: section.legacyId, blocks: await byIndex(ctx, "projectBlock", "by_projectSectionId_position", "projectSectionId", section.legacyId) }))),
        ]);
        const categoryById = new Map(categories.filter((row) => row !== null).map((row) => [row!.legacyId, row!]));
        const technologyById = new Map(technologies.filter((row) => row !== null).map((row) => [row!.legacyId, row!]));
        const blockBySection = new Map(sectionBlocks.map(({ sectionId, blocks }) => [sectionId, blocks.sort(comparePosition)]));
        const mappedLinks = links.sort(comparePosition).filter(({ url }) => {
          try { const parsed = new URL(url); return !["example.com", "example.org", "example.net"].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)) && !(parsed.hostname === "github.com" && parsed.pathname.startsWith("/example/")); } catch { return false; }
        });
        return {
          ...external(item),
          categories: assignments.flatMap((r) => { const value = categoryById.get(r.categoryId); return value ? [{ id: value.legacyId, name: value.name, slug: value.slug, description: value.description }] : []; }),
          technologies: projectTech.sort(comparePosition).flatMap((r) => { const value = technologyById.get(r.technologyId); return value ? [{ id: value.legacyId, name: value.name, slug: value.slug, description: value.description, websiteUrl: value.websiteUrl, iconMediaId: value.iconMediaId }] : []; }),
          sections: projectSections.map((section) => ({ ...external(section), blocks: (blockBySection.get(section.legacyId) ?? []).map(external) })),
          links: mappedLinks.map(external),
          media: projectMedia.flatMap(({ relation: r, media: value }) => value ? [{ projectId: r.projectId, mediaId: r.mediaId, role: r.role, position: r.position, caption: r.caption, altTextOverride: r.altTextOverride, storageKey: value.storageKey, url: value.url, filename: value.filename, mimeType: value.mimeType, width: value.width, height: value.height, altText: value.altText }] : []),
        };
      }
      case "projectListingRelationships": {
        const ids = Array.isArray(input.ids) ? [...new Set((input.ids as string[]).slice(0, 50))] : [];
        const values = await Promise.all(ids.map(async (id) => {
          const project = await one(ctx, "project", id);
          if (!project || project.status !== "published") return [id, null] as const;
          const [assignments, techRows, mediaRowsForProject] = await Promise.all([
            byIndex(ctx, "projectCategoryAssignment", "by_projectId", "projectId", id),
            byIndex(ctx, "projectTechnology", "by_projectId_position", "projectId", id),
            byIndex(ctx, "projectMedia", "by_projectId_position", "projectId", id),
          ]);
          const [categories, technologies, projectMedia] = await Promise.all([
            Promise.all(assignments.map((row) => one(ctx, "projectCategory", row.categoryId))),
            Promise.all(techRows.sort(comparePosition).map((row) => one(ctx, "technology", row.technologyId))),
            Promise.all(mediaRowsForProject.sort(comparePosition).map(async (relation) => ({ relation, media: await one(ctx, "media", relation.mediaId) }))),
          ]);
          return [id, {
            categories: categories.flatMap((item) => item ? [{ id: item.legacyId, name: item.name, slug: item.slug, description: item.description }] : []),
            technologies: technologies.flatMap((item) => item ? [{ id: item.legacyId, name: item.name, slug: item.slug, description: item.description, websiteUrl: item.websiteUrl, iconMediaId: item.iconMediaId }] : []),
            media: projectMedia.flatMap(({ relation, media }) => media ? [{ projectId: relation.projectId, mediaId: relation.mediaId, role: relation.role, position: relation.position, caption: relation.caption, altTextOverride: relation.altTextOverride, storageKey: media.storageKey, url: media.url, filename: media.filename, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText }] : []),
          }] as const;
        }));
        return Object.fromEntries(values.filter((entry): entry is Exclude<typeof entry, readonly [string, null]> => entry[1] !== null));
      }
      case "articleRedirect": {
        const redirect = await table(ctx, "slugRedirect").withIndex("by_kind_oldSlug", (q: any) => q.eq("kind", "article").eq("oldSlug", input.slug)).unique();
        const target = redirect ? await one(ctx, "article", redirect.entityId) : null;
        return target && target.slug === redirect?.newSlug && target.status === "published" ? target.slug : null;
      }
      case "articleBySlug": {
        const item = await table(ctx, "article").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
        return isPublishedSlugMatch(item, input.slug) ? external(item) : null;
      }
      case "articleCategory": {
        const parent = await table(ctx, "article").withIndex("by_categoryId_status_publishedAt_legacyId", (q: any) => q.eq("categoryId", input.id).eq("status", "published")).first(); if (!parent) return null;
        const item = await one(ctx, "articleCategory", input.id);
        return item ? { id: item.legacyId, name: item.name, slug: item.slug, description: item.description } : null;
      }
      case "recentArticles": {
        const limit = Number.isInteger(input.limit) ? Math.max(0, Math.min(100, input.limit as number)) : 6;
        const excluded = typeof input.id === "string" ? input.id : null;
        const rows = await table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).order("desc").take(limit + (excluded ? 1 : 0));
        return rows.filter((row: Row) => row.legacyId !== excluded).slice(0, limit).map((row: Row) => ({ id: row.legacyId, slug: row.slug, title: row.title, excerpt: row.excerpt, publishedAt: row.publishedAt === null ? null : row.publishedAt / 1000 }));
      }
      case "previousArticle": case "nextArticle": {
        const currentTime = Number(input.publishedAt);
        const currentId = String(input.id);
        const isPrevious = operation === "previousArticle";
        const tied = await table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => isPrevious
          ? q.eq("status", "published").eq("publishedAt", currentTime * 1000).lt("legacyId", currentId)
          : q.eq("status", "published").eq("publishedAt", currentTime * 1000).gt("legacyId", currentId)).order(isPrevious ? "desc" : "asc").first();
        const row = tied ?? await table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => isPrevious
          ? q.eq("status", "published").lt("publishedAt", currentTime * 1000)
          : q.eq("status", "published").gt("publishedAt", currentTime * 1000)).order(isPrevious ? "desc" : "asc").first();
        return row ? { id: row.legacyId, slug: row.slug, title: row.title } : null;
      }
      case "relatedArticles": {
        const current = await one(ctx, "article", String(input.id));
        if (!current || current.status !== "published") return [];
        const categoryId = String(input.categoryId ?? current.categoryId);
        const rows = await table(ctx, "article").withIndex("by_categoryId_status_publishedAt_legacyId", (q: any) => q.eq("categoryId", categoryId).eq("status", "published")).order("desc").take(4);
        return rows.filter((row: Row) => row.legacyId !== current.legacyId).slice(0, 3).map(external);
      }
      case "articleTags": {
        const parent = await one(ctx, "article", String(input.id)); if (!parent || parent.status !== "published") return [];
        const relations = await byIndex(ctx, "articleTag", "by_articleId", "articleId", input.id);
        return (await Promise.all(relations.map((row) => one(ctx, "tag", row.tagId)))).flatMap((item) => item ? [{ id: item.legacyId, name: item.name, slug: item.slug }] : []);
      }
      case "articleBlocks": {
        const parent = await one(ctx, "article", String(input.id));
        return parent?.status === "published" ? (await byIndex(ctx, "articleBlock", "by_articleId_position", "articleId", input.id)).sort(comparePosition).map(external) : [];
      }
      case "articlePage": {
        const item = await table(ctx, "article").withIndex("by_slug", (q: any) => q.eq("slug", input.slug)).unique();
        if (!isPublishedSlugMatch(item, input.slug)) return null;
        const [category, social, relations, blockRows, recentRows] = await Promise.all([
          one(ctx, "articleCategory", item.categoryId),
          item.socialImageId ? one(ctx, "media", item.socialImageId) : null,
          byIndex(ctx, "articleTag", "by_articleId", "articleId", item.legacyId),
          byIndex(ctx, "articleBlock", "by_articleId_position", "articleId", item.legacyId),
          table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published")).order("desc").take(7),
        ]);
        const [tags, previousSameTime, nextSameTime] = await Promise.all([
          Promise.all(relations.map((row) => one(ctx, "tag", row.tagId))),
          item.publishedAt === null ? null : table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("publishedAt", item.publishedAt).lt("legacyId", item.legacyId)).order("desc").first(),
          item.publishedAt === null ? null : table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published").eq("publishedAt", item.publishedAt).gt("legacyId", item.legacyId)).order("asc").first(),
        ]);
        const previous = item.publishedAt === null ? null : previousSameTime ?? await table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published").lt("publishedAt", item.publishedAt)).order("desc").first();
        const next = item.publishedAt === null ? null : nextSameTime ?? await table(ctx, "article").withIndex("by_status_publishedAt_legacyId", (q: any) => q.eq("status", "published").gt("publishedAt", item.publishedAt)).order("asc").first();
        const relatedRows = category ? await table(ctx, "article").withIndex("by_categoryId_status_publishedAt_legacyId", (q: any) => q.eq("categoryId", category.legacyId).eq("status", "published")).order("desc").take(4) : [];
        const recent = recentRows.filter((row: Row) => row.legacyId !== item.legacyId).slice(0, 6);
        const related = relatedRows.filter((row: Row) => row.legacyId !== item.legacyId).slice(0, 3);
        const toNav = (r: Row | null) => r ? external(r) : null;
        return {
          ...external(item), category: external(category),
          tags: relations.flatMap((r, index) => { const value = tags[index]; return value ? [{ id: value.legacyId, name: value.name, slug: value.slug }] : []; }),
          blocks: blockRows.sort(comparePosition).map(external), socialImage: social ? { url: social.url, altText: social.altText, width: social.width, height: social.height } : null,
          previousArticle: toNav(previous), nextArticle: toNav(next), relatedArticles: related.map(external), recentArticles: recent.map((r: Row) => ({ id: r.legacyId, slug: r.slug, title: r.title, excerpt: r.excerpt, publishedAt: r.publishedAt === null ? null : r.publishedAt / 1000 })),
        };
      }
      default: throw new Error(`Unsupported public read operation: ${operation}`);
    }
  },
});
