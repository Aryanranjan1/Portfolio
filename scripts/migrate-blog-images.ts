import { randomUUID } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import sharp from "sharp";

loadEnv({ path: ".env.local" });
loadEnv();

type JsonObject = Record<string, unknown>;
type Inventory = {
  articles: JsonObject[];
  articleBlocks: JsonObject[];
  projects: JsonObject[];
  projectMedia: JsonObject[];
  projectSections: JsonObject[];
  projectBlocks: JsonObject[];
  media: JsonObject[];
};
type ImagePlan = {
  url: string;
  filename: string;
  altText: string | null;
  mediaIds: Set<string>;
  references: Set<string>;
  originalBytes: number;
  webp: Buffer;
  width: number;
  height: number;
  newMediaId?: string;
  newUrl?: string;
};

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--dry-run" && arg !== "--apply")) {
  throw new Error("Usage: npx tsx scripts/migrate-blog-images.ts [--dry-run|--apply]");
}
if (args.includes("--dry-run") && args.includes("--apply")) {
  throw new Error("Choose either --dry-run or --apply.");
}
const apply = args.includes("--apply");
if (apply && process.env.ALLOW_BLOG_IMAGE_MIGRATION_APPLY !== "true") {
  throw new Error("--apply is disabled. Set ALLOW_BLOG_IMAGE_MIGRATION_APPLY=true only after reviewing the dry-run.");
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const secret = process.env.CONVEX_SERVER_SECRET;
if (!convexUrl || !secret) throw new Error("NEXT_PUBLIC_CONVEX_URL and CONVEX_SERVER_SECRET are required.");

const client = new ConvexHttpClient(convexUrl);
const readAdmin = makeFunctionReference<"query", { secret: string; operation: string; input: JsonObject }, unknown>("admin:read");
const runMutation = makeFunctionReference<"mutation", { secret: string; operation: string; input: JsonObject }, unknown>("applicationMutations:run");

async function admin<T>(operation: string, input: JsonObject = {}): Promise<T> {
  return client.query(readAdmin, { secret: secret!, operation, input }) as Promise<T>;
}

async function mutate<T>(operation: string, input: JsonObject = {}): Promise<T> {
  return client.mutation(runMutation, { secret: secret!, operation, input }) as Promise<T>;
}

function asImageUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\//.test(value);
}

function imageFilename(value: string, fallback: string) {
  try {
    const name = decodeURIComponent(new URL(value).pathname.split("/").pop() || fallback);
    return name.replace(/\.[^.]+$/, ".webp").slice(0, 255);
  } catch {
    return `${fallback}.webp`;
  }
}

function addReference(plans: Map<string, ImagePlan>, url: string, reference: string, media?: JsonObject) {
  if (!asImageUrl(url)) return;
  let plan = plans.get(url);
  if (!plan) {
    plan = {
      url,
      filename: media?.filename ? String(media.filename).replace(/\.[^.]+$/, ".webp") : imageFilename(url, "blog-image"),
      altText: typeof media?.altText === "string" ? media.altText : null,
      mediaIds: new Set(),
      references: new Set(),
      originalBytes: 0,
      webp: Buffer.alloc(0),
      width: 0,
      height: 0,
    };
    plans.set(url, plan);
  }
  if (media?.id) plan.mediaIds.add(String(media.id));
  plan.references.add(reference);
}

function blockImageUrls(block: JsonObject): string[] {
  if (block.type !== "image" && block.type !== "gallery") return [];
  const data = block.data && typeof block.data === "object" ? block.data as JsonObject : {};
  const urls: string[] = [];
  if (asImageUrl(data.url)) urls.push(data.url);
  if (Array.isArray(data.images)) {
    for (const image of data.images) if (image && asImageUrl(image.url)) urls.push(image.url);
  }
  return urls;
}

async function prepareImage(plan: ImagePlan) {
  const response = await fetch(plan.url);
  if (!response.ok) throw new Error(`Image download failed (${response.status}): ${plan.url}`);
  const input = Buffer.from(await response.arrayBuffer());
  plan.originalBytes = input.byteLength;
  const converted = await sharp(input, { animated: true })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer({ resolveWithObject: true });
  plan.webp = converted.data;
  plan.width = converted.info.width;
  plan.height = converted.info.height;
}

function replaceArticleBlock(block: JsonObject, urlMap: Map<string, string>) {
  const data = { ...(block.data ?? {}) } as JsonObject;
  if (typeof data.url === "string" && urlMap.has(data.url)) {
    data.url = urlMap.get(data.url);
  }
  if (Array.isArray(data.images)) {
    data.images = data.images.map((image: JsonObject) => {
      if (image && typeof image.url === "string" && urlMap.has(image.url)) {
        return { ...image, url: urlMap.get(image.url) };
      }
      return image;
    });
  }
  return { legacyId: block.id, type: block.type, position: block.position, data };
}

function replaceProjectBlock(block: JsonObject, urlMap: Map<string, string>, mediaIdMap: Map<string, string>) {
  const data = { ...(block.data ?? {}) } as JsonObject;
  let changed = false;
  if (typeof data.url === "string" && urlMap.has(data.url)) {
    data.url = urlMap.get(data.url);
    changed = true;
  }
  if (typeof data.mediaId === "string" && mediaIdMap.has(data.mediaId)) {
    data.mediaId = mediaIdMap.get(data.mediaId);
    changed = true;
  }
  if (Array.isArray(data.mediaIds)) {
    data.mediaIds = data.mediaIds.map((id: string) => {
      if (!mediaIdMap.has(id)) return id;
      changed = true;
      return mediaIdMap.get(id);
    });
  }
  if (Array.isArray(data.images)) {
    data.images = data.images.map((image: JsonObject) => {
      if (!image) return image;
      const next = { ...image };
      if (typeof next.url === "string" && urlMap.has(next.url)) {
        next.url = urlMap.get(next.url);
        changed = true;
      }
      if (typeof next.mediaId === "string" && mediaIdMap.has(next.mediaId)) {
        next.mediaId = mediaIdMap.get(next.mediaId);
        changed = true;
      }
      return next;
    });
  }
  return changed ? { legacyId: block.id, type: block.type, position: block.position, data } : block;
}

function dateFromSeconds(value: unknown) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

async function main() {
  const [articleRows, projectRows] = await Promise.all([
    admin<JsonObject[]>("articles", { options: {} }),
    admin<JsonObject[]>("projects", { options: {} }),
  ]);
  const [articleEditors, projectEditors] = await Promise.all([
    Promise.all(articleRows.map((article) => admin<JsonObject>("articleEditor", { id: String(article.id) }))),
    Promise.all(projectRows.map((project) => admin<JsonObject>("projectEditor", { id: String(project.id) }))),
  ]);
  const editorMediaById = new Map<string, JsonObject>();
  for (const editor of [...articleEditors, ...projectEditors]) {
    for (const media of Array.isArray(editor.media) ? editor.media as JsonObject[] : []) {
      editorMediaById.set(String(media.id), media);
    }
  }
  const inventory: Inventory = {
    articles: articleEditors.flatMap((editor) => editor.article ? [editor.article as JsonObject] : []),
    articleBlocks: articleEditors.flatMap((editor) => {
      const article = editor.article as JsonObject | null;
      return article && Array.isArray(article.blocks) ? article.blocks as JsonObject[] : [];
    }),
    projects: projectEditors.flatMap((editor) => editor.project ? [editor.project as JsonObject] : []),
    projectMedia: projectEditors.flatMap((editor) => {
      const project = editor.project as JsonObject | null;
      return project && Array.isArray(project.media) ? (project.media as JsonObject[]).map((item) => ({ ...item, projectId: project.id })) : [];
    }),
    projectSections: projectEditors.flatMap((editor) => {
      const project = editor.project as JsonObject | null;
      return project && Array.isArray(project.sections) ? (project.sections as JsonObject[]).map((item) => ({ ...item, projectId: project.id })) : [];
    }),
    projectBlocks: projectEditors.flatMap((editor) => {
      const project = editor.project as JsonObject | null;
      return project && Array.isArray(project.sections)
        ? (project.sections as JsonObject[]).flatMap((section) => Array.isArray(section.blocks)
          ? (section.blocks as JsonObject[]).map((block) => ({ ...block, projectSectionId: section.id }))
          : [])
        : [];
    }),
    media: [...editorMediaById.values()],
  };
  const mediaById = new Map(inventory.media.map((item) => [String(item.id), item]));
  const plans = new Map<string, ImagePlan>();
  const usedMediaIds = new Set<string>();
  const articleById = new Map(inventory.articles.map((item) => [String(item.id), item]));
  const projectById = new Map(inventory.projects.map((item) => [String(item.id), item]));
  const articleBlocksById = new Map<string, JsonObject[]>();
  const projectBlocksBySection = new Map<string, JsonObject[]>();

  for (const block of inventory.articleBlocks) {
    const article = articleById.get(String(block.articleId));
    if (!article) continue;
    const group = articleBlocksById.get(String(article.id)) ?? [];
    group.push(block);
    articleBlocksById.set(String(article.id), group);
    for (const url of blockImageUrls(block)) addReference(plans, url, `blog/${article.slug} block ${block.id}`);
  }

  for (const assignment of inventory.projectMedia) {
    const project = projectById.get(String(assignment.projectId));
    const media = mediaById.get(String(assignment.mediaId));
    if (!project || !media || !String(media.mimeType).startsWith("image/")) continue;
    usedMediaIds.add(String(media.id));
    addReference(plans, String(media.url), `project/${project.slug} media ${assignment.role}`, media);
  }

  for (const block of inventory.projectBlocks) {
    const section = inventory.projectSections.find((item) => item.id === block.projectSectionId);
    const project = section && projectById.get(String(section.projectId));
    if (!project) continue;
    const group = projectBlocksBySection.get(String(section.id)) ?? [];
    group.push(block);
    projectBlocksBySection.set(String(section.id), group);
    const blockData = block.data && typeof block.data === "object" ? block.data as JsonObject : {};
    if (blockData.mediaId) {
      const media = mediaById.get(String(blockData.mediaId));
      if (media && String(media.mimeType).startsWith("image/")) {
        usedMediaIds.add(String(media.id));
        addReference(plans, String(media.url), `project/${project.slug} block ${block.id}`, media);
      }
    }
    if (Array.isArray(blockData.mediaIds)) {
      for (const id of blockData.mediaIds as string[]) {
        const media = mediaById.get(String(id));
        if (media && String(media.mimeType).startsWith("image/")) {
          usedMediaIds.add(String(media.id));
          addReference(plans, String(media.url), `project/${project.slug} block ${block.id}`, media);
        }
      }
    }
    for (const url of blockImageUrls(block)) addReference(plans, url, `project/${project.slug} block ${block.id}`);
  }

  for (const article of inventory.articles) {
    const media = mediaById.get(String(article.socialImageId));
    if (media && String(media.mimeType).startsWith("image/")) {
      usedMediaIds.add(String(media.id));
      addReference(plans, String(media.url), `blog/${article.slug} social image`, media);
    }
  }
  for (const project of inventory.projects) {
    const media = mediaById.get(String(project.socialImageId));
    if (media && String(media.mimeType).startsWith("image/")) {
      usedMediaIds.add(String(media.id));
      addReference(plans, String(media.url), `project/${project.slug} social image`, media);
    }
  }

  for (const plan of plans.values()) await prepareImage(plan);
  console.log(apply ? "APPLY MODE — original storage files will be left untouched." : "DRY RUN — no Convex writes performed.");
  for (const plan of plans.values()) {
    console.log(`- ${plan.filename}: ${plan.originalBytes} B -> ${plan.webp.byteLength} B WebP ${plan.width}x${plan.height}`);
    for (const reference of plan.references) console.log(`    reference: ${reference}`);
  }
  if (!apply) return;

  const urlMap = new Map<string, string>();
  const mediaIdMap = new Map<string, string>();
  for (const plan of plans.values()) {
    const uploadUrl = await mutate<string>("generateUploadUrl");
    const uploaded = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "image/webp" }, body: new Uint8Array(plan.webp) });
    if (!uploaded.ok) throw new Error(`Convex image upload failed (${uploaded.status}) for ${plan.filename}`);
    const body = await uploaded.json() as { storageId?: unknown };
    if (typeof body.storageId !== "string") throw new Error(`Convex did not return a storageId for ${plan.filename}`);
    const media = await mutate<{ id: string; url: string }>("createUploadedMedia", {
      legacyId: randomUUID(), storageId: body.storageId, category: "images", filename: plan.filename,
      mimeType: "image/webp", fileSizeBytes: plan.webp.byteLength, width: plan.width, height: plan.height, altText: plan.altText,
    });
    plan.newMediaId = media.id;
    plan.newUrl = media.url;
    urlMap.set(plan.url, media.url);
    for (const id of plan.mediaIds) mediaIdMap.set(id, media.id);
  }

  for (const article of inventory.articles) {
    const blocks = articleBlocksById.get(String(article.id)) ?? [];
    const nextBlocks = blocks.map((block) => replaceArticleBlock(block, urlMap));
    const socialImageId = mediaIdMap.get(String(article.socialImageId)) ?? article.socialImageId ?? null;
    const changed = nextBlocks.some((block, index) => JSON.stringify(block.data) !== JSON.stringify(blocks[index].data)) || socialImageId !== (article.socialImageId ?? null);
    if (!changed) continue;
    await mutate("updateArticle", {
      id: article.id,
      data: {
        slug: article.slug, title: article.title, excerpt: article.excerpt, categoryId: article.categoryId,
        tags: (Array.isArray(article.tags) ? article.tags as string[] : []).map((tagId) => ({ tagId })), status: article.status,
        featured: article.featured, publishedAt: dateFromSeconds(article.publishedAt), seoTitle: article.seoTitle,
        seoDescription: article.seoDescription, canonicalOverride: article.canonicalOverride,
        robotsIndex: article.robotsIndex, robotsFollow: article.robotsFollow, socialTitle: article.socialTitle,
        socialDescription: article.socialDescription, socialImageId, blocks: nextBlocks,
      },
    });
  }

  for (const project of inventory.projects) {
    const sections = inventory.projectSections.filter((section) => section.projectId === project.id);
    const nextSections = sections.map((section) => ({
      legacyId: section.id,
      type: section.type,
      title: section.title,
      anchor: section.anchor,
      position: section.position,
      blocks: (projectBlocksBySection.get(String(section.id)) ?? []).map((block) => {
        const replaced = replaceProjectBlock(block, urlMap, mediaIdMap);
        return { legacyId: block.id, type: block.type, position: block.position, data: replaced.data };
      }),
    }));
    const nextMedia = inventory.projectMedia.filter((item) => item.projectId === project.id).map((item) => ({
      mediaId: mediaIdMap.get(String(item.mediaId)) ?? item.mediaId,
      role: item.role, position: item.position, caption: item.caption, altTextOverride: item.altTextOverride,
    }));
    const socialImageId = mediaIdMap.get(String(project.socialImageId)) ?? project.socialImageId ?? null;
    const changedSections = nextSections.some((section, index) => section.blocks.some((block, blockIndex) => {
      const original = (projectBlocksBySection.get(String(sections[index]?.id)) ?? [])[blockIndex];
      return !original || JSON.stringify(block.data) !== JSON.stringify(original.data);
    }));
    const changedMedia = nextMedia.some((item, index) => item.mediaId !== inventory.projectMedia.filter((row) => row.projectId === project.id)[index]?.mediaId);
    if (!changedSections && !changedMedia && socialImageId === (project.socialImageId ?? null)) continue;
    await mutate("updateProject", {
      id: project.id,
      data: {
        slug: project.slug, title: project.title, shortDescription: project.shortDescription, description: project.description,
        projectType: project.projectType, location: project.location, year: project.year, status: project.status,
        featured: project.featured, publishedAt: dateFromSeconds(project.publishedAt), seoTitle: project.seoTitle,
        seoDescription: project.seoDescription, canonicalOverride: project.canonicalOverride,
        robotsIndex: project.robotsIndex, robotsFollow: project.robotsFollow, socialTitle: project.socialTitle,
        socialDescription: project.socialDescription, socialImageId,
        categories: (Array.isArray(project.categories) ? project.categories as string[] : []).map((categoryId) => ({ categoryId })),
        technologies: project.technologies ?? [], media: nextMedia, sections: nextSections,
        links: (Array.isArray(project.links) ? project.links as JsonObject[] : []).map((link) => ({ legacyId: link.id, type: link.type, position: link.position, label: link.label, url: link.url })),
      },
    });
  }

  console.log("Migration complete. Original files remain in Convex storage; review and remove them only in a separately approved cleanup.");
  console.log(`Created ${plans.size} optimized media records; ${usedMediaIds.size} existing media records were referenced.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
