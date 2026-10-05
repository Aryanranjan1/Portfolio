import { getSiteSettings, getSkills, getTimeline } from "@/db/queries/site";

export type AboutProfile = {
  personName: string;
  professionalTitle: string;
  shortDescription: string;
  location: string;
  bio: string;
  education: string | null;
  interests: string | null;
  yearsBuilding: number;
  projectsCompleted: number;
  leetcodeSolved: number;
  learningHours: number;
};

export type AboutSkill = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  iconMediaId: string | null;
  icon: { id: string; url: string; filename: string; altText: string | null; width: number | null; height: number | null } | null;
};
export type AboutSkillCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  skills: AboutSkill[];
};
export type AboutTimelineEntry = {
  id: string;
  year: string;
  title: string;
  description: string;
  tag: string;
};
export type AboutContent = {
  profile: AboutProfile;
  initials: string;
  year: number;
  currently: { items: string[]; quote: string };
  skillCategories: AboutSkillCategory[];
  timeline: (AboutTimelineEntry & { current: boolean })[];
};

const CURRENTLY = {
  items: ["Building personal projects", "Deepening CS fundamentals", "Exploring system design", "Documenting what I learn"],
  quote: "“A little progress\nevery day leads to\nbig results.”",
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  return `${words[0]?.[0] ?? ""}${words.length > 1 ? words.at(-1)?.[0] ?? "" : ""}`.toUpperCase();
}

export async function getAboutContent(): Promise<AboutContent> {
  const [settings, skillRows, timelineRows] = await Promise.all([
    getSiteSettings(),
    getSkills(),
    getTimeline(),
  ]);
  if (!settings) throw new Error("SITE_SETTINGS_NOT_FOUND");

  const year = new Date().getFullYear();
  const timeline = timelineRows.map((entry) => ({
    id: entry.id,
    year: String(entry.year),
    title: entry.title,
    description: entry.description,
    tag: entry.tag ?? "",
  }));
  const currentId = timeline
    .filter((entry) => Number(entry.year) <= year)
    .at(-1)?.id;

  return {
    profile: {
      personName: settings.personName,
      professionalTitle: settings.professionalTitle,
      shortDescription: settings.shortDescription,
      location: settings.location,
      bio: settings.bio,
      education: settings.education,
      interests: settings.interests,
      yearsBuilding: settings.yearsBuilding,
      projectsCompleted: settings.projectsCompleted,
      leetcodeSolved: settings.leetcodeSolved,
      learningHours: settings.learningHours,
    },
    initials: getInitials(settings.personName),
    year,
    currently: CURRENTLY,
    skillCategories: skillRows.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      skills: category.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        details: skill.details,
        iconMediaId: skill.iconMediaId,
        icon: skill.icon?.id ? skill.icon : null,
      })),
    })),
    timeline: timeline.map((entry) => ({ ...entry, current: entry.id === currentId })),
  };
}
