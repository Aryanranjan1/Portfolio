import {
  getFeaturedProjects,
  getPublishedProjectCategoryNames,
  getPublishedProjects,
  getProjectListingRelationships,
} from "@/db/queries/projects";

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
};

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
  const content = projects.map((project) => {
      const { categories, technologies, media } = relationships.get(project.id)!;

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
      };
    });

  return content;
}

export async function getPublishedProjectCategories(): Promise<string[]> {
  const categories = await getPublishedProjectCategoryNames();
  return categories.map(({ name }) => name);
}
