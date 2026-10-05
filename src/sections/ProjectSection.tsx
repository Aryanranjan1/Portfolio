import { getProjectContent } from "@/lib/projects/get-project-content";
import ProjectsSectionClient, {
  type ProjectsSectionTheme,
} from "./ProjectSectionClient";

type ProjectsSectionProps = {
  /** Colour theme. Defaults to "light". Pass "dark" for dark mode. */
  theme?: ProjectsSectionTheme;
};

export default async function ProjectsSection({
  theme = "light",
}: ProjectsSectionProps) {
  const projects = await getProjectContent();

  return <ProjectsSectionClient projects={projects} theme={theme} />;
}