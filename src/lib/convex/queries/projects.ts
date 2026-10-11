import { cache } from "react";
import { readPublic } from "@/lib/convex-read";
import { readAdmin } from "@/lib/convex-server";
import { readAllPublicPages } from "./paginate-public";
import type { ConvexRow } from "../types";

type Project = ConvexRow<"project">;
type LlmsProject = Pick<Project, "slug" | "title" | "canonicalOverride"> & { description: string };
type ProjectCategory = Pick<ConvexRow<"projectCategory">, "id" | "name" | "slug" | "description">;
type ProjectTechnology = Pick<ConvexRow<"technology">, "id" | "name" | "slug" | "description" | "websiteUrl" | "iconMediaId">;
type Section = ConvexRow<"projectSection">;
type Block = ConvexRow<"projectBlock">;
type ProjectMedia = { projectId: string; mediaId: string; role: string; position: number; caption: string | null; altTextOverride: string | null; storageKey: string; url: string; filename: string; mimeType: string; width: number | null; height: number | null; altText: string | null };
type ProjectPage = Project & { categories: ProjectCategory[]; technologies: ProjectTechnology[]; sections: (Section & { blocks: Block[] })[]; links: { id: string; projectId: string; type: string; label: string; url: string; position: number }[]; media: ProjectMedia[] };

export async function getPublishedProjects() { return readAllPublicPages<Project>("projects"); }
export async function getDiscoverableProjects() { return readAllPublicPages<Pick<Project, "slug" | "title" | "updatedAt" | "canonicalOverride">>("discoverableProjects"); }
export async function getLlmsDiscoverableProjects() { return readAllPublicPages<LlmsProject>("llmsProjects"); }
export async function getFeaturedProjects() {
  const rows = await readAllPublicPages<Project>("featuredProjects");
  return rows.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || a.title.localeCompare(b.title));
}
export async function getPublishedProjectBySlug(slug: string) { return readPublic<Project | null>("projectBySlug", { slug }); }
export async function getProjectSlugById(id: string) { return readAdmin<string | null>("projectSlugById", { id }); }
export async function getProjectRedirectSlug(slug: string) { return readPublic<string | null>("projectRedirect", { slug }); }
export async function getProjectCategories(id: string) { return readPublic<ProjectCategory[]>("projectCategories", { id }); }
export async function getPublishedProjectCategoryNames() { return readPublic<{ name: string }[]>("publishedProjectCategoryNames"); }
export async function getProjectTechnologies(id: string) { return readPublic<ProjectTechnology[]>("projectTechnologies", { id }); }
export async function getProjectSections(id: string) { return readPublic<Section[]>("projectSections", { id }); }
export async function getProjectBlocks(id: string) { return readPublic<Block[]>("projectBlocks", { id }); }
export async function getProjectLinks(id: string) {
  const links = await readPublic<ProjectPage["links"]>("projectLinks", { id });
  return links.filter(({ url }) => {
    try {
      const parsed = new URL(url);
      return !["example.com", "example.org", "example.net"].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)) && !(parsed.hostname === "github.com" && parsed.pathname.startsWith("/example/"));
    } catch { return false; }
  });
}
export async function getProjectMedia(id: string) { return readPublic<ProjectMedia[]>("projectMedia", { id }); }
export async function getProjectListingRelationships(projectIds: string[]) {
  const values: Record<string, { categories: ProjectCategory[]; technologies: ProjectTechnology[]; media: ProjectMedia[] }> = {};
  for (let index = 0; index < projectIds.length; index += 50) {
    Object.assign(values, await readPublic<Record<string, { categories: ProjectCategory[]; technologies: ProjectTechnology[]; media: ProjectMedia[] }>>("projectListingRelationships", { ids: projectIds.slice(index, index + 50) }));
  }
  return new Map(projectIds.map((id) => [id, values[id] ?? { categories: [], technologies: [], media: [] }]));
}

export const getPublishedProjectPage = cache(async function getPublishedProjectPage(slug: string): Promise<ProjectPage | null> {
  return readPublic<ProjectPage | null>("projectPage", { slug });
});
