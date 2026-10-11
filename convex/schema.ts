import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// legacyId carries the PostgreSQL primary key without conflating it with
// Convex's platform _id. UUIDs and natural keys are preserved verbatim.
const legacyId = v.string();
const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());
// Preserve PostgreSQL timestamptz precision as safe integer epoch microseconds.
// Import code must not round-trip these values through JavaScript Date ms.
const timestamp = v.number();
const nullableTimestamp = v.union(timestamp, v.null());
const contentStatus = v.union(v.literal("draft"), v.literal("published"), v.literal("archived"));
const articleCommentStatus = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));
const contactStatus = v.union(v.literal("unread"), v.literal("read"), v.literal("replied"), v.literal("archived"));
const projectSectionType = v.union(v.literal("about"), v.literal("problem"), v.literal("solution"), v.literal("build"), v.literal("results"), v.literal("gallery"), v.literal("whats_next"));
const projectBlockType = v.union(v.literal("rich_text"), v.literal("quote"), v.literal("image"), v.literal("gallery"), v.literal("problem_list"), v.literal("objective_list"), v.literal("technology_list"), v.literal("process_steps"), v.literal("metrics"), v.literal("roadmap"), v.literal("callout"));
const projectLinkType = v.union(v.literal("live"), v.literal("repository"), v.literal("case_study"), v.literal("documentation"), v.literal("demo"), v.literal("other"));
const projectMediaRole = v.union(v.literal("hero"), v.literal("preview"), v.literal("problem_gallery"), v.literal("wireframe"), v.literal("gallery"), v.literal("other"));
const contactMethodType = v.union(v.literal("email"), v.literal("linkedin"), v.literal("github"), v.literal("x"), v.literal("location"), v.literal("other"));
const articleBlockType = v.union(v.literal("heading"), v.literal("paragraph"), v.literal("image"), v.literal("gallery"), v.literal("video"), v.literal("quote"), v.literal("list"), v.literal("code"), v.literal("table"), v.literal("comparison"), v.literal("callout"), v.literal("tool"), v.literal("embed"));

export default defineSchema({
  admin: defineTable({
    legacyId, singleton: v.literal(true), email: v.string(), displayName: v.string(), active: v.boolean(), createdAt: timestamp, updatedAt: timestamp,
  }).index("by_legacyId", ["legacyId"]).index("by_singleton", ["singleton"]).index("by_email", ["email"]),
  siteSettings: defineTable({
    legacyId, singleton: v.literal(true), siteName: v.string(), personName: v.string(), professionalTitle: v.string(), shortDescription: v.string(), bio: v.string(), location: v.string(), education: nullableString, interests: nullableString, availabilityStatus: v.string(), availabilityText: nullableString, yearsBuilding: v.number(), projectsCompleted: v.number(), leetcodeSolved: v.number(), learningHours: v.number(), primaryEmail: v.string(), siteDescription: v.string(), canonicalOrigin: v.string(), defaultSocialImageId: nullableString, resumeMediaId: nullableString, createdAt: timestamp, updatedAt: timestamp,
  }).index("by_legacyId", ["legacyId"]).index("by_singleton", ["singleton"]),
  media: defineTable({
    legacyId, storageKey: v.string(), url: v.string(), filename: v.string(), mimeType: v.string(), fileSizeBytes: nullableNumber, width: nullableNumber, height: nullableNumber, altText: nullableString, deletionPending: v.boolean(), createdAt: timestamp, updatedAt: timestamp,
  }).index("by_legacyId", ["legacyId"]).index("by_storageKey", ["storageKey"]),

  project: defineTable({
    legacyId, slug: v.string(), title: v.string(), shortDescription: v.string(), description: v.string(), projectType: v.string(), location: nullableString, year: nullableNumber, status: contentStatus, featured: v.boolean(), publishedAt: nullableTimestamp, seoTitle: nullableString, seoDescription: nullableString, canonicalOverride: nullableString, robotsIndex: v.boolean(), robotsFollow: v.boolean(), socialTitle: nullableString, socialDescription: nullableString, socialImageId: nullableString, createdAt: timestamp, updatedAt: timestamp,
  }).index("by_legacyId", ["legacyId"]).index("by_slug", ["slug"]).index("by_socialImageId", ["socialImageId"]).index("by_status_publishedAt", ["status", "publishedAt"]).index("by_status_publishedAt_legacyId", ["status", "publishedAt", "legacyId"]).index("by_status_featured_publishedAt", ["status", "featured", "publishedAt"]).index("by_status_featured_publishedAt_legacyId", ["status", "featured", "publishedAt", "legacyId"]).index("by_status_robotsIndex_publishedAt_legacyId", ["status", "robotsIndex", "publishedAt", "legacyId"]).index("by_status_updatedAt", ["status", "updatedAt"]),
  projectCategory: defineTable({ legacyId, name: v.string(), slug: v.string(), description: nullableString })
    .index("by_legacyId", ["legacyId"]).index("by_name", ["name"]).index("by_slug", ["slug"]),
  technology: defineTable({ legacyId, name: v.string(), slug: v.string(), description: nullableString, websiteUrl: nullableString, iconMediaId: nullableString })
    .index("by_legacyId", ["legacyId"]).index("by_name", ["name"]).index("by_slug", ["slug"]).index("by_iconMediaId", ["iconMediaId"]),
  projectCategoryAssignment: defineTable({ legacyId, projectId: v.string(), categoryId: v.string() })
    .index("by_legacyId", ["legacyId"]).index("by_projectId", ["projectId"]).index("by_projectId_categoryId", ["projectId", "categoryId"]).index("by_categoryId_projectId", ["categoryId", "projectId"]),
  projectTechnology: defineTable({ legacyId, projectId: v.string(), technologyId: v.string(), position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_projectId_position", ["projectId", "position"]).index("by_projectId_technologyId", ["projectId", "technologyId"]).index("by_technologyId_projectId", ["technologyId", "projectId"]),
  projectSection: defineTable({ legacyId, projectId: v.string(), type: projectSectionType, title: nullableString, anchor: nullableString, position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_projectId_position", ["projectId", "position"]).index("by_projectId_type", ["projectId", "type"]),
  projectBlock: defineTable({ legacyId, projectSectionId: v.string(), type: projectBlockType, position: v.number(), data: v.record(v.string(), v.any()) })
    .index("by_legacyId", ["legacyId"]).index("by_projectSectionId_position", ["projectSectionId", "position"]),
  projectLink: defineTable({ legacyId, projectId: v.string(), type: projectLinkType, label: v.string(), url: v.string(), position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_projectId_position", ["projectId", "position"]),
  projectMedia: defineTable({ legacyId, projectId: v.string(), mediaId: v.string(), role: projectMediaRole, position: v.number(), caption: nullableString, altTextOverride: nullableString })
    .index("by_legacyId", ["legacyId"]).index("by_projectId_position", ["projectId", "position"]).index("by_projectId_mediaId_role", ["projectId", "mediaId", "role"]).index("by_mediaId", ["mediaId"]),

  articleCategory: defineTable({ legacyId, name: v.string(), slug: v.string(), description: nullableString })
    .index("by_legacyId", ["legacyId"]).index("by_name", ["name"]).index("by_slug", ["slug"]),
  tag: defineTable({ legacyId, name: v.string(), slug: v.string() })
    .index("by_legacyId", ["legacyId"]).index("by_name", ["name"]).index("by_slug", ["slug"]),
  article: defineTable({
    legacyId, slug: v.string(), title: v.string(), excerpt: v.string(), categoryId: v.string(), status: contentStatus, featured: v.boolean(), publishedAt: nullableTimestamp, seoTitle: nullableString, seoDescription: nullableString, canonicalOverride: nullableString, robotsIndex: v.boolean(), robotsFollow: v.boolean(), socialTitle: nullableString, socialDescription: nullableString, socialImageId: nullableString, createdAt: timestamp, updatedAt: timestamp,
  }).index("by_legacyId", ["legacyId"]).index("by_slug", ["slug"]).index("by_socialImageId", ["socialImageId"]).index("by_status_publishedAt", ["status", "publishedAt"]).index("by_status_publishedAt_legacyId", ["status", "publishedAt", "legacyId"]).index("by_status_featured_publishedAt", ["status", "featured", "publishedAt"]).index("by_status_featured_publishedAt_legacyId", ["status", "featured", "publishedAt", "legacyId"]).index("by_status_robotsIndex_publishedAt_legacyId", ["status", "robotsIndex", "publishedAt", "legacyId"]).index("by_status_updatedAt", ["status", "updatedAt"]).index("by_categoryId", ["categoryId"]).index("by_categoryId_status_publishedAt_legacyId", ["categoryId", "status", "publishedAt", "legacyId"]),
  articleTag: defineTable({ legacyId, articleId: v.string(), tagId: v.string() })
    .index("by_legacyId", ["legacyId"]).index("by_articleId", ["articleId"]).index("by_articleId_tagId", ["articleId", "tagId"]).index("by_tagId_articleId", ["tagId", "articleId"]),
  articleBlock: defineTable({ legacyId, articleId: v.string(), type: articleBlockType, position: v.number(), data: v.record(v.string(), v.any()) })
    .index("by_legacyId", ["legacyId"]).index("by_articleId_position", ["articleId", "position"]),
  comment: defineTable({ legacyId, articleId: v.string(), name: v.string(), content: v.string(), status: articleCommentStatus, createdAt: timestamp, updatedAt: timestamp })
    .index("by_legacyId", ["legacyId"]).index("by_articleId_status_createdAt", ["articleId", "status", "createdAt"]).index("by_articleId_status_createdAt_legacyId", ["articleId", "status", "createdAt", "legacyId"]),

  skillCategory: defineTable({ legacyId, name: v.string(), slug: v.string(), description: nullableString, position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_name", ["name"]).index("by_slug", ["slug"]).index("by_position", ["position"]),
  skill: defineTable({ legacyId, categoryId: v.string(), name: v.string(), slug: v.string(), description: nullableString, details: nullableString, iconMediaId: nullableString, position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_categoryId_position", ["categoryId", "position"]).index("by_slug", ["slug"]).index("by_name_categoryId", ["name", "categoryId"]).index("by_iconMediaId", ["iconMediaId"]),
  aboutTechnology: defineTable({ legacyId, label: v.string(), mediaId: nullableString, position: v.number(), active: v.boolean(), createdAt: timestamp, updatedAt: timestamp })
    .index("by_legacyId", ["legacyId"]).index("by_active_position", ["active", "position"]).index("by_mediaId", ["mediaId"]),
  timelineEntry: defineTable({ legacyId, year: v.number(), title: v.string(), description: v.string(), tag: nullableString, position: v.number(), active: v.boolean() })
    .index("by_legacyId", ["legacyId"]).index("by_position", ["position"]),
  faq: defineTable({ legacyId, question: v.string(), answer: v.string(), position: v.number(), active: v.boolean() })
    .index("by_legacyId", ["legacyId"]).index("by_position", ["position"]),
  contactMethod: defineTable({ legacyId, type: contactMethodType, label: v.string(), value: nullableString, url: nullableString, position: v.number(), active: v.boolean() })
    .index("by_legacyId", ["legacyId"]).index("by_position", ["position"]),
  footerResource: defineTable({ legacyId, label: v.string(), url: v.string(), active: v.boolean(), position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_active_position", ["active", "position"]),
  footerExploreItem: defineTable({ legacyId, label: v.string(), url: v.string(), active: v.boolean(), position: v.number() })
    .index("by_legacyId", ["legacyId"]).index("by_active_position", ["active", "position"]),
  contactSubmission: defineTable({ legacyId, name: v.string(), email: v.string(), subject: v.string(), message: v.string(), status: contactStatus, submittedAt: timestamp, readAt: nullableTimestamp, repliedAt: nullableTimestamp, archivedAt: nullableTimestamp })
    .index("by_legacyId", ["legacyId"]).index("by_status_submittedAt", ["status", "submittedAt"]),
  slugRedirect: defineTable({ legacyId, kind: v.union(v.literal("project"), v.literal("article")), entityId: v.string(), oldSlug: v.string(), newSlug: v.string(), createdAt: timestamp })
    .index("by_legacyId", ["legacyId"]).index("by_kind_oldSlug", ["kind", "oldSlug"]).index("by_kind_entityId", ["kind", "entityId"]),
  requestRateLimit: defineTable({ legacyId, keyHash: v.string(), count: v.number(), windowStartedAt: timestamp })
    .index("by_legacyId", ["legacyId"]).index("by_keyHash", ["keyHash"]).index("by_windowStartedAt", ["windowStartedAt"]),
  adminLoginThrottle: defineTable({ legacyId, scope: v.string(), count: v.number(), windowStartedAt: timestamp })
    .index("by_legacyId", ["legacyId"]).index("by_scope", ["scope"]),
});
