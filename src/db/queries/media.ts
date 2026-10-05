import { desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema/media";
import { article, articleBlock } from "@/db/schema/articles";
import { project, projectBlock, projectMedia, projectSection, technology } from "@/db/schema/projects";
import { skill } from "@/db/schema/skills";
import { siteSettings } from "@/db/schema/site";
import { aboutTechnology } from "@/db/schema/content";

export async function getMediaLibrary() {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function getMediaById(mediaId: string) {
  const [item] = await db.select({ id: media.id, url: media.url, filename: media.filename, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText }).from(media).where(eq(media.id, mediaId)).limit(1);
  return item ?? null;
}

export async function getMediaUsage(mediaId: string) {
  const [item] = await db.select().from(media).where(eq(media.id, mediaId)).limit(1);
  if (!item) return null;
  if (item.deletionPending) return { item: { ...item, deletionPending: undefined }, usage: [] };
  const [projectAssignments, projectSocial, articleSocial, technologyIcons, skillIcons, aboutTechnologyLogos, defaultImage, projectBlocks, articleBlocks] = await Promise.all([
    db.select({ projectId: project.id, title: project.title, slug: project.slug, role: projectMedia.role }).from(projectMedia).innerJoin(project, eq(projectMedia.projectId, project.id)).where(eq(projectMedia.mediaId, mediaId)),
    db.select({ id: project.id, title: project.title, slug: project.slug }).from(project).where(eq(project.socialImageId, mediaId)),
    db.select({ id: article.id, title: article.title, slug: article.slug }).from(article).where(eq(article.socialImageId, mediaId)),
    db.select({ id: technology.id, name: technology.name }).from(technology).where(eq(technology.iconMediaId, mediaId)),
    db.select({ id: skill.id, name: skill.name }).from(skill).where(eq(skill.iconMediaId, mediaId)),
    db.select({ id: aboutTechnology.id, label: aboutTechnology.label }).from(aboutTechnology).where(eq(aboutTechnology.mediaId, mediaId)),
    db.select({ id: siteSettings.id, siteName: siteSettings.siteName }).from(siteSettings).where(eq(siteSettings.defaultSocialImageId, mediaId)),
    db.select({ id: projectBlock.id, type: projectBlock.type, projectId: project.id, title: project.title, slug: project.slug, data: projectBlock.data }).from(projectBlock).innerJoin(projectSection, eq(projectBlock.projectSectionId, projectSection.id)).innerJoin(project, eq(projectSection.projectId, project.id)).where(or(sql`${projectBlock.data}->>'mediaId' = ${mediaId}`, sql`${projectBlock.data}->'mediaIds' @> ${JSON.stringify([mediaId])}::jsonb`)),
    db.select({ id: articleBlock.id, articleId: article.id, title: article.title, slug: article.slug, data: articleBlock.data }).from(articleBlock).innerJoin(article, eq(articleBlock.articleId, article.id)).where(or(sql`${articleBlock.data}->>'url' = ${item.url}`, sql`${articleBlock.data}->'images' @> ${JSON.stringify([{ url: item.url }])}::jsonb`)),
  ]);
  const blockUsesMedia = (data: Record<string, unknown>) => data.mediaId === mediaId || (Array.isArray(data.mediaIds) && data.mediaIds.includes(mediaId));
  const articleBlockUsesUrl = (data: Record<string, unknown>) => data.url === item.url || (Array.isArray(data.images) && data.images.some((image) => typeof image === "object" && image !== null && "url" in image && image.url === item.url));
  const usage = [
    ...projectAssignments.map((row) => ({ label: `Project · ${row.title}`, detail: `Media assignment · ${row.role}`, href: `/admin/projects/${row.projectId}` })),
    ...projectSocial.map((row) => ({ label: `Project · ${row.title}`, detail: "Social image", href: `/admin/projects/${row.id}` })),
    ...articleSocial.map((row) => ({ label: `Article · ${row.title}`, detail: "Social image", href: `/admin/blogs/${row.id}` })),
    ...technologyIcons.map((row) => ({ label: `Technology · ${row.name}`, detail: "Icon image", href: "/admin/projects" })),
    ...skillIcons.map((row) => ({ label: `Skill · ${row.name}`, detail: "Icon image", href: "/admin/settings" })),
    ...aboutTechnologyLogos.map((row) => ({ label: `About technology · ${row.label}`, detail: "Marquee logo", href: "/admin/settings" })),
    ...defaultImage.map((row) => ({ label: `Site settings · ${row.siteName}`, detail: "Default social image", href: "/admin/settings" })),
    ...projectBlocks.filter((row) => blockUsesMedia(row.data)).map((row) => ({ label: `Project · ${row.title}`, detail: `Content block · ${row.type}`, href: `/admin/projects/${row.projectId}` })),
    ...articleBlocks.filter((row) => articleBlockUsesUrl(row.data)).map((row) => ({ label: `Article · ${row.title}`, detail: "Content block image URL", href: `/admin/blogs/${row.articleId}` })),
  ];
  return { item, usage };
}
