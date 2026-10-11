/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";

const names = ["admin", "siteSettings", "media", "project", "projectCategory", "technology", "projectCategoryAssignment", "projectTechnology", "projectSection", "projectBlock", "projectLink", "projectMedia", "articleCategory", "tag", "article", "articleTag", "articleBlock", "comment", "skillCategory", "skill", "aboutTechnology", "timelineEntry", "faq", "contactMethod", "footerResource", "footerExploreItem", "contactSubmission", "slugRedirect", "requestRateLimit", "adminLoginThrottle"] as const;
function dbTable(ctx: any, name: string) { if (!names.includes(name as (typeof names)[number])) throw new Error("Unsupported admin table"); return ctx.db.query(name); }
async function rows(ctx: any, name: string): Promise<any[]> { return dbTable(ctx, name).collect(); }
async function one(ctx: any, name: string, id: string): Promise<any | null> { return dbTable(ctx, name).withIndex("by_legacyId", (q: any) => q.eq("legacyId", id)).unique(); }
function dto(row: any): any {
  if (!row) return null;
  const result = { ...row };
  delete result._id; delete result._creationTime;
  result.id = result.legacyId; delete result.legacyId;
  for (const [key, value] of Object.entries(result)) if (/At$/.test(key) && typeof value === "number") result[key] = value / 1000;
  return result;
}
const position = (a: any, b: any) => a.position - b.position || a.legacyId.localeCompare(b.legacyId);
const newest = (field: string) => (a: any, b: any) => (b[field] ?? 0) - (a[field] ?? 0) || b.legacyId.localeCompare(a.legacyId);
function search(value: unknown) { return typeof value === "string" ? value.trim().slice(0, 120).toLocaleLowerCase() : ""; }

export const read = query({
  args: { secret: v.string(), operation: v.string(), input: v.any() },
  handler: async (ctx, { secret, operation, input }): Promise<any> => {
    if (!process.env.CONVEX_SERVER_SECRET || secret !== process.env.CONVEX_SERVER_SECRET) throw new ConvexError("UNAUTHORIZED");
    switch (operation) {
      case "dashboardStats": {
        const [projects, articles, comments, messages, media] = await Promise.all([rows(ctx, "project"), rows(ctx, "article"), rows(ctx, "comment"), rows(ctx, "contactSubmission"), rows(ctx, "media")]);
        const byStatus = (items: any[]) => ({ total: items.length, draft: items.filter((r) => r.status === "draft").length, published: items.filter((r) => r.status === "published").length, archived: items.filter((r) => r.status === "archived").length });
        return { projects: byStatus(projects), articles: byStatus(articles), pendingComments: comments.filter((r) => r.status === "pending").length, unreadMessages: messages.filter((r) => r.status === "unread").length, mediaRecords: media.length };
      }
      case "remoteInventory": {
        const tables = await Promise.all(names.map(async (name) => ({ name, count: (await rows(ctx, name)).length })));
        const checks = Array.isArray(input.checks) ? input.checks : [];
        const indexes = [];
        for (const check of checks) {
          if (!check || typeof check.table !== "string" || typeof check.index !== "string" || !names.includes(check.table as (typeof names)[number])) throw new ConvexError("INVALID_INDEX_CHECK");
          await dbTable(ctx, check.table).withIndex(check.index).take(1);
          indexes.push({ table: check.table, index: check.index });
        }
        return { tables, indexes };
      }
      case "dashboard": {
        const [projects, articles, comments, messages, categories, media, settings] = await Promise.all([rows(ctx, "project"), rows(ctx, "article"), rows(ctx, "comment"), rows(ctx, "contactSubmission"), rows(ctx, "articleCategory"), rows(ctx, "media"), rows(ctx, "siteSettings")]);
        const categoryById = new Map(categories.map((r) => [r.legacyId, r]));
        const articleRows = articles.slice().sort(newest("updatedAt")).slice(0, 5).map((r) => ({ id: r.legacyId, title: r.title, slug: r.slug, status: r.status, featured: r.featured, publishedAt: r.publishedAt === null ? null : r.publishedAt / 1000, updatedAt: r.updatedAt / 1000, category: categoryById.get(r.categoryId)?.name ?? "" }));
        const projectRows = projects.slice().sort(newest("updatedAt")).slice(0, 5).map((r) => ({ id: r.legacyId, title: r.title, slug: r.slug, status: r.status, featured: r.featured, updatedAt: r.updatedAt / 1000 }));
        const articleById = new Map(articles.map((r) => [r.legacyId, r]));
        const commentRows = comments.slice().sort(newest("createdAt")).slice(0, 5).map((r) => ({ id: r.legacyId, name: r.name, content: r.content, status: r.status, createdAt: r.createdAt / 1000, articleTitle: articleById.get(r.articleId)?.title ?? "", articleSlug: articleById.get(r.articleId)?.slug ?? "" }));
        const messageRows = messages.slice().sort(newest("submittedAt")).slice(0, 5).map((r) => ({ id: r.legacyId, name: r.name, subject: r.subject, status: r.status, submittedAt: r.submittedAt / 1000 }));
        const monthCounts = new Map<string, { key: string; label: string; projects: number; articles: number }>();
        const months = Array.from({ length: 6 }, (_, i) => { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - i)); const key = `${date.getFullYear()}-${date.getMonth()}`; const entry = { key, label: date.toLocaleDateString("en", { month: "short" }), projects: 0, articles: 0 }; monthCounts.set(key, entry); return entry; });
        for (const row of projects.filter((r) => r.status === "published" && r.publishedAt)) { const date = new Date(row.publishedAt / 1000); const bucket = monthCounts.get(`${date.getFullYear()}-${date.getMonth()}`); if (bucket) bucket.projects++; }
        for (const row of articles.filter((r) => r.status === "published" && r.publishedAt)) { const date = new Date(row.publishedAt / 1000); const bucket = monthCounts.get(`${date.getFullYear()}-${date.getMonth()}`); if (bucket) bucket.articles++; }
        const activity = [
          ...projectRows.map((r) => ({ id: r.id, kind: "project" as const, label: r.title, status: r.status, at: new Date(r.updatedAt), href: `/admin/projects/${r.id}` })),
          ...articleRows.map((r) => ({ id: r.id, kind: "article" as const, label: r.title, status: r.status, at: new Date(r.updatedAt), href: `/admin/blogs/${r.id}` })),
          ...commentRows.map((r) => ({ id: r.id, kind: "comment" as const, label: `Comment by ${r.name}`, status: r.status, at: new Date(r.createdAt), href: "/admin/comments" })),
          ...messageRows.map((r) => ({ id: r.id, kind: "message" as const, label: r.subject, status: r.status, at: new Date(r.submittedAt), href: "/admin/messages" })),
        ].sort((a, b) => b.at.getTime() - a.at.getTime() || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)).slice(0, 8).map((r) => ({ ...r, at: r.at.getTime() }));
        return { recentProjects: projectRows, recentArticles: articleRows, recentComments: commentRows, recentMessages: messageRows, categories: [...new Map(articles.filter((r) => r.categoryId).map((r) => [r.categoryId, categoryById.get(r.categoryId)?.name])).entries()].map(([id, name]) => ({ id, name, total: articles.filter((r) => r.categoryId === id).length })).sort((a, b) => b.total - a.total || String(a.name).localeCompare(String(b.name))), mediaBytes: media.reduce((total, r) => total + (r.fileSizeBytes ?? 0), 0), publishing: months, activity, settings: settings[0] ? dto(settings[0]) : null };
      }
      case "messages": {
        const term = search(input.search);
        return (await rows(ctx, "contactSubmission")).filter((r) => (!input.status || r.status === input.status) && (!term || [r.name, r.email, r.subject, r.message].some((v) => String(v).toLocaleLowerCase().includes(term)))).sort(newest("submittedAt")).slice(0, 200).map(dto);
      }
      case "projectSlugById": return (await one(ctx, "project", String(input.id)))?.slug ?? null;
      case "articleSlugById": return (await one(ctx, "article", String(input.id)))?.slug ?? null;
      case "projects": {
        const term = search(input.options?.search); const status = input.options?.status; const sort = input.options?.sort;
        const result = (await rows(ctx, "project")).filter((r) => (!status || !["published", "draft", "archived"].includes(status) || r.status === status) && (!input.options?.featured || r.featured) && (!term || [r.title, r.slug, r.projectType].some((v) => String(v).toLocaleLowerCase().includes(term))));
        result.sort(sort === "created" ? newest("createdAt") : sort === "title" ? (a, b) => a.title.localeCompare(b.title) || a.legacyId.localeCompare(b.legacyId) : newest("updatedAt"));
        return result.slice(0, 200).map(dto);
      }
      case "projectEditor": {
        const [categories, technologies, media] = await Promise.all([rows(ctx, "projectCategory"), rows(ctx, "technology"), rows(ctx, "media")]);
        categories.sort((a, b) => a.name.localeCompare(b.name)); technologies.sort((a, b) => a.name.localeCompare(b.name)); media.sort(newest("createdAt"));
        const mediaRows = media.map(({ legacyId, filename, url, mimeType, width, height, altText }: any) => ({ id: legacyId, filename, url, mimeType, width, height, altText }));
        const current = input.id ? await one(ctx, "project", input.id) : null;
        if (!current) return { categories: categories.map(dto), technologies: technologies.map(dto), media: mediaRows, project: null };
        const [assignments, projectTech, projectMedia, sections, links, blocks] = await Promise.all([rows(ctx, "projectCategoryAssignment"), rows(ctx, "projectTechnology"), rows(ctx, "projectMedia"), rows(ctx, "projectSection"), rows(ctx, "projectLink"), rows(ctx, "projectBlock")]);
        const projectSections = sections.filter((r) => r.projectId === input.id).sort(position);
        return { categories: categories.map(dto), technologies: technologies.map(dto), media: mediaRows, project: { ...dto(current), categories: assignments.filter((r) => r.projectId === input.id).map((r) => r.categoryId), technologies: projectTech.filter((r) => r.projectId === input.id).sort(position).map(({ technologyId, position }: any) => ({ technologyId, position })), media: projectMedia.filter((r) => r.projectId === input.id).sort(position).map(dto), sections: projectSections.map((s) => ({ ...dto(s), blocks: blocks.filter((r) => r.projectSectionId === s.legacyId).sort(position).map(dto) })), links: links.filter((r) => r.projectId === input.id).sort(position).map(dto) } };
      }
      case "articles": {
        const options = input.options ?? {}; const term = search(options.search);
        const tagLinks = await rows(ctx, "articleTag");
        const articleIdsByTag = new Set(tagLinks.filter((r) => r.tagId === options.tagId).map((r) => r.articleId));
        const categories = await rows(ctx, "articleCategory"); const categoryById = new Map(categories.map((r) => [r.legacyId, r]));
        const result = (await rows(ctx, "article")).filter((r) => (!options.status || !["published", "draft", "archived"].includes(options.status) || r.status === options.status) && (!options.featured || r.featured) && (!options.category || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(options.category) || r.categoryId === options.category) && (!options.tagId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(options.tagId) || articleIdsByTag.has(r.legacyId)) && (!term || [r.title, r.slug, r.excerpt].some((v) => String(v).toLocaleLowerCase().includes(term))));
        result.sort(options.sort === "published" ? newest("publishedAt") : options.sort === "title" ? (a, b) => a.title.localeCompare(b.title) || a.legacyId.localeCompare(b.legacyId) : newest("updatedAt"));
        return result.slice(0, 200).map((r) => ({ id: r.legacyId, slug: r.slug, title: r.title, excerpt: r.excerpt, status: r.status, featured: r.featured, publishedAt: r.publishedAt === null ? null : r.publishedAt / 1000, updatedAt: r.updatedAt / 1000, category: categoryById.get(r.categoryId)?.name ?? "" }));
      }
      case "articleEditor": {
        const [categories, tags, media, articles] = await Promise.all([rows(ctx, "articleCategory"), rows(ctx, "tag"), rows(ctx, "media"), rows(ctx, "article")]);
        categories.sort((a, b) => a.name.localeCompare(b.name)); tags.sort((a, b) => a.name.localeCompare(b.name)); media.sort(newest("createdAt"));
        const mediaRows = media.map(({ legacyId, filename, url, mimeType, width, height, altText }: any) => ({ id: legacyId, filename, url, mimeType, width, height, altText }));
        const current = input.id ? articles.find((r) => r.legacyId === input.id) : null;
        if (!current) return { categories: categories.map(dto), tags: tags.map(dto), media: mediaRows, article: null };
        const [tagLinks, blocks] = await Promise.all([rows(ctx, "articleTag"), rows(ctx, "articleBlock")]);
        return { categories: categories.map(dto), tags: tags.map(dto), media: mediaRows, article: { ...dto(current), tags: tagLinks.filter((r) => r.articleId === input.id).map((r) => r.tagId), blocks: blocks.filter((r) => r.articleId === input.id).sort(position).map(dto) } };
      }
      case "articleFilters": {
        const [categories, tags] = await Promise.all([rows(ctx, "articleCategory"), rows(ctx, "tag")]);
        return { categories: categories.sort((a, b) => a.name.localeCompare(b.name)).map(({ legacyId, name }: any) => ({ id: legacyId, name })), tags: tags.sort((a, b) => a.name.localeCompare(b.name)).map(({ legacyId, name }: any) => ({ id: legacyId, name })) };
      }
      case "projectTaxonomies": {
        const [categories, technologies, assignments, projectTech] = await Promise.all([rows(ctx, "projectCategory"), rows(ctx, "technology"), rows(ctx, "projectCategoryAssignment"), rows(ctx, "projectTechnology")]);
        return { categories: categories.sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ ...dto(r), usage: assignments.filter((x) => x.categoryId === r.legacyId).length })), technologies: technologies.sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ ...dto(r), usage: projectTech.filter((x) => x.technologyId === r.legacyId).length })) };
      }
      case "articleTaxonomies": {
        const [categories, tags, articles, relations] = await Promise.all([rows(ctx, "articleCategory"), rows(ctx, "tag"), rows(ctx, "article"), rows(ctx, "articleTag")]);
        return { categories: categories.sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ ...dto(r), usage: articles.filter((x) => x.categoryId === r.legacyId).length })), tags: tags.sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ ...dto(r), usage: relations.filter((x) => x.tagId === r.legacyId).length })) };
      }
      case "settings": {
        const [settings, contacts, resources, explore, timeline, faqs, about, skillCategories, skills, media, projects, articles] = await Promise.all([rows(ctx, "siteSettings"), rows(ctx, "contactMethod"), rows(ctx, "footerResource"), rows(ctx, "footerExploreItem"), rows(ctx, "timelineEntry"), rows(ctx, "faq"), rows(ctx, "aboutTechnology"), rows(ctx, "skillCategory"), rows(ctx, "skill"), rows(ctx, "media"), rows(ctx, "project"), rows(ctx, "article")]);
        const current = settings.find((r) => r.singleton) ?? null;
        return { settings: dto(current), contactMethods: contacts.sort(position).map(dto), resources: resources.sort(position).map(dto), exploreItems: explore.sort(position).map(dto), timeline: timeline.sort(position).map(dto), faqs: faqs.sort(position).map(dto), technologies: about.sort(position).map(dto), skillCategories: skillCategories.sort(position).map(dto), skills: skills.sort(position).map(dto), images: media.filter((r) => r.mimeType.startsWith("image/")).sort((a, b) => a.filename.localeCompare(b.filename)).map(({ legacyId, filename, mimeType, url, width, height, fileSizeBytes }: any) => ({ id: legacyId, filename, mimeType, url, width, height, fileSizeBytes })), projectCounts: projects.filter((r) => r.status === "published" && r.robotsIndex).length, articleCounts: articles.filter((r) => r.status === "published" && r.robotsIndex).length };
      }
      case "siteSettingsForMutation": return dto((await rows(ctx, "siteSettings")).find((r) => r.singleton === true) ?? null);
      case "moderationComments": {
        const [comments, articles] = await Promise.all([rows(ctx, "comment"), rows(ctx, "article")]); const articleById = new Map(articles.map((r) => [r.legacyId, r]));
        return comments.filter((r) => input.status === "all" || r.status === input.status).sort(newest("createdAt")).slice(0, 200).flatMap((r) => { const parent = articleById.get(r.articleId); return parent ? [{ id: r.legacyId, name: r.name, content: r.content, status: r.status, createdAt: r.createdAt / 1000, title: parent.title, slug: parent.slug }] : []; });
      }
      case "mediaLibrary": return (await rows(ctx, "media")).sort(newest("createdAt")).map(dto);
      case "mediaUsage": {
        const item = await one(ctx, "media", input.id); if (!item) return null;
        if (item.deletionPending) { const safe = dto(item); delete safe.deletionPending; return { item: safe, usage: [] }; }
        const [assignments, projects, articles, technologies, skills, about, settings, projectBlocks, sections, articleBlocks] = await Promise.all([rows(ctx, "projectMedia"), rows(ctx, "project"), rows(ctx, "article"), rows(ctx, "technology"), rows(ctx, "skill"), rows(ctx, "aboutTechnology"), rows(ctx, "siteSettings"), rows(ctx, "projectBlock"), rows(ctx, "projectSection"), rows(ctx, "articleBlock")]);
        const projectById = new Map(projects.map((r) => [r.legacyId, r])); const articleById = new Map(articles.map((r) => [r.legacyId, r])); const sectionById = new Map(sections.map((r) => [r.legacyId, r]));
        const usage: any[] = [];
        for (const row of assignments.filter((r) => r.mediaId === item.legacyId)) { const parent = projectById.get(row.projectId); if (parent) usage.push({ label: `Project · ${parent.title}`, detail: `Media assignment · ${row.role}`, href: `/admin/projects/${parent.legacyId}` }); }
        for (const r of projects.filter((r) => r.socialImageId === item.legacyId)) usage.push({ label: `Project · ${r.title}`, detail: "Social image", href: `/admin/projects/${r.legacyId}` });
        for (const r of articles.filter((r) => r.socialImageId === item.legacyId)) usage.push({ label: `Article · ${r.title}`, detail: "Social image", href: `/admin/blogs/${r.legacyId}` });
        for (const r of technologies.filter((r) => r.iconMediaId === item.legacyId)) usage.push({ label: `Technology · ${r.name}`, detail: "Icon image", href: "/admin/projects" });
        for (const r of skills.filter((r) => r.iconMediaId === item.legacyId)) usage.push({ label: `Skill · ${r.name}`, detail: "Icon image", href: "/admin/settings" });
        for (const r of about.filter((r) => r.mediaId === item.legacyId)) usage.push({ label: `About technology · ${r.label}`, detail: "Marquee logo", href: "/admin/settings" });
        for (const r of settings.filter((r) => r.defaultSocialImageId === item.legacyId)) usage.push({ label: `Site settings · ${r.siteName}`, detail: "Default social image", href: "/admin/settings" });
        for (const r of projectBlocks) { const parentSection = sectionById.get(r.projectSectionId); const parent = parentSection ? projectById.get(parentSection.projectId) : null; if (parent && (r.data.mediaId === item.legacyId || (Array.isArray(r.data.mediaIds) && r.data.mediaIds.includes(item.legacyId)))) usage.push({ label: `Project · ${parent.title}`, detail: `Content block · ${r.type}`, href: `/admin/projects/${parent.legacyId}` }); }
        for (const r of articleBlocks) { const parent = articleById.get(r.articleId); const images = Array.isArray(r.data.images) ? r.data.images : []; if (parent && (r.data.url === item.url || images.some((image: any) => image?.url === item.url))) usage.push({ label: `Article · ${parent.title}`, detail: "Content block image URL", href: `/admin/blogs/${parent.legacyId}` }); }
        return { item: dto(item), usage };
      }
      default: throw new Error(`Unsupported admin read operation: ${operation}`);
    }
  },
});
