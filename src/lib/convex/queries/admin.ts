import { readAdmin } from "@/lib/convex-server";
import { getConfiguredResume } from "@/lib/convex/queries/site";
import { getSiteOriginConfiguration } from "@/lib/site-origin";
import type { ContactSubmissionStatus } from "../mutations/contact";
import type { ConvexRow } from "../types";

type Project = ConvexRow<"project">;
type Article = ConvexRow<"article">;
type Category = ConvexRow<"projectCategory">;
type Technology = ConvexRow<"technology">;
type Media = ConvexRow<"media">;
type ArticleCategory = ConvexRow<"articleCategory">;
type Tag = ConvexRow<"tag">;
type Contact = ConvexRow<"contactSubmission">;
type ProjectRow = Pick<Project, "id" | "title" | "slug" | "status" | "featured" | "updatedAt">;
type ArticleRow = Pick<Article, "id" | "title" | "slug" | "status" | "featured" | "publishedAt" | "updatedAt"> & { category: string };
type DashboardStats = { projects: { total: number; draft: number; published: number; archived: number }; articles: { total: number; draft: number; published: number; archived: number }; pendingComments: number; unreadMessages: number; mediaRecords: number };
type DashboardData = {
  stats: DashboardStats;
  recentProjects: ProjectRow[];
  recentArticles: ArticleRow[];
  recentComments: { id: string; name: string; content: string; status: string; createdAt: Date; articleTitle: string; articleSlug: string }[];
  recentMessages: { id: string; name: string; subject: string; status: string; submittedAt: Date }[];
  categories: { id: string; name: string; total: number }[];
  mediaBytes: number;
  publishing: { key: string; label: string; projects: number; articles: number }[];
  activity: { id: string; kind: "project" | "article" | "comment" | "message"; label: string; status: string; at: Date; href: string }[];
  health: { authentication: boolean; database: boolean; storage: boolean; bucket: string; siteOrigin: boolean; settingsComplete: boolean };
};
type ProjectEditor = {
  categories: Category[];
  technologies: Technology[];
  media: Pick<Media, "id" | "filename" | "url" | "mimeType" | "width" | "height" | "altText">[];
  project: (Project & { categories: string[]; technologies: { technologyId: string; position: number }[]; media: ConvexRow<"projectMedia">[]; sections: (ConvexRow<"projectSection"> & { blocks: Pick<ConvexRow<"projectBlock">, "id" | "type" | "position" | "data">[] })[]; links: ConvexRow<"projectLink">[] }) | null;
};
type ArticleEditor = { categories: ArticleCategory[]; tags: Tag[]; media: Pick<Media, "id" | "filename" | "url" | "mimeType" | "width" | "height" | "altText">[]; article: (Article & { tags: string[]; blocks: ConvexRow<"articleBlock">[] }) | null };
type AdminSettingsData = {
  settings: ConvexRow<"siteSettings"> | null;
  originConfiguration: ReturnType<typeof getSiteOriginConfiguration>;
  contactMethods: ConvexRow<"contactMethod">[];
  resources: ConvexRow<"footerResource">[];
  exploreItems: ConvexRow<"footerExploreItem">[];
  timeline: ConvexRow<"timelineEntry">[];
  faqs: ConvexRow<"faq">[];
  technologies: ConvexRow<"aboutTechnology">[];
  skillCategories: ConvexRow<"skillCategory">[];
  skills: ConvexRow<"skill">[];
  images: Pick<Media, "id" | "filename" | "mimeType" | "url" | "width" | "height" | "fileSizeBytes">[];
  resume: Awaited<ReturnType<typeof getConfiguredResume>>;
  projectCounts: number;
  articleCounts: number;
};

export async function getAdminDashboardStats() {
  return readAdmin<DashboardStats>("dashboardStats");
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const [stats, data] = await Promise.all([getAdminDashboardStats(), readAdmin<Omit<DashboardData, "stats" | "health"> & { settings: ConvexRow<"siteSettings"> | null }>("dashboard")]);
  const settings = data.settings;
  const originConfigured = Boolean(settings?.canonicalOrigin?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim());
  return {
    ...data,
    stats,
    health: {
      authentication: Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD_HASH?.trim() && process.env.AUTH_SECRET?.trim()),
      database: true,
      storage: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL?.trim() && process.env.CONVEX_SERVER_SECRET?.trim()),
      bucket: "Convex Storage",
      siteOrigin: originConfigured,
      settingsComplete: Boolean(settings?.siteName && settings.personName && settings.siteDescription && settings.canonicalOrigin),
    },
  };
}

export async function getAdminMessages(status?: ContactSubmissionStatus, search?: string) {
  return readAdmin<Contact[]>("messages", { status, search });
}

export async function getAdminProjects(options: { status?: string; featured?: boolean; search?: string; sort?: string } = {}) {
  return readAdmin<Project[]>("projects", { options });
}

export async function getAdminProjectEditorData(projectId?: string) {
  return readAdmin<ProjectEditor>("projectEditor", { id: projectId });
}

export async function getAdminArticles(options: { status?: string; featured?: boolean; search?: string; category?: string; tagId?: string; sort?: string } = {}) {
  return readAdmin<(Pick<Article, "id" | "slug" | "title" | "excerpt" | "status" | "featured" | "publishedAt" | "updatedAt"> & { category: string })[]>("articles", { options });
}

export async function getAdminArticleEditorData(articleId?: string) {
  return readAdmin<ArticleEditor>("articleEditor", { id: articleId });
}

export async function getAdminArticleFilters() {
  return readAdmin<{ categories: Pick<ArticleCategory, "id" | "name">[]; tags: Pick<Tag, "id" | "name">[] }>("articleFilters");
}

export async function getAdminProjectTaxonomies() {
  return readAdmin<{ categories: (Category & { usage: number })[]; technologies: (Technology & { usage: number })[] }>("projectTaxonomies");
}

export async function getAdminArticleTaxonomies() {
  return readAdmin<{ categories: (ArticleCategory & { usage: number })[]; tags: (Tag & { usage: number })[] }>("articleTaxonomies");
}

export async function getAdminSettingsData(): Promise<AdminSettingsData> {
  const [data, resume] = await Promise.all([readAdmin<Omit<AdminSettingsData, "resume" | "originConfiguration">>("settings"), getConfiguredResume()]);
  return { ...data, resume, originConfiguration: getSiteOriginConfiguration(data.settings) };
}

export async function getAdminModerationComments(status: "all" | "pending" | "approved" | "rejected" = "pending") {
  return readAdmin<{ id: string; name: string; content: string; status: string; createdAt: Date; title: string; slug: string }[]>("moderationComments", { status });
}

export async function getAdminMediaLibrary() {
  return readAdmin<Media[]>("mediaLibrary");
}

export async function getAdminMediaUsage(id: string) {
  return readAdmin<{ item: Media; usage: { label: string; detail: string; href: string }[] } | null>("mediaUsage", { id });
}
