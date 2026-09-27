import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  article,
  articleBlock,
  articleCategory,
  articleTag,
  tag,
} from "./schema/articles";
import {
  project,
  projectBlock,
  projectCategory,
  projectCategoryAssignment,
  projectLink,
  projectMedia,
  projectSection,
  projectTechnology,
  technology,
} from "./schema/projects";
import {
  skill,
  skillCategory,
} from "./schema/skills";
import {
  faq,
  timelineEntry,

} from "./schema/content";
import {
  contactMethod,
  siteSettings,
} from "./schema/site";
import { media } from "./schema/media";

async function seed() {
  console.log("Seeding database...");

  /*
   * ------------------------------------------------------------
   * 1. SITE SETTINGS
   * ------------------------------------------------------------
   */

  await db
    .insert(siteSettings)
    .values({
      singleton: true,
      siteName: "Aryan Ranjan",
      personName: "Aryan Ranjan",
      professionalTitle: "Software Developer",
      shortDescription:
        "Building thoughtful software and exploring systems.",
      bio:
        "A developer building projects across the web and software systems.",
      location: "Ranchi, Jharkhand, India",
      education: "Computer Science",
      interests:
        "Software engineering, systems, web development, databases, and learning.",
      availabilityStatus: "available",
      availabilityText:
        "Open to interesting projects and opportunities.",
      yearsBuilding: 0,
      projectsCompleted: 0,
      leetcodeSolved: 0,
      learningHours: 0,
      primaryEmail: "your-email@example.com",
      siteDescription:
        "Personal portfolio of Aryan Ranjan, featuring software projects, technical writing, and development work.",
      canonicalOrigin: "https://your-domain.com",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.singleton,
      set: {
        siteName: "Aryan Ranjan",
        personName: "Aryan Ranjan",
        professionalTitle: "Software Developer",
        shortDescription:
          "Building thoughtful software and exploring systems.",
        bio:
          "A developer building projects across the web and software systems.",
        location: "Ranchi, Jharkhand, India",
        education: "Computer Science",
        interests:
          "Software engineering, systems, web development, databases, and learning.",
        availabilityStatus: "available",
        availabilityText:
          "Open to interesting projects and opportunities.",
        yearsBuilding: 0,
        projectsCompleted: 0,
        leetcodeSolved: 0,
        learningHours: 0,
        primaryEmail: "your-email@example.com",
        siteDescription:
          "Personal portfolio of Aryan Ranjan, featuring software projects, technical writing, and development work.",
        canonicalOrigin: "https://your-domain.com",
        updatedAt: new Date(),
      },
    });

  /*
   * ------------------------------------------------------------
   * 2. CONTACT METHODS
   * ------------------------------------------------------------
   */

  const contactMethods = [
    {
      type: "email",
      label: "Email",
      value: "your-email@example.com",
      url: "mailto:your-email@example.com",
      position: 0,
      active: true,
    },
    {
      type: "github",
      label: "GitHub",
      value: "Aryanranjan1",
      url: "https://github.com/Aryanranjan1",
      position: 1,
      active: true,
    },
    {
      type: "linkedin",
      label: "LinkedIn",
      value: "Aryan Ranjan",
      url: "https://www.linkedin.com/",
      position: 2,
      active: true,
    },
    {
      type: "location",
      label: "Location",
      value: "Ranchi, Jharkhand, India",
      url: null,
      position: 3,
      active: true,
    },
  ];

  for (const item of contactMethods) {
    await db
      .insert(contactMethod)
      .values(item)
      .onConflictDoUpdate({
        target: contactMethod.position,
        set: {
          type: item.type,
          label: item.label,
          value: item.value,
          url: item.url,
          active: item.active,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 3. TIMELINE
   * ------------------------------------------------------------
   */

  const timelineEntries = [
    {
      year: 2024,
      title: "Started building software",
      description:
        "Development milestone placeholder for the portfolio timeline.",
      tag: "Learning",
      position: 0,
      active: true,
    },
    {
      year: 2025,
      title: "Built portfolio projects",
      description:
        "Development milestone placeholder for projects and technical exploration.",
      tag: "Projects",
      position: 1,
      active: true,
    },
    {
      year: 2026,
      title: "Focused on systems and full-stack development",
      description:
        "Development milestone placeholder for deeper software engineering work.",
      tag: "Engineering",
      position: 2,
      active: true,
    },
  ];

  for (const item of timelineEntries) {
    await db
      .insert(timelineEntry)
      .values(item)
      .onConflictDoUpdate({
        target: timelineEntry.position,
        set: {
          year: item.year,
          title: item.title,
          description: item.description,
          tag: item.tag,
          active: item.active,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 4. FAQ
   * ------------------------------------------------------------
   */

  const faqs = [
    {
      question: "What kind of projects do you work on?",
      answer:
        "I build web applications and software projects focused on practical problems, clean architecture, and continuous learning.",
      position: 0,
      active: true,
    },
    {
      question: "Are you available for projects?",
      answer:
        "I am open to interesting projects and opportunities.",
      position: 1,
      active: true,
    },
    {
      question: "What technologies do you work with?",
      answer:
        "I work across frontend, backend, databases, and software systems depending on the requirements of the project.",
      position: 2,
      active: true,
    },
    {
      question: "Where are you based?",
      answer:
        "I am based in Ranchi, Jharkhand, India.",
      position: 3,
      active: true,
    },
  ];

  for (const item of faqs) {
    await db
      .insert(faq)
      .values(item)
      .onConflictDoUpdate({
        target: faq.position,
        set: {
          question: item.question,
          answer: item.answer,
          active: item.active,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 5. MEDIA
   * ------------------------------------------------------------
   *
   * These are development references to the images already
   * present in public/.
   */

  const mediaRows = [
    {
      id: "00000000-0000-7000-0000-000000000001",
      storageKey: "development/hero.jpg",
      url: "/hero.jpg",
      filename: "hero.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: null,
      width: null,
      height: null,
      altText: "Portfolio hero image",
    },
    {
      id: "00000000-0000-7000-0000-000000000002",
      storageKey: "development/ascii-art-v2.png",
      url: "/ascii-art-v2.png",
      filename: "ascii-art-v2.png",
      mimeType: "image/png",
      fileSizeBytes: null,
      width: null,
      height: null,
      altText: "Portfolio development artwork",
    },
  ];

  for (const item of mediaRows) {
    await db
      .insert(media)
      .values(item)
      .onConflictDoUpdate({
        target: media.storageKey,
        set: {
          url: item.url,
          filename: item.filename,
          mimeType: item.mimeType,
          altText: item.altText,
          updatedAt: new Date(),
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 6. PROJECT CATEGORIES
   * ------------------------------------------------------------
   */

  const projectCategories = [
    {
      name: "Web Development",
      slug: "web-development",
      description: "Web applications and websites.",
    },
    {
      name: "Systems",
      slug: "systems",
      description: "Systems-oriented software projects.",
    },
    {
      name: "Experiments",
      slug: "experiments",
      description: "Smaller experiments and technical explorations.",
    },
  ];

  for (const item of projectCategories) {
    await db
      .insert(projectCategory)
      .values(item)
      .onConflictDoUpdate({
        target: projectCategory.slug,
        set: {
          name: item.name,
          description: item.description,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 7. TECHNOLOGIES
   * ------------------------------------------------------------
   */

  const technologies = [
    {
      name: "Next.js",
      slug: "nextjs",
      description: "React framework for full-stack web applications.",
      websiteUrl: "https://nextjs.org",
    },
    {
      name: "TypeScript",
      slug: "typescript",
      description: "Typed JavaScript for application development.",
      websiteUrl: "https://www.typescriptlang.org",
    },
    {
      name: "PostgreSQL",
      slug: "postgresql",
      description: "Relational database system.",
      websiteUrl: "https://www.postgresql.org",
    },
    {
      name: "Drizzle ORM",
      slug: "drizzle-orm",
      description: "TypeScript ORM for SQL databases.",
      websiteUrl: "https://orm.drizzle.team",
    },
    {
      name: "React",
      slug: "react",
      description: "Library for building user interfaces.",
      websiteUrl: "https://react.dev",
    },
    {
      name: "Tailwind CSS",
      slug: "tailwind-css",
      description: "Utility-first CSS framework.",
      websiteUrl: "https://tailwindcss.com",
    },
  ];

  for (const item of technologies) {
    await db
      .insert(technology)
      .values(item)
      .onConflictDoUpdate({
        target: technology.slug,
        set: {
          name: item.name,
          description: item.description,
          websiteUrl: item.websiteUrl,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 8. PROJECTS
   * ------------------------------------------------------------
   */

  const projects = [
    {
      slug: "portfolio-platform",
      title: "Portfolio Platform",
      shortDescription:
        "A production-oriented personal portfolio and publishing platform.",
      description:
        "A full-stack portfolio application built around structured content, PostgreSQL, server-side rendering, protected administration, and SEO-friendly public pages.",
      projectType: "Web Application",
      location: "Ranchi, India",
      year: 2026,
      status: "published" as const,
      featured: true,
      publishedAt: new Date("2026-09-01T10:00:00Z"),
      seoTitle: "Portfolio Platform — Aryan Ranjan",
      seoDescription:
        "A structured full-stack portfolio and publishing platform.",
      robotsIndex: true,
      robotsFollow: true,
      socialTitle: "Portfolio Platform",
      socialDescription:
        "A full-stack portfolio and publishing platform.",
    },
    {
      slug: "systems-learning-lab",
      title: "Systems Learning Lab",
      shortDescription:
        "A collection of experiments focused on software systems and engineering fundamentals.",
      description:
        "A development project for exploring systems concepts, backend architecture, databases, and practical software engineering.",
      projectType: "Systems Project",
      location: "Ranchi, India",
      year: 2026,
      status: "published" as const,
      featured: false,
      publishedAt: new Date("2026-08-15T10:00:00Z"),
      seoTitle: "Systems Learning Lab — Aryan Ranjan",
      seoDescription:
        "Systems experiments and software engineering explorations.",
      robotsIndex: true,
      robotsFollow: true,
      socialTitle: "Systems Learning Lab",
      socialDescription:
        "Exploring systems and software engineering fundamentals.",
    },
  ];

  for (const item of projects) {
    await db
      .insert(project)
      .values(item)
      .onConflictDoUpdate({
        target: project.slug,
        set: {
          title: item.title,
          shortDescription: item.shortDescription,
          description: item.description,
          projectType: item.projectType,
          location: item.location,
          year: item.year,
          status: item.status,
          featured: item.featured,
          publishedAt: item.publishedAt,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          robotsIndex: item.robotsIndex,
          robotsFollow: item.robotsFollow,
          socialTitle: item.socialTitle,
          socialDescription: item.socialDescription,
          updatedAt: new Date(),
        },
      });
  }

  const projectRows = await db.select().from(project);
  const categoryRows = await db.select().from(projectCategory);
  const technologyRows = await db.select().from(technology);

  const portfolioProject = projectRows.find(
    (item) => item.slug === "portfolio-platform",
  );

  const systemsProject = projectRows.find(
    (item) => item.slug === "systems-learning-lab",
  );

  const webCategory = categoryRows.find(
    (item) => item.slug === "web-development",
  );

  const systemsCategory = categoryRows.find(
    (item) => item.slug === "systems",
  );

  const experimentsCategory = categoryRows.find(
    (item) => item.slug === "experiments",
  );

  const nextjs = technologyRows.find(
    (item) => item.slug === "nextjs",
  );

  const typescript = technologyRows.find(
    (item) => item.slug === "typescript",
  );

  const postgresql = technologyRows.find(
    (item) => item.slug === "postgresql",
  );

  const drizzle = technologyRows.find(
    (item) => item.slug === "drizzle-orm",
  );

  const react = technologyRows.find(
    (item) => item.slug === "react",
  );

  const tailwind = technologyRows.find(
    (item) => item.slug === "tailwind-css",
  );

  if (
    !portfolioProject ||
    !systemsProject ||
    !webCategory ||
    !systemsCategory ||
    !experimentsCategory ||
    !nextjs ||
    !typescript ||
    !postgresql ||
    !drizzle ||
    !react ||
    !tailwind
  ) {
    throw new Error("Project seed dependencies were not found.");
  }

  /*
   * ------------------------------------------------------------
   * 9. PROJECT RELATIONSHIPS
   * ------------------------------------------------------------
   */

  const projectCategoryAssignments = [
    {
      projectId: portfolioProject.id,
      categoryId: webCategory.id,
    },
    {
      projectId: portfolioProject.id,
      categoryId: experimentsCategory.id,
    },
    {
      projectId: systemsProject.id,
      categoryId: systemsCategory.id,
    },
    {
      projectId: systemsProject.id,
      categoryId: experimentsCategory.id,
    },
  ];

  for (const item of projectCategoryAssignments) {
    await db
      .insert(projectCategoryAssignment)
      .values(item)
      .onConflictDoNothing();
  }

  const projectTechnologies = [
    {
      projectId: portfolioProject.id,
      technologyId: nextjs.id,
      position: 0,
    },
    {
      projectId: portfolioProject.id,
      technologyId: typescript.id,
      position: 1,
    },
    {
      projectId: portfolioProject.id,
      technologyId: postgresql.id,
      position: 2,
    },
    {
      projectId: portfolioProject.id,
      technologyId: drizzle.id,
      position: 3,
    },
    {
      projectId: portfolioProject.id,
      technologyId: react.id,
      position: 4,
    },
    {
      projectId: portfolioProject.id,
      technologyId: tailwind.id,
      position: 5,
    },
    {
      projectId: systemsProject.id,
      technologyId: typescript.id,
      position: 0,
    },
    {
      projectId: systemsProject.id,
      technologyId: postgresql.id,
      position: 1,
    },
  ];

  for (const item of projectTechnologies) {
    await db
      .insert(projectTechnology)
      .values(item)
      .onConflictDoUpdate({
        target: [
          projectTechnology.projectId,
          projectTechnology.technologyId,
        ],
        set: {
          position: item.position,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 10. PROJECT SECTIONS + BLOCKS
   * ------------------------------------------------------------
   */

  const projectSections = [
    {
      projectId: portfolioProject.id,
      type: "about",
      title: "About",
      anchor: "about",
      position: 0,
    },
    {
      projectId: portfolioProject.id,
      type: "problem",
      title: "Problem",
      anchor: "problem",
      position: 1,
    },
    {
      projectId: portfolioProject.id,
      type: "solution",
      title: "Solution",
      anchor: "solution",
      position: 2,
    },
    {
      projectId: portfolioProject.id,
      type: "build",
      title: "Build",
      anchor: "build",
      position: 3,
    },
    {
      projectId: portfolioProject.id,
      type: "results",
      title: "Results",
      anchor: "results",
      position: 4,
    },
    {
      projectId: portfolioProject.id,
      type: "whats_next",
      title: "What's Next",
      anchor: "whats-next",
      position: 5,
    },
    {
      projectId: systemsProject.id,
      type: "about",
      title: "About",
      anchor: "about",
      position: 0,
    },
    {
      projectId: systemsProject.id,
      type: "problem",
      title: "Problem",
      anchor: "problem",
      position: 1,
    },
    {
      projectId: systemsProject.id,
      type: "solution",
      title: "Solution",
      anchor: "solution",
      position: 2,
    },
    {
      projectId: systemsProject.id,
      type: "build",
      title: "Build",
      anchor: "build",
      position: 3,
    },
    {
      projectId: systemsProject.id,
      type: "results",
      title: "Results",
      anchor: "results",
      position: 4,
    },
  ];

  for (const item of projectSections) {
    await db
      .insert(projectSection)
      .values(item)
      .onConflictDoUpdate({
        target: [
          projectSection.projectId,
          projectSection.position,
        ],
        set: {
          type: item.type,
          title: item.title,
          anchor: item.anchor,
        },
      });
  }

  const sectionRows = await db.select().from(projectSection);

  const portfolioAbout = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "about",
  );

  const portfolioProblem = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "problem",
  );

  const portfolioSolution = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "solution",
  );

  const portfolioBuild = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "build",
  );

  const portfolioResults = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "results",
  );

  const portfolioNext = sectionRows.find(
    (item) =>
      item.projectId === portfolioProject.id &&
      item.type === "whats_next",
  );

  const systemsAbout = sectionRows.find(
    (item) =>
      item.projectId === systemsProject.id &&
      item.type === "about",
  );

  const systemsProblem = sectionRows.find(
    (item) =>
      item.projectId === systemsProject.id &&
      item.type === "problem",
  );

  const systemsSolution = sectionRows.find(
    (item) =>
      item.projectId === systemsProject.id &&
      item.type === "solution",
  );

  const systemsBuild = sectionRows.find(
    (item) =>
      item.projectId === systemsProject.id &&
      item.type === "build",
  );

  const systemsResults = sectionRows.find(
    (item) =>
      item.projectId === systemsProject.id &&
      item.type === "results",
  );

  const requiredSections = [
    portfolioAbout,
    portfolioProblem,
    portfolioSolution,
    portfolioBuild,
    portfolioResults,
    portfolioNext,
    systemsAbout,
    systemsProblem,
    systemsSolution,
    systemsBuild,
    systemsResults,
  ];

  if (requiredSections.some((item) => !item)) {
    throw new Error("Project sections were not found.");
  }

  /*
   * Delete and recreate only the development seed's blocks.
   *
   * This is safe for development data because the project sections
   * themselves are controlled by this seed. Production content
   * should eventually be managed through the admin system instead.
   */

  await db
    .delete(projectBlock)
    .where(
      sql`${projectBlock.projectSectionId} IN (
        ${portfolioAbout!.id},
        ${portfolioProblem!.id},
        ${portfolioSolution!.id},
        ${portfolioBuild!.id},
        ${portfolioResults!.id},
        ${portfolioNext!.id},
        ${systemsAbout!.id},
        ${systemsProblem!.id},
        ${systemsSolution!.id},
        ${systemsBuild!.id},
        ${systemsResults!.id}
      )`,
    );

  const projectBlocks = [
    {
      projectSectionId: portfolioAbout!.id,
      type: "rich_text",
      position: 0,
      data: {
        text:
          "This project is the personal portfolio platform used to present software projects, technical writing, skills, and contact information.",
      },
    },
    {
      projectSectionId: portfolioProblem!.id,
      type: "problem_list",
      position: 0,
      data: {
        items: [
          "Present projects with enough technical context.",
          "Maintain structured content without hardcoding every page.",
          "Provide a private administration layer for content management.",
        ],
      },
    },
    {
      projectSectionId: portfolioSolution!.id,
      type: "rich_text",
      position: 0,
      data: {
        text:
          "The application uses a structured PostgreSQL content model with server-side public reads and protected administrative mutations.",
      },
    },
    {
      projectSectionId: portfolioBuild!.id,
      type: "technology_list",
      position: 0,
      data: {
        technologies: [
          "Next.js",
          "TypeScript",
          "PostgreSQL",
          "Drizzle ORM",
          "React",
          "Tailwind CSS",
        ],
      },
    },
    {
      projectSectionId: portfolioBuild!.id,
      type: "process_steps",
      position: 1,
      data: {
        steps: [
          "Define requirements.",
          "Design the relational model.",
          "Implement server-side data access.",
          "Build the public experience.",
          "Add protected administration.",
          "Test and optimize.",
        ],
      },
    },
    {
      projectSectionId: portfolioResults!.id,
      type: "metrics",
      position: 0,
      data: {
        metrics: [
          {
            label: "Content model",
            value: "Structured",
          },
          {
            label: "Public rendering",
            value: "SSR / ISR",
          },
          {
            label: "Database",
            value: "PostgreSQL",
          },
        ],
      },
    },
    {
      projectSectionId: portfolioNext!.id,
      type: "roadmap",
      position: 0,
      data: {
        items: [
          "Complete public page implementation.",
          "Implement admin authentication.",
          "Build content management workflows.",
          "Add production media storage.",
          "Add automated testing and observability.",
        ],
      },
    },
    {
      projectSectionId: systemsAbout!.id,
      type: "rich_text",
      position: 0,
      data: {
        text:
          "A development project for studying software systems, backend architecture, databases, and engineering fundamentals.",
      },
    },
    {
      projectSectionId: systemsProblem!.id,
      type: "problem_list",
      position: 0,
      data: {
        items: [
          "Understand systems beyond framework-level abstractions.",
          "Build practical experiments around backend concepts.",
          "Measure behavior instead of relying only on assumptions.",
        ],
      },
    },
    {
      projectSectionId: systemsSolution!.id,
      type: "objective_list",
      position: 0,
      data: {
        items: [
          "Explore database behavior.",
          "Understand application boundaries.",
          "Practice backend architecture.",
          "Develop stronger debugging skills.",
        ],
      },
    },
    {
      projectSectionId: systemsBuild!.id,
      type: "process_steps",
      position: 0,
      data: {
        steps: [
          "Choose a focused systems question.",
          "Build a small experiment.",
          "Measure and inspect behavior.",
          "Document the result.",
        ],
      },
    },
    {
      projectSectionId: systemsResults!.id,
      type: "callout",
      position: 0,
      data: {
        title: "Learning outcome",
        text:
          "The project is intentionally focused on understanding why systems behave the way they do.",
      },
    },
  ];

  await db.insert(projectBlock).values(projectBlocks);

  /*
   * ------------------------------------------------------------
   * 11. PROJECT LINKS
   * ------------------------------------------------------------
   */

  const projectLinks = [
    {
      projectId: portfolioProject.id,
      type: "repository",
      label: "GitHub Repository",
      url: "https://github.com/Aryanranjan1/Portfolio",
      position: 0,
    },
    {
      projectId: portfolioProject.id,
      type: "live",
      label: "Live Portfolio",
      url: "https://your-domain.com",
      position: 1,
    },
    {
      projectId: systemsProject.id,
      type: "repository",
      label: "GitHub",
      url: "https://github.com/Aryanranjan1",
      position: 0,
    },
  ];

  for (const item of projectLinks) {
    await db
      .insert(projectLink)
      .values(item)
      .onConflictDoUpdate({
        target: [
          projectLink.projectId,
          projectLink.position,
        ],
        set: {
          type: item.type,
          label: item.label,
          url: item.url,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 12. PROJECT MEDIA
   * ------------------------------------------------------------
   */

  const heroMedia = mediaRows[0];
  const artworkMedia = mediaRows[1];

  await db
    .insert(projectMedia)
    .values([
      {
        projectId: portfolioProject.id,
        mediaId: heroMedia.id,
        role: "hero",
        position: 0,
        caption: "Portfolio hero image",
        altTextOverride: "Portfolio hero image",
      },
      {
        projectId: portfolioProject.id,
        mediaId: artworkMedia.id,
        role: "gallery",
        position: 1,
        caption: "Development artwork",
        altTextOverride: "Development artwork",
      },
    ])
    .onConflictDoNothing();

  /*
   * ------------------------------------------------------------
   * 13. ARTICLE CATEGORIES
   * ------------------------------------------------------------
   */

  const articleCategories = [
    {
      name: "Engineering",
      slug: "engineering",
      description: "Software engineering and architecture.",
    },
    {
      name: "Databases",
      slug: "databases",
      description: "Database design and data systems.",
    },
    {
      name: "Learning",
      slug: "learning",
      description: "Technical learning and development notes.",
    },
  ];

  for (const item of articleCategories) {
    await db
      .insert(articleCategory)
      .values(item)
      .onConflictDoUpdate({
        target: articleCategory.slug,
        set: {
          name: item.name,
          description: item.description,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 14. TAGS
   * ------------------------------------------------------------
   */

  const tags = [
    {
      name: "Next.js",
      slug: "nextjs",
    },
    {
      name: "PostgreSQL",
      slug: "postgresql",
    },
    {
      name: "Drizzle",
      slug: "drizzle",
    },
    {
      name: "Architecture",
      slug: "architecture",
    },
    {
      name: "TypeScript",
      slug: "typescript",
    },
  ];

  for (const item of tags) {
    await db
      .insert(tag)
      .values(item)
      .onConflictDoUpdate({
        target: tag.slug,
        set: {
          name: item.name,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 15. ARTICLES
   * ------------------------------------------------------------
   */

  const articleCategoryRows = await db
    .select()
    .from(articleCategory);

  const engineeringCategory = articleCategoryRows.find(
    (item) => item.slug === "engineering",
  );

  const databaseCategory = articleCategoryRows.find(
    (item) => item.slug === "databases",
  );

  const learningCategory = articleCategoryRows.find(
    (item) => item.slug === "learning",
  );

  if (
    !engineeringCategory ||
    !databaseCategory ||
    !learningCategory
  ) {
    throw new Error("Article categories were not found.");
  }

  const articles = [
    {
      slug: "designing-a-structured-portfolio-content-model",
      title: "Designing a Structured Portfolio Content Model",
      excerpt:
        "How a portfolio can use relational data and structured content blocks without turning every page into hardcoded UI.",
      categoryId: engineeringCategory.id,
      status: "published" as const,
      featured: true,
      publishedAt: new Date("2026-09-05T10:00:00Z"),
      seoTitle:
        "Designing a Structured Portfolio Content Model",
      seoDescription:
        "Exploring structured relational content for a production-oriented portfolio.",
      robotsIndex: true,
      robotsFollow: true,
      socialTitle:
        "Designing a Structured Portfolio Content Model",
      socialDescription:
        "A practical approach to structured portfolio content.",
    },
    {
      slug: "why-postgresql-is-the-content-source-of-truth",
      title: "Why PostgreSQL Is the Content Source of Truth",
      excerpt:
        "A look at why structured relational data can be a strong foundation for a portfolio and publishing platform.",
      categoryId: databaseCategory.id,
      status: "published" as const,
      featured: false,
      publishedAt: new Date("2026-08-25T10:00:00Z"),
      seoTitle:
        "Why PostgreSQL Is the Content Source of Truth",
      seoDescription:
        "Understanding the role of PostgreSQL in a structured content platform.",
      robotsIndex: true,
      robotsFollow: true,
      socialTitle:
        "Why PostgreSQL Is the Content Source of Truth",
      socialDescription:
        "Why structured relational data matters for content systems.",
    },
    {
      slug: "learning-by-building-systems",
      title: "Learning by Building Systems",
      excerpt:
        "Why small practical experiments can expose the assumptions hidden behind software abstractions.",
      categoryId: learningCategory.id,
      status: "published" as const,
      featured: false,
      publishedAt: new Date("2026-08-10T10:00:00Z"),
      seoTitle: "Learning by Building Systems",
      seoDescription:
        "Notes on learning software engineering through practical systems experiments.",
      robotsIndex: true,
      robotsFollow: true,
      socialTitle: "Learning by Building Systems",
      socialDescription:
        "Learning software engineering through experiments.",
    },
  ];

  for (const item of articles) {
    await db
      .insert(article)
      .values(item)
      .onConflictDoUpdate({
        target: article.slug,
        set: {
          title: item.title,
          excerpt: item.excerpt,
          categoryId: item.categoryId,
          status: item.status,
          featured: item.featured,
          publishedAt: item.publishedAt,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          robotsIndex: item.robotsIndex,
          robotsFollow: item.robotsFollow,
          socialTitle: item.socialTitle,
          socialDescription: item.socialDescription,
          updatedAt: new Date(),
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 16. ARTICLE TAG RELATIONSHIPS
   * ------------------------------------------------------------
   */

  const articleRows = await db.select().from(article);
  const tagRows = await db.select().from(tag);

  const structuredArticle = articleRows.find(
    (item) =>
      item.slug ===
      "designing-a-structured-portfolio-content-model",
  );

  const postgresArticle = articleRows.find(
    (item) =>
      item.slug ===
      "why-postgresql-is-the-content-source-of-truth",
  );

  const learningArticle = articleRows.find(
    (item) => item.slug === "learning-by-building-systems",
  );

  const nextTag = tagRows.find(
    (item) => item.slug === "nextjs",
  );

  const postgresTag = tagRows.find(
    (item) => item.slug === "postgresql",
  );

  const drizzleTag = tagRows.find(
    (item) => item.slug === "drizzle",
  );

  const architectureTag = tagRows.find(
    (item) => item.slug === "architecture",
  );

  const typescriptTag = tagRows.find(
    (item) => item.slug === "typescript",
  );

  if (
    !structuredArticle ||
    !postgresArticle ||
    !learningArticle ||
    !nextTag ||
    !postgresTag ||
    !drizzleTag ||
    !architectureTag ||
    !typescriptTag
  ) {
    throw new Error("Article seed dependencies were not found.");
  }

  const articleTags = [
    {
      articleId: structuredArticle.id,
      tagId: nextTag.id,
    },
    {
      articleId: structuredArticle.id,
      tagId: drizzleTag.id,
    },
    {
      articleId: structuredArticle.id,
      tagId: architectureTag.id,
    },
    {
      articleId: postgresArticle.id,
      tagId: postgresTag.id,
    },
    {
      articleId: postgresArticle.id,
      tagId: architectureTag.id,
    },
    {
      articleId: learningArticle.id,
      tagId: typescriptTag.id,
    },
    {
      articleId: learningArticle.id,
      tagId: architectureTag.id,
    },
  ];

  for (const item of articleTags) {
    await db
      .insert(articleTag)
      .values(item)
      .onConflictDoNothing();
  }

  /*
   * ------------------------------------------------------------
   * 17. ARTICLE BLOCKS
   * ------------------------------------------------------------
   */

  await db
    .delete(articleBlock)
    .where(
      sql`${articleBlock.articleId} IN (
        ${structuredArticle.id},
        ${postgresArticle.id},
        ${learningArticle.id}
      )`,
    );

  const articleBlocks = [
    {
      articleId: structuredArticle.id,
      type: "heading",
      position: 0,
      data: {
        level: 2,
        text: "The problem with hardcoded content",
      },
    },
    {
      articleId: structuredArticle.id,
      type: "paragraph",
      position: 1,
      data: {
        text:
          "A portfolio eventually becomes more than a collection of static pages. Projects, articles, technologies, media, and relationships need to be managed independently from the presentation layer.",
      },
    },
    {
      articleId: structuredArticle.id,
      type: "heading",
      position: 2,
      data: {
        level: 2,
        text: "Relational structure",
      },
    },
    {
      articleId: structuredArticle.id,
      type: "paragraph",
      position: 3,
      data: {
        text:
          "The application keeps authoritative entities relational while using JSONB only where block-specific structure actually varies.",
      },
    },
    {
      articleId: structuredArticle.id,
      type: "callout",
      position: 4,
      data: {
        title: "Design principle",
        text:
          "Keep ownership, relationships, ordering, and references relational. Use JSONB for controlled block payloads.",
      },
    },
    {
      articleId: postgresArticle.id,
      type: "heading",
      position: 0,
      data: {
        level: 2,
        text: "Why relational data?",
      },
    },
    {
      articleId: postgresArticle.id,
      type: "paragraph",
      position: 1,
      data: {
        text:
          "Projects, articles, categories, tags, technologies, and skills have stable identities and relationships, making PostgreSQL a natural source of truth.",
      },
    },
    {
      articleId: postgresArticle.id,
      type: "comparison",
      position: 2,
      data: {
        columns: ["Approach", "Strength", "Tradeoff"],
        rows: [
          [
            "Hardcoded content",
            "Simple initially",
            "Difficult to manage as content grows",
          ],
          [
            "Generic JSON document",
            "Flexible",
            "Weak relational guarantees",
          ],
          [
            "Relational model",
            "Strong relationships and constraints",
            "Requires deliberate schema design",
          ],
        ],
      },
    },
    {
      articleId: learningArticle.id,
      type: "heading",
      position: 0,
      data: {
        level: 2,
        text: "Build small experiments",
      },
    },
    {
      articleId: learningArticle.id,
      type: "paragraph",
      position: 1,
      data: {
        text:
          "Systems concepts become easier to understand when the behavior can be observed directly rather than learned only through abstraction.",
      },
    },
    {
      articleId: learningArticle.id,
      type: "list",
      position: 2,
      data: {
        ordered: false,
        items: [
          "Start with a focused question.",
          "Build the smallest useful experiment.",
          "Measure what actually happens.",
          "Document the result.",
        ],
      },
    },
  ];

  await db.insert(articleBlock).values(articleBlocks);

  /*
   * ------------------------------------------------------------
   * 18. SKILL CATEGORIES
   * ------------------------------------------------------------
   */

  const skillCategories = [
    {
      name: "Frontend",
      slug: "frontend",
      description:
        "Technologies and concepts used for building user interfaces.",
      position: 0,
    },
    {
      name: "Backend",
      slug: "backend",
      description:
        "Server-side development, APIs, and application architecture.",
      position: 1,
    },
    {
      name: "Systems",
      slug: "systems",
      description:
        "Databases, operating systems, networking, and systems concepts.",
      position: 2,
    },
    {
      name: "DevOps & Tools",
      slug: "devops-tools",
      description:
        "Development tooling, version control, deployment, and infrastructure.",
      position: 3,
    },
  ];

  for (const item of skillCategories) {
    await db
      .insert(skillCategory)
      .values(item)
      .onConflictDoUpdate({
        target: skillCategory.slug,
        set: {
          name: item.name,
          description: item.description,
          position: item.position,
        },
      });
  }

  /*
   * ------------------------------------------------------------
   * 19. SKILLS
   * ------------------------------------------------------------
   */

  const skillCategoryRows = await db
    .select()
    .from(skillCategory);

  const frontend = skillCategoryRows.find(
    (item) => item.slug === "frontend",
  );

  const backend = skillCategoryRows.find(
    (item) => item.slug === "backend",
  );

  const systems = skillCategoryRows.find(
    (item) => item.slug === "systems",
  );

  const devops = skillCategoryRows.find(
    (item) => item.slug === "devops-tools",
  );

  if (!frontend || !backend || !systems || !devops) {
    throw new Error("Skill categories were not found.");
  }

  const skills = [
    {
      categoryId: frontend.id,
      name: "React",
      slug: "react",
      description: "Component-based UI development.",
      details:
        "Building reusable interfaces and understanding component architecture.",
      position: 0,
    },
    {
      categoryId: frontend.id,
      name: "Next.js",
      slug: "nextjs",
      description: "Full-stack React framework.",
      details:
        "Server rendering, routing, data access, and application architecture.",
      position: 1,
    },
    {
      categoryId: frontend.id,
      name: "TypeScript",
      slug: "typescript",
      description: "Typed JavaScript.",
      details:
        "Using types to improve correctness and maintainability.",
      position: 2,
    },
    {
      categoryId: backend.id,
      name: "Node.js",
      slug: "nodejs",
      description: "JavaScript runtime for server-side applications.",
      details:
        "Building backend logic and server-side application behavior.",
      position: 0,
    },
    {
      categoryId: backend.id,
      name: "PostgreSQL",
      slug: "postgresql",
      description: "Relational database system.",
      details:
        "Relational modeling, constraints, indexes, and SQL.",
      position: 1,
    },
    {
      categoryId: backend.id,
      name: "Drizzle ORM",
      slug: "drizzle-orm",
      description: "TypeScript ORM for SQL databases.",
      details:
        "Schema-driven database access and migrations.",
      position: 2,
    },
    {
      categoryId: systems.id,
      name: "SQL",
      slug: "sql",
      description: "Relational database query language.",
      details:
        "Queries, joins, constraints, aggregation, and data modeling.",
      position: 0,
    },
    {
      categoryId: systems.id,
      name: "Linux",
      slug: "linux",
      description: "Operating system and development environment.",
      details:
        "Working with processes, services, filesystems, networking, and CLI tools.",
      position: 1,
    },
    {
      categoryId: devops.id,
      name: "Git",
      slug: "git",
      description: "Distributed version control.",
      details:
        "Branches, commits, history, collaboration, and release workflows.",
      position: 0,
    },
    {
      categoryId: devops.id,
      name: "GitHub",
      slug: "github",
      description: "Code hosting and collaboration platform.",
      details:
        "Repositories, pull requests, issues, and project workflows.",
      position: 1,
    },
  ];

  for (const item of skills) {
    await db
      .insert(skill)
      .values(item)
      .onConflictDoUpdate({
        target: skill.slug,
        set: {
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          details: item.details,
          position: item.position,
        },
      });
  }

  console.log("Seeding complete.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });