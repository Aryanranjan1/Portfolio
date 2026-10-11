import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";
import type { ConvexRow } from "../types";

type ProjectRecord = ConvexRow<"project">;
type ProjectCategoryRecord = ConvexRow<"projectCategory">;
type TechnologyRecord = ConvexRow<"technology">;

export type ProjectStatus = "draft" | "published" | "archived";
export type ProjectCategoryInput = { categoryId: string };
export type ProjectTechnologyInput = { technologyId: string; position: number };
export type ProjectMediaInput = { mediaId: string; role: "hero" | "preview" | "problem_gallery" | "wireframe" | "gallery" | "other"; position: number; caption: string | null; altTextOverride: string | null };
export type ProjectBlockInput = { id?: string; type: "rich_text" | "quote" | "image" | "gallery" | "problem_list" | "objective_list" | "technology_list" | "process_steps" | "metrics" | "roadmap" | "callout"; position: number; data: Record<string, unknown> };
export type ProjectSectionInput = { id?: string; type: "about" | "problem" | "solution" | "build" | "results" | "gallery" | "whats_next"; title: string | null; anchor: string | null; position: number; blocks: ProjectBlockInput[] };
export type ProjectLinkInput = { id?: string; type: "live" | "repository" | "case_study" | "documentation" | "demo" | "other"; label: string; url: string; position: number };
export type CreateProjectInput = {
  slug: string; title: string; shortDescription: string; description: string; projectType: string; location: string | null; year: number | null;
  status: ProjectStatus; featured: boolean; publishedAt: Date | null; seoTitle: string | null; seoDescription: string | null; canonicalOverride: string | null;
  robotsIndex: boolean; robotsFollow: boolean; socialTitle: string | null; socialDescription: string | null; socialImageId: string | null;
  categories: ProjectCategoryInput[]; technologies: ProjectTechnologyInput[]; media: ProjectMediaInput[]; sections: ProjectSectionInput[]; links: ProjectLinkInput[];
};
export type UpdateProjectInput = CreateProjectInput & { id: string };
export type ProjectCategoryRecordInput = { name: string; slug: string; description: string | null };
export type TechnologyInput = ProjectCategoryRecordInput & { websiteUrl: string | null; iconMediaId: string | null };

export function createProjectCategory(input: ProjectCategoryRecordInput) { return mutateApplication<ProjectCategoryRecord>("simpleCreate", { table: "projectCategory", legacyId: randomUUID(), data: input }); }
export function updateProjectCategory(id: string, input: ProjectCategoryRecordInput) { return mutateApplication<ProjectCategoryRecord>("simpleUpdate", { table: "projectCategory", id, data: input }); }
export function deleteProjectCategory(id: string) { return mutateApplication<{ id: string }>("simpleDelete", { table: "projectCategory", id }); }
export function createTechnology(input: TechnologyInput) { return mutateApplication<TechnologyRecord>("simpleCreate", { table: "technology", legacyId: randomUUID(), data: input }); }
export function updateTechnology(id: string, input: TechnologyInput) { return mutateApplication<TechnologyRecord>("simpleUpdate", { table: "technology", id, data: input }); }
export function deleteTechnology(id: string) { return mutateApplication<{ id: string }>("simpleDelete", { table: "technology", id }); }

function withNewChildIds(input: CreateProjectInput) {
  return {
    ...input,
    sections: input.sections.map(({ id, blocks, ...section }) => ({ legacyId: id ?? randomUUID(), ...section, blocks: blocks.map(({ id: blockId, ...block }) => ({ legacyId: blockId ?? randomUUID(), ...block })) })),
    links: input.links.map(({ id, ...link }) => ({ legacyId: id ?? randomUUID(), ...link })),
  };
}

export function createProject(input: CreateProjectInput) {
  return mutateApplication<ProjectRecord>("createProject", { legacyId: randomUUID(), data: withNewChildIds(input) });
}

export function updateProject(input: UpdateProjectInput) {
  const { id, ...data } = input;
  return mutateApplication<ProjectRecord>("updateProject", { id, data: withNewChildIds(data) });
}

export function deleteProject(id: string) { return mutateApplication<Pick<ProjectRecord, "id" | "slug">>("deleteProject", { id }); }
export function setProjectStatus(id: string, status: ProjectStatus, publishedAt: Date | null) { return mutateApplication<ProjectRecord>("setProjectStatus", { id, status, publishedAt }); }
