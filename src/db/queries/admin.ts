import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { article, articleBlock, articleCategory, articleTag, tag } from "@/db/schema/articles";
import { comment } from "@/db/schema/comments";
import { contactSubmission } from "@/db/schema/content";
import { contactMethod, footerExploreItem, footerResource, siteSettings } from "@/db/schema/site";
import { faq, timelineEntry } from "@/db/schema/content";
import { aboutTechnology } from "@/db/schema/content";
import { skill, skillCategory } from "@/db/schema/skills";
import type { ContactSubmissionStatus } from "@/db/mutations/contact";
import { media } from "@/db/schema/media";
import { project, projectBlock, projectCategory, projectCategoryAssignment, projectLink, projectMedia, projectSection, projectTechnology, technology } from "@/db/schema/projects";
import { getSiteOriginConfiguration } from "@/lib/site-origin";
import { getConfiguredResume } from "@/db/queries/site";

export async function getAdminDashboardStats() {
  const [
    projects,
    articles,
    pendingComments,
    unreadMessages,
    mediaRecords,
  ] = await Promise.all([
    db.select({ status: project.status, total: count() }).from(project).groupBy(project.status),
    db.select({ status: article.status, total: count() }).from(article).groupBy(article.status),
    db.select({ total: count() }).from(comment).where(eq(comment.status, "pending")),
    db.select({ total: count() }).from(contactSubmission).where(eq(contactSubmission.status, "unread")),
    db.select({ total: count() }).from(media),
  ]);

  const byStatus = (rows: { status: string; total: number }[]) => ({
    total: rows.reduce((sum, row) => sum + row.total, 0),
    draft: rows.find((row) => row.status === "draft")?.total ?? 0,
    published: rows.find((row) => row.status === "published")?.total ?? 0,
    archived: rows.find((row) => row.status === "archived")?.total ?? 0,
  });

  return {
    projects: byStatus(projects),
    articles: byStatus(articles),
    pendingComments: pendingComments[0]?.total ?? 0,
    unreadMessages: unreadMessages[0]?.total ?? 0,
    mediaRecords: mediaRecords[0]?.total ?? 0,
  };
}

export async function getAdminDashboardData() {
  const [
    stats,
    recentProjects,
    recentArticles,
    recentComments,
    recentMessages,
    publishingDates,
    categories,
    mediaSummary,
    settingsData,
    database,
  ] = await Promise.all([
    getAdminDashboardStats(),
    db.select({ id: project.id, title: project.title, slug: project.slug, status: project.status, featured: project.featured, updatedAt: project.updatedAt })
      .from(project).orderBy(desc(project.updatedAt), desc(project.id)).limit(5),
    db.select({ id: article.id, title: article.title, slug: article.slug, status: article.status, featured: article.featured, publishedAt: article.publishedAt, updatedAt: article.updatedAt, category: articleCategory.name })
      .from(article).innerJoin(articleCategory, eq(article.categoryId, articleCategory.id)).orderBy(desc(article.updatedAt), desc(article.id)).limit(5),
    db.select({ id: comment.id, name: comment.name, content: comment.content, status: comment.status, createdAt: comment.createdAt, articleTitle: article.title, articleSlug: article.slug })
      .from(comment).innerJoin(article, eq(comment.articleId, article.id)).orderBy(desc(comment.createdAt), desc(comment.id)).limit(5),
    db.select({ id: contactSubmission.id, name: contactSubmission.name, subject: contactSubmission.subject, status: contactSubmission.status, submittedAt: contactSubmission.submittedAt })
      .from(contactSubmission).orderBy(desc(contactSubmission.submittedAt), desc(contactSubmission.id)).limit(5),
    Promise.all([
      db.select({ publishedAt: project.publishedAt }).from(project).where(eq(project.status, "published")),
      db.select({ publishedAt: article.publishedAt }).from(article).where(eq(article.status, "published")),
    ]),
    db.select({ name: articleCategory.name, total: count() }).from(article).innerJoin(articleCategory, eq(article.categoryId, articleCategory.id)).groupBy(articleCategory.id, articleCategory.name).orderBy(desc(count()), articleCategory.name),
    db.select({ records: count(), bytes: sql<number>`coalesce(sum(${media.fileSizeBytes}), 0)` }).from(media),
    db.select().from(siteSettings).limit(1),
    db.execute(sql`select 1`).then(() => true).catch(() => false),
  ]);

  const activity = [
    ...recentProjects.map((item) => ({ id: item.id, kind: "project" as const, label: item.title, status: item.status, at: item.updatedAt, href: `/admin/projects/${item.id}` })),
    ...recentArticles.map((item) => ({ id: item.id, kind: "article" as const, label: item.title, status: item.status, at: item.updatedAt, href: `/admin/blogs/${item.id}` })),
    ...recentComments.map((item) => ({ id: item.id, kind: "comment" as const, label: `Comment by ${item.name}`, status: item.status, at: item.createdAt, href: "/admin/comments" })),
    ...recentMessages.map((item) => ({ id: item.id, kind: "message" as const, label: item.subject, status: item.status, at: item.submittedAt, href: "/admin/messages" })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime() || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)).slice(0, 8);

  const currentSettings = settingsData[0];
  const originConfigured = Boolean(currentSettings?.canonicalOrigin?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim());
  const mediaConfig = Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("en", { month: "short" }), projects: 0, articles: 0 };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));
  for (const item of publishingDates[0]) if (item.publishedAt) {
    const key = `${item.publishedAt.getFullYear()}-${item.publishedAt.getMonth()}`;
    const month = monthByKey.get(key);
    if (month) month.projects += 1;
  }
  for (const item of publishingDates[1]) if (item.publishedAt) {
    const key = `${item.publishedAt.getFullYear()}-${item.publishedAt.getMonth()}`;
    const month = monthByKey.get(key);
    if (month) month.articles += 1;
  }

  return {
    stats,
    recentProjects,
    recentArticles,
    recentComments,
    recentMessages,
    categories,
    mediaBytes: Number(mediaSummary[0]?.bytes ?? 0),
    publishing: months,
    activity,
    health: {
      authentication: Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD_HASH?.trim() && process.env.AUTH_SECRET?.trim()),
      database,
      storage: mediaConfig,
      bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "portfolio-media",
      siteOrigin: originConfigured,
      settingsComplete: Boolean(currentSettings?.siteName && currentSettings.personName && currentSettings.siteDescription && currentSettings.canonicalOrigin),
    },
  };
}

export async function getAdminMessages(status?: ContactSubmissionStatus, search?: string) {
  const conditions = [];
  if (status) conditions.push(eq(contactSubmission.status, status));
  const term = search?.trim().slice(0, 120);
  if (term) conditions.push(or(ilike(contactSubmission.name, `%${term}%`), ilike(contactSubmission.email, `%${term}%`), ilike(contactSubmission.subject, `%${term}%`), ilike(contactSubmission.message, `%${term}%`))!);
  return db.select().from(contactSubmission).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contactSubmission.submittedAt), desc(contactSubmission.id)).limit(200);
}

export async function getAdminProjects(options: { status?: string; featured?: boolean; search?: string; sort?: string } = {}) {
  const conditions = [];
  if (options.status && ["published", "draft", "archived"].includes(options.status)) conditions.push(eq(project.status, options.status as "published" | "draft" | "archived"));
  if (options.featured) conditions.push(eq(project.featured, true));
  const search = options.search?.trim().slice(0, 120);
  if (search) conditions.push(or(ilike(project.title, `%${search}%`), ilike(project.slug, `%${search}%`), ilike(project.projectType, `%${search}%`))!);
  const ordering = options.sort === "created" ? [desc(project.createdAt), desc(project.id)]
    : options.sort === "title" ? [project.title, project.id]
      : [desc(project.updatedAt), desc(project.id)];
  return db.select().from(project).where(conditions.length ? and(...conditions) : undefined).orderBy(...ordering).limit(200);
}

export async function getAdminProjectEditorData(projectId?: string) {
  const [categories, technologies, mediaRows, current] = await Promise.all([
    db.select().from(projectCategory).orderBy(projectCategory.name),
    db.select().from(technology).orderBy(technology.name),
    db.select({ id: media.id, filename: media.filename, url: media.url, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText }).from(media).orderBy(desc(media.createdAt)),
    projectId ? db.select().from(project).where(eq(project.id, projectId)).limit(1).then((rows) => rows[0] ?? null) : Promise.resolve(null),
  ]);
  if (!projectId || !current) return { categories, technologies, media: mediaRows, project: null };

  const [categoryRows, technologyRows, mediaAssignments, sections, links] = await Promise.all([
    db.select({ categoryId: projectCategoryAssignment.categoryId }).from(projectCategoryAssignment).where(eq(projectCategoryAssignment.projectId, projectId)),
    db.select({ technologyId: projectTechnology.technologyId, position: projectTechnology.position }).from(projectTechnology).where(eq(projectTechnology.projectId, projectId)).orderBy(projectTechnology.position),
    db.select().from(projectMedia).where(eq(projectMedia.projectId, projectId)).orderBy(projectMedia.position),
    db.select().from(projectSection).where(eq(projectSection.projectId, projectId)).orderBy(projectSection.position),
    db.select().from(projectLink).where(eq(projectLink.projectId, projectId)).orderBy(projectLink.position),
  ]);
  const blocks = sections.length ? await db.select({ sectionId: projectBlock.projectSectionId, id: projectBlock.id, type: projectBlock.type, position: projectBlock.position, data: projectBlock.data }).from(projectBlock).where(inArray(projectBlock.projectSectionId, sections.map((section) => section.id))).orderBy(projectBlock.position) : [];
  return {
    categories, technologies, media: mediaRows,
    project: {
      ...current,
      categories: categoryRows.map((row) => row.categoryId),
      technologies: technologyRows,
      media: mediaAssignments,
      sections: sections.map((section) => ({ ...section, blocks: blocks.filter((block) => block.sectionId === section.id).map((block) => ({ id: block.id, type: block.type, position: block.position, data: block.data })) })),
      links,
    },
  };
}

export async function getAdminArticles(options: { status?: string; featured?: boolean; search?: string; category?: string; tagId?: string; sort?: string } = {}) {
  const conditions = [];
  if (options.status && ["published", "draft", "archived"].includes(options.status)) conditions.push(eq(article.status, options.status as "published" | "draft" | "archived"));
  if (options.featured) conditions.push(eq(article.featured, true));
  const uuidFilter = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
  if (uuidFilter(options.category)) conditions.push(eq(article.categoryId, options.category!));
  if (uuidFilter(options.tagId)) conditions.push(inArray(article.id, db.select({ articleId: articleTag.articleId }).from(articleTag).where(eq(articleTag.tagId, options.tagId!))));
  const search = options.search?.trim().slice(0, 120);
  if (search) conditions.push(or(ilike(article.title, `%${search}%`), ilike(article.slug, `%${search}%`), ilike(article.excerpt, `%${search}%`))!);
  const ordering = options.sort === "published" ? [desc(article.publishedAt), desc(article.id)]
    : options.sort === "title" ? [article.title, article.id]
      : [desc(article.updatedAt), desc(article.id)];
  return db.select({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    status: article.status,
    featured: article.featured,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    category: articleCategory.name,
  }).from(article)
    .innerJoin(articleCategory, eq(article.categoryId, articleCategory.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...ordering).limit(200);
}

export async function getAdminArticleEditorData(articleId?: string) {
  const [categories, tags, mediaRows, current] = await Promise.all([
    db.select().from(articleCategory).orderBy(articleCategory.name),
    db.select().from(tag).orderBy(tag.name),
    db.select({ id: media.id, filename: media.filename, url: media.url, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText }).from(media).orderBy(desc(media.createdAt)),
    articleId ? db.select().from(article).where(eq(article.id, articleId)).limit(1).then((rows) => rows[0] ?? null) : Promise.resolve(null),
  ]);
  if (!articleId || !current) return { categories, tags, media: mediaRows, article: null };
  const [tagRows, blocks] = await Promise.all([
    db.select({ tagId: articleTag.tagId }).from(articleTag).where(eq(articleTag.articleId, articleId)),
    db.select().from(articleBlock).where(eq(articleBlock.articleId, articleId)).orderBy(articleBlock.position),
  ]);
  return { categories, tags, media: mediaRows, article: { ...current, tags: tagRows.map((item) => item.tagId), blocks } };
}

export async function getAdminArticleFilters() {
  const [categories, tags] = await Promise.all([
    db.select({ id: articleCategory.id, name: articleCategory.name }).from(articleCategory).orderBy(articleCategory.name),
    db.select({ id: tag.id, name: tag.name }).from(tag).orderBy(tag.name),
  ]);
  return { categories, tags };
}

export async function getAdminProjectTaxonomies() {
  const [categories, technologies] = await Promise.all([
    db.select({ id: projectCategory.id, name: projectCategory.name, slug: projectCategory.slug, description: projectCategory.description, usage: count(projectCategoryAssignment.projectId) })
      .from(projectCategory).leftJoin(projectCategoryAssignment, eq(projectCategoryAssignment.categoryId, projectCategory.id)).groupBy(projectCategory.id).orderBy(projectCategory.name),
    db.select({ id: technology.id, name: technology.name, slug: technology.slug, description: technology.description, websiteUrl: technology.websiteUrl, iconMediaId: technology.iconMediaId, usage: count(projectTechnology.projectId) })
      .from(technology).leftJoin(projectTechnology, eq(projectTechnology.technologyId, technology.id)).groupBy(technology.id).orderBy(technology.name),
  ]);
  return { categories, technologies };
}

export async function getAdminArticleTaxonomies() {
  const [categories, tags] = await Promise.all([
    db.select({ id: articleCategory.id, name: articleCategory.name, slug: articleCategory.slug, description: articleCategory.description, usage: count(article.id) })
      .from(articleCategory).leftJoin(article, eq(article.categoryId, articleCategory.id)).groupBy(articleCategory.id).orderBy(articleCategory.name),
    db.select({ id: tag.id, name: tag.name, slug: tag.slug, usage: count(articleTag.articleId) })
      .from(tag).leftJoin(articleTag, eq(articleTag.tagId, tag.id)).groupBy(tag.id).orderBy(tag.name),
  ]);
  return { categories, tags };
}

export async function getAdminSettingsData() {
  const [settings, contactMethods, resources, exploreItems, timeline, faqs, technologies, skillCategories, skills, images, projectCounts, articleCounts, resume] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    db.select().from(contactMethod).orderBy(contactMethod.position, contactMethod.id),
    db.select().from(footerResource).orderBy(footerResource.position, footerResource.id),
    db.select().from(footerExploreItem).orderBy(footerExploreItem.position, footerExploreItem.id),
    db.select().from(timelineEntry).orderBy(timelineEntry.position),
    db.select().from(faq).orderBy(faq.position),
    db.select().from(aboutTechnology).orderBy(aboutTechnology.position),
    db.select().from(skillCategory).orderBy(skillCategory.position),
    db.select().from(skill).orderBy(skill.position),
    db.select({ id: media.id, filename: media.filename, mimeType: media.mimeType, url: media.url, width: media.width, height: media.height, fileSizeBytes: media.fileSizeBytes }).from(media).where(sql`${media.mimeType} LIKE 'image/%'`).orderBy(media.filename),
    db.select({ total: count() }).from(project).where(and(eq(project.status, "published"), eq(project.robotsIndex, true))),
    db.select({ total: count() }).from(article).where(and(eq(article.status, "published"), eq(article.robotsIndex, true))),
    getConfiguredResume(),
  ]);
  const currentSettings = settings[0] ?? null;
  return { settings: currentSettings, originConfiguration: getSiteOriginConfiguration(currentSettings), contactMethods, resources, exploreItems, timeline, faqs, technologies, skillCategories, skills, images, resume, projectCounts: projectCounts[0]?.total ?? 0, articleCounts: articleCounts[0]?.total ?? 0 };
}
