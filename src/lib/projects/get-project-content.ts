import type { ProjectResults } from "@/lib/convex/mutations/projects";
import {
  getFeaturedProjects,
  getProjectLinks,
  getPublishedProjectCategoryNames,
  getPublishedProjects,
  getProjectListingRelationships,
  getPublishedProjectPage,
} from "@/lib/convex/queries/projects";

export type ProjectContent = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  projectType: string;
  location: string | null;
  year: number | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  categories: string[];
  technologies: string[];
  image: {
    src: string;
    alt: string;
  } | null;
  href: string;
  liveUrl: string | null;
  liveLabel: string | null;
  caseStudyUrl: string | null;
  gallery: { src: string; alt: string; caption: string; title: string; fit?: "cover" | "contain" }[];
  results: ProjectResults;
};

type FeaturedImageSource = {
  src: string;
  filename?: string;
  mimeType?: string;
  role?: string;
  altText?: string | null;
  altTextOverride?: string | null;
  caption?: string | null;
  title?: string | null;
};

function normalizeImageSource(source: string) {
  try {
    const url = new URL(source, "https://portfolio.local");
    url.search = "";
    url.hash = "";
    return `${url.origin}${url.pathname}`.toLowerCase();
  } catch {
    return source.split(/[?#]/, 1)[0].trim().toLowerCase();
  }
}

function getUniqueFeaturedImages(
  cover: FeaturedImageSource | null,
  media: FeaturedImageSource[],
) {
  const seenSources = new Set<string>();
  const seenFilenames = new Set<string>();
  const unique: FeaturedImageSource[] = [];

  for (const image of [...(cover ? [cover] : []), ...media]) {
    const src = image.src.trim();
    if (!src) continue;
    const normalizedSource = normalizeImageSource(src);
    const normalizedFilename = image.filename?.trim().toLowerCase() ?? "";
    if (
      seenSources.has(normalizedSource) ||
      (normalizedFilename && seenFilenames.has(normalizedFilename))
    ) {
      continue;
    }
    seenSources.add(normalizedSource);
    if (normalizedFilename) seenFilenames.add(normalizedFilename);
    unique.push({ ...image, src });
  }

  return unique.map((image, index) => {
    const caption = image.caption?.trim() ?? "";
    const existingAlt = image.altTextOverride?.trim() || image.altText?.trim() || "";
    const explicitTitle = image.title?.trim() ?? "";
    const title =
      explicitTitle ||
      caption ||
      existingAlt ||
      (index === 0 ? "Cover" : `Image ${index + 1}`);
    const alt = existingAlt || title;
    const imageDescription = `${image.filename ?? ""} ${caption} ${alt}`;
    const fit: "contain" | "cover" =
      image.mimeType === "image/svg+xml" ||
      /diagram|architecture|flowchart|wireframe|schematic|components?|interface|conceptual/i.test(
        imageDescription,
      )
        ? "contain"
        : "cover";

    return { src: image.src, alt, caption, title, fit };
  });
}

type GetProjectContentOptions = {
  all?: boolean;
};

export async function getProjectContent(
  options: GetProjectContentOptions = {},
): Promise<ProjectContent[]> {
  const projects = options.all
    ? await getPublishedProjects()
    : await getFeaturedProjects();

  if (!projects.length) {
    return [];
  }

  const relationships = await getProjectListingRelationships(projects.map(({ id }) => id));
  const projectLinks = await Promise.all(projects.map(({ id }) => getProjectLinks(id)));
  const content: ProjectContent[] = projects.map((project, index) => {
      const { categories, technologies, media } = relationships.get(project.id)!;
      const links = projectLinks[index] ?? [];

      const projectImage =
        media.find((item) => item.role === "hero") ??
        media.find((item) => item.role === "preview");

      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        shortDescription: project.shortDescription,
        description: project.description,
        projectType: project.projectType,
        location: project.location,
        year: project.year,
        status: project.status,
        featured: project.featured,
        categories: categories.map((category) => category.name),
        technologies: technologies.map((technology) => technology.name),
        image: projectImage?.url
          ? {
              src: projectImage.url,
              alt:
                projectImage.altTextOverride ??
                projectImage.altText ??
                project.title,
            }
          : null,
        href: `/projects/${project.slug}`,
        liveUrl: links.find((link) => link.type === "live")?.url ?? null,
        liveLabel: links.find((link) => link.type === "live")?.label ?? null,
        caseStudyUrl: links.find((link) => link.type === "case_study")?.url ?? null,
        gallery: [],
        results: validateProjectResults(project.results),
      };
    });

  const featured = content.find(({ featured }) => featured);
  if (featured) {
    const detail = await getPublishedProjectPage(featured.slug);
    if (detail) {
      const imageMedia = detail.media
        .filter((item) => item.mimeType.startsWith("image/"))
        .map((item) => ({
          src: item.url,
          filename: item.filename,
          mimeType: item.mimeType,
          role: item.role,
          altText: item.altText,
          altTextOverride: item.altTextOverride,
          caption: item.caption,
          title: "title" in item && typeof item.title === "string" ? item.title : null,
        }));
      const projectImage = featured.image;
      const matchingCover = projectImage
        ? imageMedia.find(
            (item) =>
              normalizeImageSource(item.src) === normalizeImageSource(projectImage.src) ||
              item.altTextOverride === projectImage.alt ||
              item.altText === projectImage.alt,
          )
        : null;
      const cover = matchingCover ??
        (projectImage
          ? { src: projectImage.src, altText: projectImage.alt }
          : imageMedia.find((item) => item.role === "hero") ??
            imageMedia.find((item) => item.role === "preview") ??
            imageMedia.find((item) => item.role === "gallery") ??
            imageMedia[0] ??
            null);

      featured.gallery = getUniqueFeaturedImages(cover, imageMedia);
    }
  }

  return content;
}

function validateProjectResults(value: unknown): ProjectResults {
  if (!Array.isArray(value) || value.length !== 4) throw new Error("Project results must contain exactly four entries.");
  for (const item of value) {
    if (!item || typeof item !== "object") throw new Error("Project results contain an invalid entry.");
    const result = item as { value?: unknown; label?: unknown };
    const validValueType = typeof result.value === "string" || typeof result.value === "number";
    const rendered = validValueType ? String(result.value).trim() : "";
    const label = typeof result.label === "string" ? result.label : "";
    const words = label.trim().split(/\s+/).filter(Boolean);
    if (!validValueType || !rendered || rendered.length > 6 || label !== label.trim() || words.length < 2 || words.length > 5) {
      throw new Error("Project results contain an invalid value or label.");
    }
  }
  return value as ProjectResults;
}

export async function getPublishedProjectCategories(): Promise<string[]> {
  const categories = await getPublishedProjectCategoryNames();
  return categories.map(({ name }) => name);
}
