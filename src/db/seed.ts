import { inArray, sql } from "drizzle-orm";
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
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed cannot run in production.");
  }
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
      primaryEmail: "",
      siteDescription:
        "Personal portfolio of Aryan Ranjan, featuring software projects, technical writing, and development work.",
      canonicalOrigin: "",
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
        primaryEmail: "",
        siteDescription:
          "Personal portfolio of Aryan Ranjan, featuring software projects, technical writing, and development work.",
        canonicalOrigin: "",
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
      value: null,
      url: null,
      position: 0,
      active: false,
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
      url: null,
      position: 2,
      active: false,
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
      storageKey: "development/hero.png",
      url: "/hero.png",
      filename: "hero.png",
      mimeType: "image/png",
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
    {
      id: "00000000-0000-7000-0000-000000000003",
      storageKey: "development/blog-portfolio-content-model.jpg",
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
      filename: "blog-portfolio-content-model.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: null,
      width: 1600,
      height: 1067,
      altText: "Developer working on a portfolio content system",
    },
    {
      id: "00000000-0000-7000-0000-000000000004",
      storageKey: "development/blog-postgresql-source-of-truth.jpg",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
      filename: "blog-postgresql-source-of-truth.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: null,
      width: 1600,
      height: 1067,
      altText: "Server infrastructure representing a database system",
    },
    {
      id: "00000000-0000-7000-0000-000000000005",
      storageKey: "development/blog-learning-systems.jpg",
      url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
      filename: "blog-learning-systems.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: null,
      width: 1600,
      height: 1067,
      altText: "Laptop and workspace for learning software systems",
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
        content:
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
        content:
          "The application uses a structured PostgreSQL content model with server-side public reads and protected administrative mutations.",
      },
    },
    {
      projectSectionId: portfolioBuild!.id,
      type: "technology_list",
      position: 0,
      data: {
        items: [
          "nextjs",
          "typescript",
          "postgresql",
          "drizzle-orm",
          "react",
          "tailwind-css",
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
        ].map((description, index) => ({ title: `Step ${index + 1}`, description })),
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
        ].map((description, index) => ({ phase: `0${index + 1}`, title: `Phase ${index + 1}`, description })),
      },
    },
    {
      projectSectionId: systemsAbout!.id,
      type: "rich_text",
      position: 0,
      data: {
        content:
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
        ].map((description, index) => ({ title: `Step ${index + 1}`, description })),
      },
    },
    {
      projectSectionId: systemsResults!.id,
      type: "callout",
      position: 0,
      data: {
        title: "Learning outcome",
        content:
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
      socialImageId: "00000000-0000-7000-0000-000000000003",
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
      socialImageId: "00000000-0000-7000-0000-000000000004",
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
      socialImageId: "00000000-0000-7000-0000-000000000005",
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



  /*
   * ------------------------------------------------------------
   * 20. BLOG DEVELOPMENT CONTENT
   * ------------------------------------------------------------
   *
   * Development-only expansion of the article dataset.
   *
   * IMPORTANT:
   * - This section NEVER clears the article table.
   * - Articles are upserted by slug.
   * - Media is upserted by storageKey.
   * - Article blocks are deleted/recreated ONLY for these 25 slugs.
   * - Existing projects, settings, skills, contacts, and unrelated
   *   production/content rows are left untouched.
   */

  const blogCategories = [
    {
      name: "Web Development",
      slug: "web-dev",
      description: "Frontend, full-stack web development, and application architecture.",
    },
    {
      name: "System Design",
      slug: "system-design",
      description: "Architecture, scalability, reliability, and software design.",
    },
    {
      name: "DevOps",
      slug: "devops",
      description: "Development environments, deployment, operations, and observability.",
    },
    {
      name: "Computer Science",
      slug: "cs",
      description: "Computer science fundamentals and problem-solving concepts.",
    },
    {
      name: "Career",
      slug: "career",
      description: "Learning, engineering habits, and professional development.",
    },
    {
      name: "Life",
      slug: "life",
      description: "Personal notes about learning, building, and the life around software.",
    },
  ];

  for (const item of blogCategories) {
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

  const allArticleCategories = await db
    .select()
    .from(articleCategory);

  const categoryBySlug = new Map<string, string>(
    allArticleCategories.map((item) => [item.slug, item.id] as [string, string]),
  );

  const blogTags = [
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Drizzle", slug: "drizzle" },
    { name: "Architecture", slug: "architecture" },
    { name: "System Design", slug: "system-design" },
    { name: "Databases", slug: "databases" },
    { name: "Docker", slug: "docker" },
    { name: "Linux", slug: "linux" },
    { name: "Git", slug: "git" },
    { name: "Performance", slug: "performance" },
    { name: "Debugging", slug: "debugging" },
    { name: "Learning", slug: "learning" },
    { name: "DevOps", slug: "devops" },
    { name: "Career", slug: "career" },
  ];

  for (const item of blogTags) {
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

  const blogMedia = [
    ["00000000-0000-7000-0000-000000000006", "blog-01.jpg", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80", "Developer working with code on a computer"],
    ["00000000-0000-7000-0000-000000000007", "blog-02.jpg", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80", "Analytics dashboard on a computer screen"],
    ["00000000-0000-7000-0000-000000000008", "blog-03.jpg", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80", "Code editor showing software development"],
    ["00000000-0000-7000-0000-000000000009", "blog-04.jpg", "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1600&q=80", "Modern interface design on a laptop"],
    ["00000000-0000-7000-0000-000000000010", "blog-05.jpg", "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1600&q=80", "Web interface displayed on a monitor"],
    ["00000000-0000-7000-0000-000000000011", "blog-06.jpg", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80", "Developers collaborating around computers"],
    ["00000000-0000-7000-0000-000000000012", "blog-07.jpg", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80", "Programming code displayed across screens"],
    ["00000000-0000-7000-0000-000000000013", "blog-08.jpg", "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80", "Laptop on a dark workspace"],
    ["00000000-0000-7000-0000-000000000014", "blog-09.jpg", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80", "Vintage computer hardware"],
    ["00000000-0000-7000-0000-000000000015", "blog-10.jpg", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80", "Abstract network and technology concept"],
    ["00000000-0000-7000-0000-000000000016", "blog-11.jpg", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80", "Rows of server infrastructure"],
    ["00000000-0000-7000-0000-000000000017", "blog-12.jpg", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80", "Computer motherboard and hardware"],
    ["00000000-0000-7000-0000-000000000018", "blog-13.jpg", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80", "Developer workspace with code"],
    ["00000000-0000-7000-0000-000000000019", "blog-14.jpg", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80", "Team working together in an office"],
    ["00000000-0000-7000-0000-000000000020", "blog-15.jpg", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80", "Laptop and notebook on a desk"],
    ["00000000-0000-7000-0000-000000000021", "blog-16.jpg", "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1600&q=80", "Server and networking equipment"],
    ["00000000-0000-7000-0000-000000000022", "blog-17.jpg", "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1600&q=80", "Code on a developer monitor"],
    ["00000000-0000-7000-0000-000000000023", "blog-18.jpg", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80", "Software code on a laptop"],
    ["00000000-0000-7000-0000-000000000024", "blog-19.jpg", "https://images.unsplash.com/photo-1504639725590-34d0984388fb?auto=format&fit=crop&w=1600&q=80", "Programming editor with colorful syntax"],
    ["00000000-0000-7000-0000-000000000025", "blog-20.jpg", "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80", "People collaborating around a table"],
    ["00000000-0000-7000-0000-000000000026", "blog-21.jpg", "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80", "Team meeting in a workspace"],
    ["00000000-0000-7000-0000-000000000027", "blog-22.jpg", "https://images.unsplash.com/photo-1551033406-611cf9a28f4a?auto=format&fit=crop&w=1600&q=80", "Developer working at a desk"],
    ["00000000-0000-7000-0000-000000000028", "blog-23.jpg", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80", "Collaborative engineering workspace"],
    ["00000000-0000-7000-0000-000000000029", "blog-24.jpg", "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80", "Laptop with software development tools"],
    ["00000000-0000-7000-0000-000000000030", "blog-25.jpg", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80", "Software team collaborating on computers"],
  ].map(([id, filename, url, altText]) => ({
    id,
    storageKey: `development/${filename}`,
    url,
    filename,
    mimeType: "image/jpeg",
    fileSizeBytes: null,
    width: 1600,
    height: 1067,
    altText,
  }));

  for (const item of blogMedia) {
    await db
      .insert(media)
      .values(item)
      .onConflictDoUpdate({
        target: media.storageKey,
        set: {
          url: item.url,
          filename: item.filename,
          mimeType: item.mimeType,
          width: item.width,
          height: item.height,
          altText: item.altText,
          updatedAt: new Date(),
        },
      });
  }

  type BlogSeed = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    publishedAt: string;
    imageId: string;
    featured?: boolean;
    tags: string[];
    intro: string;
    sections: Array<{
      heading: string;
      paragraphs: string[];
    }>;
    callout: string;
    list: string[];
  };

  const blogSeeds: BlogSeed[] = [
    {
      slug: "what-actually-happens-when-you-visit-a-website",
      title: "What Actually Happens When You Visit a Website",
      excerpt: "A request looks simple from the browser, but a surprising amount of software sits between typing a URL and seeing pixels.",
      category: "cs",
      publishedAt: "2026-09-12T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000006",
      featured: true,
      tags: ["learning", "linux", "architecture"],
      intro: "Typing a URL into a browser feels like one operation, but it is really a chain of decisions and network exchanges. The browser has to understand the address, discover where the server lives, establish a connection, negotiate how the request will be transported, send an HTTP request, receive a response, parse resources, and finally turn those resources into a visual document. The interesting part is that every layer has a different job. When something breaks, understanding those boundaries gives you a much better debugging strategy than simply refreshing the page and hoping.",
      sections: [
        {
          heading: "The request begins before HTTP",
          paragraphs: [
            "The first useful distinction is between naming and communication. A domain name is a human-friendly name, while an IP address identifies a destination on a network. DNS exists to connect those two worlds. The browser and operating system can also reuse cached answers, so a request does not necessarily start with a DNS lookup every time. That small optimization is a good example of a broader systems idea: expensive work is often avoided by remembering something that is unlikely to have changed.",
            "Once the destination is known, the browser still has to establish a connection. With HTTPS this includes cryptographic negotiation in addition to the transport itself. The details differ between HTTP versions, but the principle remains: before application data can be exchanged reliably, the lower layers have to establish the conditions under which that data can travel."
          ],
        },
        {
          heading: "Then the application finally gets involved",
          paragraphs: [
            "Only after those lower-level steps does the web application become the interesting part. The server receives an HTTP request containing a method, path, headers, and sometimes a body. A framework such as Next.js maps that request into application code. That code may read cookies, authenticate a user, query a database, render a server component, and return HTML or another representation. What feels like a single page request is therefore a traversal through several boundaries.",
            "The browser then parses the response and requests additional resources such as stylesheets, scripts, fonts, and images. Rendering is another pipeline of its own. Understanding that pipeline makes performance problems much easier to reason about because you can ask which stage is actually expensive instead of treating the entire page as one opaque operation."
          ],
        },
      ],
      callout: "A web request is not one operation. It is a sequence of contracts between layers.",
      list: ["Name the destination", "Establish communication", "Send the application request", "Execute server-side work", "Render the response"],
    },
    {
      slug: "server-components-changed-how-i-think-about-react",
      title: "Server Components Changed How I Think About React",
      excerpt: "Server Components are less about a new rendering trick and more about putting code on the side of the system where it belongs.",
      category: "web-dev",
      publishedAt: "2026-09-10T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000007",
      tags: ["react", "nextjs", "architecture"],
      intro: "React is often introduced as a library for building interactive interfaces, so it is natural to associate components with browser code. Server Components challenge that assumption. A component can exist primarily to assemble data and markup on the server without becoming JavaScript that the browser must download and execute. That distinction is useful because it forces a clearer question: which part of this interface actually needs a browser runtime?",
      sections: [
        {
          heading: "Rendering location is an architectural decision",
          paragraphs: [
            "If a component only reads data, formats it, and produces markup, sending its implementation to the browser can be unnecessary. Server rendering allows database access and other server-only operations to stay on the server boundary. The result is not merely smaller client code; it is a cleaner ownership model. Secrets, database connections, and privileged operations do not need to become concerns of interactive UI code.",
            "Client Components still matter. A form that reacts to keystrokes, a drag interaction, or a component using browser APIs has a legitimate reason to run in the browser. The useful mental model is therefore not server versus client as competing architectures, but server by default with carefully chosen client islands."
          ],
        },
        {
          heading: "The interesting part is the boundary",
          paragraphs: [
            "The hardest decision is often not how to write a component but where its responsibility should stop. A server component can fetch the data it needs and pass serializable information into a client component. This creates an explicit boundary between data acquisition and browser interaction. Once that boundary is visible, a lot of accidental complexity disappears.",
            "It also changes how I think about state. Not every piece of changing information needs React state. Search parameters, pagination, filters, and navigation state can often live in the URL. That makes the page address meaningful and lets the server remain the source of truth for rendering."
          ],
        },
      ],
      callout: "The goal is not to eliminate client code. The goal is to make every client-side dependency earn its place.",
      list: ["Start on the server", "Identify real browser requirements", "Create a small client boundary", "Keep privileged data access server-side"],
    },
    {
      slug: "designing-a-clean-data-boundary-in-nextjs",
      title: "Designing a Clean Data Boundary in Next.js",
      excerpt: "A page should know what data it needs without knowing how the database happens to store it.",
      category: "web-dev",
      publishedAt: "2026-09-08T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000008",
      tags: ["nextjs", "typescript", "drizzle", "architecture"],
      intro: "One of the easiest ways to make a full-stack application difficult to maintain is to let UI components become database clients. It usually starts innocently: import the database, write a query, map the result, and render it. Eventually several components contain slightly different versions of the same query. Changes to the schema now require hunting through the component tree. A data boundary is a simple way to prevent that coupling.",
      sections: [
        {
          heading: "The UI should ask for meaning",
          paragraphs: [
            "A blog page does not fundamentally care that articles live in PostgreSQL tables called article, article_category, and media. It cares that it needs published articles with a title, excerpt, category, publication date, and optional image. A query function can translate the database representation into that page-oriented shape.",
            "This does not mean hiding the database behind an enormous abstraction layer. The boundary can be a small function. The important property is ownership: database knowledge lives in the database layer, while presentation knowledge lives in the UI layer."
          ],
        },
        {
          heading: "Keep the boundary boring",
          paragraphs: [
            "A useful data boundary should be predictable. It should have a clear name, a clear return shape, and a clear responsibility. If a function called getPublishedArticles starts performing authentication, rendering, caching, and business workflows, the abstraction has become too broad.",
            "The best boundaries often look almost boring in code. That is a feature. They reduce the number of places where assumptions can hide and make testing easier because a page can be evaluated against a known data shape."
          ],
        },
      ],
      callout: "A data boundary is valuable because it makes ownership explicit, not because it adds another layer for its own sake.",
      list: ["Define the data the page actually needs", "Keep SQL inside the data layer", "Return a stable shape", "Avoid mixing rendering with persistence"],
    },
    {
      slug: "why-i-stopped-putting-database-queries-in-components",
      title: "Why I Stopped Putting Database Queries in Components",
      excerpt: "Direct database access inside UI components feels convenient until the same content is needed in five different places.",
      category: "databases",
      publishedAt: "2026-09-06T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000009",
      tags: ["postgresql", "drizzle", "architecture"],
      intro: "There is a seductive simplicity in putting a database query next to the JSX that consumes it. The code is close together and the first feature ships quickly. The cost appears later. A second page needs the same data, an admin screen needs a different version, a security rule changes, or the database schema evolves. Suddenly presentation components are coupled to persistence details everywhere.",
      sections: [
        {
          heading: "Coupling is the real problem",
          paragraphs: [
            "The issue is not that a SQL query inside a server component is inherently slow or technically impossible. The issue is that it gives the component two jobs. It must understand both how the interface should look and how the application's data is stored. Those concerns change for different reasons.",
            "When a query boundary exists, the component can instead receive data that describes its needs. The query layer can join tables, apply status rules, order records, and select only the fields required by the page. That makes the persistence decision local to one part of the system."
          ],
        },
        {
          heading: "A small boundary beats a giant repository",
          paragraphs: [
            "I do not think every application needs a giant repository pattern. For a portfolio, a handful of focused query modules is enough. getPublishedArticles can own public article retrieval while getArticleForAdmin can own the richer shape required by the admin interface. The names communicate intent without pretending the database does not exist.",
            "The practical benefit shows up during change. If the media relationship changes, the query boundary changes. If the card design changes, the component changes. The blast radius is smaller because the responsibilities are separated."
          ],
        },
      ],
      callout: "The goal is not abstraction. The goal is preventing unrelated reasons to change from sharing the same file.",
      list: ["UI owns presentation", "Queries own retrieval", "Mutations own writes", "Schemas own persistence structure"],
    },
    {
      slug: "understanding-the-app-router-through-first-principles",
      title: "Understanding the App Router Through First Principles",
      excerpt: "Instead of memorizing Next.js conventions, start with the problems routing, rendering, and layouts are solving.",
      category: "web-dev",
      publishedAt: "2026-09-04T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000010",
      tags: ["nextjs", "react", "learning"],
      intro: "Framework conventions become much easier to remember when they solve a problem you already understand. The App Router is a good example. Files and folders determine routes, layouts allow persistent UI, server components provide a server-first rendering model, and loading or error boundaries let parts of the interface have independent lifecycle behavior. The useful skill is not memorizing filenames. It is recognizing which problem each convention addresses.",
      sections: [
        {
          heading: "A route is an ownership boundary",
          paragraphs: [
            "A route answers a deceptively important question: what should happen when someone requests this URL? The page component owns that response, while nested layouts can own UI that should persist across several routes. This is more than organization. It creates a natural place to put data fetching, metadata, loading behavior, and errors associated with a particular part of the application.",
            "Route groups are useful because not every organizational boundary should become a URL segment. A public group and an admin group can have different layouts while preserving the URLs you actually want users to see."
          ],
        },
        {
          heading: "Server-first changes the default",
          paragraphs: [
            "The App Router also makes server execution a normal part of the component model. That means a page can await data directly rather than inventing a browser request to its own backend. The important architectural question becomes where the data originates and where it is consumed, not whether every feature needs an API endpoint.",
            "Once that is understood, client components become focused tools rather than the default container for the entire page. A page can remain server-rendered while one interactive search control or accordion becomes a small client island."
          ],
        },
      ],
      callout: "Framework conventions are easier to remember when you can explain the problem they solve.",
      list: ["Route = URL ownership", "Layout = persistent structure", "Server component = server-side composition", "Client component = browser interaction"],
    },
    {
      slug: "postgresql-indexes-what-they-actually-buy-you",
      title: "PostgreSQL Indexes: What They Actually Buy You",
      excerpt: "An index is not a magic performance switch. It is an additional data structure with a cost and a specific access pattern it can accelerate.",
      category: "databases",
      publishedAt: "2026-09-02T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000011",
      tags: ["postgresql", "databases", "performance"],
      intro: "Indexes are often described as making database queries faster, which is true but incomplete. An index gives PostgreSQL another way to locate rows without scanning the entire table. The database must maintain that structure when rows change, and the query planner must decide whether using it is actually cheaper than another strategy. Thinking in those terms prevents the common mistake of adding indexes everywhere just because a column appears in a query.",
      sections: [
        {
          heading: "Indexes optimize access patterns",
          paragraphs: [
            "Suppose a table contains a large number of articles and public pages repeatedly ask for rows with status equal to published. An index on status can make finding matching rows cheaper in some workloads. But if almost every row is published, the selectivity may be poor and a sequential scan can still be reasonable. The index only helps when it matches the actual distribution and query pattern.",
            "Composite indexes add another dimension. If a query filters by status and orders by publication time, an index designed around that access pattern can be more useful than two unrelated single-column indexes. The correct design comes from observing the query, not from memorizing a list of columns that are usually indexed."
          ],
        },
        {
          heading: "Indexes are not free",
          paragraphs: [
            "Every index consumes storage and creates additional work when rows are inserted, updated, or deleted. A database with dozens of speculative indexes can therefore become harder to write to while providing little benefit to reads. The planner also has more possible strategies to consider.",
            "For a small portfolio database, the right approach is usually conservative: index obvious lookup and ordering paths, then measure when the dataset becomes large enough for performance concerns to become real."
          ],
        },
      ],
      callout: "An index should answer a specific question: which access pattern is this structure making cheaper?",
      list: ["Identify the query", "Understand selectivity", "Consider ordering", "Measure before adding speculative indexes"],
    },
    {
      slug: "designing-relationships-instead-of-json-blobs",
      title: "Designing Relationships Instead of JSON Blobs",
      excerpt: "Flexible data is useful, but flexibility should not erase relationships that the database can enforce for you.",
      category: "databases",
      publishedAt: "2026-08-30T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000012",
      tags: ["postgresql", "drizzle", "architecture"],
      intro: "JSON is incredibly useful, especially when a payload has controlled structure that genuinely varies by type. The problem begins when JSON becomes the default answer for every relationship. Authors, categories, tags, projects, technologies, and media all have identities and relationships that databases are very good at representing. Hiding those relationships inside arbitrary documents gives up useful guarantees in exchange for flexibility that may not actually be needed.",
      sections: [
        {
          heading: "Stable identity deserves a table",
          paragraphs: [
            "If two articles can belong to the same category, that category has an identity independent of either article. Representing categoryId as a foreign key gives the database a chance to enforce that relationship. The same principle applies to many-to-many relationships such as articles and tags. A join table makes the relationship explicit and queryable.",
            "This structure also makes future changes safer. Renaming a category does not require scanning arbitrary JSON documents for duplicated strings. One row changes, and every relationship continues to point to the same identity."
          ],
        },
        {
          heading: "Use JSON where variation is real",
          paragraphs: [
            "Structured content blocks are a good example of an appropriate JSON boundary. A callout might have a title and text, while a comparison might have columns and rows. Those payloads vary by block type, but the article owning the block, its position, and the block type are still relational facts.",
            "This hybrid approach is more useful than either extreme. A completely rigid relational model can become awkward for genuinely variable presentation data, while a giant JSON document makes stable relationships difficult to enforce."
          ],
        },
      ],
      callout: "Relational data should own identity and relationships; JSON should own controlled variation.",
      list: ["Give stable entities stable identities", "Use foreign keys for relationships", "Use join tables for many-to-many data", "Reserve JSON for variable block payloads"],
    },
    {
      slug: "transactions-the-problem-they-actually-solve",
      title: "Transactions: The Problem They Actually Solve",
      excerpt: "Transactions are about keeping a group of database changes consistent when partial success would leave invalid state.",
      category: "databases",
      publishedAt: "2026-08-28T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000013",
      tags: ["postgresql", "databases", "architecture"],
      intro: "A transaction is often introduced with the phrase all-or-nothing, but that is only the beginning. The deeper idea is that several operations should behave as one unit from the perspective of consistency. If a workflow creates an order, reserves inventory, and records payment state, allowing only the first two operations to succeed can produce data that is difficult to repair. Transactions give the database a mechanism for defining the boundary of that unit.",
      sections: [
        {
          heading: "Atomicity is about partial failure",
          paragraphs: [
            "Imagine inserting a parent row and then several child rows. If the parent succeeds but one child insert fails because of a constraint, the application may be left with incomplete state. A transaction allows the entire set of changes to be rolled back so the database returns to its previous consistent state.",
            "This does not mean every function should automatically run inside a transaction. A transaction has a scope, and the scope should correspond to a business operation whose intermediate states should not become visible as committed data."
          ],
        },
        {
          heading: "Transactions do not replace good design",
          paragraphs: [
            "A transaction cannot fix an incorrect data model. It can guarantee that the operations you chose happen atomically, but if the model permits contradictory states, the transaction will faithfully commit those contradictions. Constraints and transaction boundaries work together.",
            "Long-running transactions can also create contention and operational problems. The goal is not to keep a transaction open as long as possible; it is to keep the consistency boundary large enough to protect the operation and small enough to remain practical."
          ],
        },
      ],
      callout: "Use a transaction when partial success would create a state your application cannot safely represent.",
      list: ["Define the consistency boundary", "Perform related writes together", "Let constraints reject invalid state", "Keep transactions appropriately scoped"],
    },
    {
      slug: "database-constraints-are-part-of-application-logic",
      title: "Database Constraints Are Part of Your Application Logic",
      excerpt: "Validation in application code is useful, but the database should still protect invariants that must always be true.",
      category: "databases",
      publishedAt: "2026-08-26T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000014",
      tags: ["postgresql", "databases", "architecture"],
      intro: "It is tempting to treat the database as a passive storage layer and put all correctness rules in TypeScript. That works until another code path writes to the same database. Admin actions, background jobs, migrations, scripts, and future services can all bypass assumptions that existed in one application function. Constraints provide a lower boundary where important invariants can be enforced regardless of which application path performs the write.",
      sections: [
        {
          heading: "Application validation and database constraints do different jobs",
          paragraphs: [
            "Application validation gives users useful feedback before a write happens. A database constraint gives the system a final guarantee. A unique slug, a non-null category, or a foreign key relationship should not depend solely on a particular request handler remembering to check it.",
            "The two layers complement each other. Application validation can explain what is wrong. Database constraints ensure that invalid state does not become durable even when another code path makes a mistake."
          ],
        },
        {
          heading: "Constraints make assumptions executable",
          paragraphs: [
            "A schema becomes much more valuable when its important assumptions are encoded. Instead of documenting that an article must have a category and hoping every developer remembers it, the foreign key can enforce the relationship. Instead of hoping slugs remain unique, the unique constraint can enforce it.",
            "This is one reason database design is application design. The schema does not merely describe where bytes go. It defines which states the system is willing to store."
          ],
        },
      ],
      callout: "If an invariant must always hold, ask whether the database should be able to enforce it.",
      list: ["Use validation for user feedback", "Use constraints for durable invariants", "Protect relationships with foreign keys", "Protect identity with unique constraints"],
    },
    {
      slug: "how-i-think-about-database-schema-design",
      title: "How I Think About Database Schema Design",
      excerpt: "Schema design becomes clearer when you start from entities, relationships, constraints, and query patterns rather than tables alone.",
      category: "databases",
      publishedAt: "2026-08-24T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000015",
      tags: ["postgresql", "drizzle", "architecture"],
      intro: "When I start a schema, I try not to begin by asking which tables I need. I begin by asking what the system knows, which things have independent identity, how those things relate, and which states must never exist. Tables emerge from those answers. This approach is slower for the first ten minutes and usually faster over the lifetime of the project because the model starts from domain facts rather than implementation convenience.",
      sections: [
        {
          heading: "Start with entities and ownership",
          paragraphs: [
            "An entity is something the system needs to identify independently. In a publishing system, an article, category, tag, and media item each have different lifetimes and relationships. Asking who owns what prevents accidental duplication and clarifies where foreign keys should point.",
            "Ownership also helps define deletion behavior. If an article is removed, should its media disappear? Should a category disappear when it has no articles? Those are domain decisions, not merely SQL syntax choices."
          ],
        },
        {
          heading: "Then design around real queries",
          paragraphs: [
            "A perfectly normalized model can still be awkward if the application's important queries are unclear. I therefore look at the pages and workflows the system actually needs. A public article list needs published records ordered by date. An article page needs a slug lookup and related content. The schema and indexes should support those paths directly.",
            "The result is a model that balances integrity and practical access patterns. The database is neither an abstract academic exercise nor a pile of columns shaped around today's UI."
          ],
        },
      ],
      callout: "A good schema represents domain facts first and application access patterns second, without ignoring either.",
      list: ["Identify entities", "Map relationships", "Define invariants", "List important queries", "Add indexes only for real access patterns"],
    },
    {
      slug: "what-a-postgresql-query-is-really-doing",
      title: "What a PostgreSQL Query Is Really Doing",
      excerpt: "A SQL query is a request for a result, but PostgreSQL still has to decide how to produce that result efficiently.",
      category: "databases",
      publishedAt: "2026-08-22T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000016",
      tags: ["postgresql", "databases", "performance"],
      intro: "SQL lets us describe what data we want without manually describing every step the database should take. PostgreSQL then parses the query, checks types and relations, considers available indexes and statistics, and chooses an execution plan. Understanding this separation between declarative intent and execution strategy is one of the most useful database concepts to learn because it explains why two logically equivalent queries can behave differently.",
      sections: [
        {
          heading: "The planner chooses a strategy",
          paragraphs: [
            "For a simple query, PostgreSQL may scan a table, inspect rows, and return matches. For a larger query it may choose an index scan, combine several indexes, join tables using different algorithms, or sort intermediate results. The planner estimates the cost of these strategies using information about the data.",
            "That means reading SQL alone does not always tell you how expensive a query will be. When performance matters, the execution plan is evidence. It shows what PostgreSQL actually decided to do rather than what we imagine it is doing."
          ],
        },
        {
          heading: "Joins are not automatically bad",
          paragraphs: [
            "Joins sometimes get blamed for slow database applications, but a relational system is designed around relationships. A join between articles and categories is normal. The important questions are how many rows participate, which columns are indexed, how selective the filters are, and what the planner chooses.",
            "Trying to eliminate every join by duplicating data can create a worse system. Duplication introduces synchronization problems. A better approach is to understand the query, inspect its plan when necessary, and change the model only when there is evidence that the current shape is unsuitable."
          ],
        },
      ],
      callout: "When a query is slow, inspect the database's plan before guessing about what it must be doing.",
      list: ["Read the query as intent", "Inspect the execution plan", "Check row estimates", "Check indexes and joins", "Measure before rewriting"],
    },
    {
      slug: "normalization-without-cargo-culting",
      title: "Normalization Without Cargo Culting",
      excerpt: "Normalization is useful because it reduces contradictory copies of facts, not because every database must maximize table count.",
      category: "databases",
      publishedAt: "2026-08-20T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000017",
      tags: ["postgresql", "databases", "architecture"],
      intro: "Database normalization can be taught as a list of normal forms, but the practical idea is easier: do not store the same fact in multiple independent places unless you have a deliberate reason to do so. If an article category name is copied into every article row, changing the category name creates a synchronization problem. A separate category entity gives the fact one authoritative home.",
      sections: [
        {
          heading: "The enemy is contradictory state",
          paragraphs: [
            "Duplication is not automatically wrong. Sometimes a system intentionally stores derived or denormalized data because reading it repeatedly is expensive. The danger appears when two copies are treated as equally authoritative and can diverge.",
            "Normalization therefore starts with ownership. Ask where a fact belongs and which other records should reference it. Once that is clear, normalization becomes a way of expressing the ownership structure rather than a checklist to satisfy for its own sake."
          ],
        },
        {
          heading: "Denormalization should have a reason",
          paragraphs: [
            "If a read-heavy system repeatedly needs a costly aggregation, storing a derived value can be reasonable. But the tradeoff should be explicit: writes become more complicated because the derived representation has to stay correct.",
            "For a portfolio application, premature denormalization would add complexity without solving a real bottleneck. A straightforward relational model is easier to understand, migrate, and debug while the dataset is small."
          ],
        },
      ],
      callout: "Normalize to establish ownership and consistency; denormalize only when a measured access problem justifies the tradeoff.",
      list: ["Find the authoritative fact", "Avoid accidental duplicate ownership", "Measure before denormalizing", "Document derived data when you introduce it"],
    },
    {
      slug: "why-caching-is-a-consistency-problem",
      title: "Why Caching Is a Consistency Problem",
      excerpt: "Caching can make a system faster, but the moment you cache data you also create another copy whose freshness must be managed.",
      category: "system-design",
      publishedAt: "2026-08-18T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000018",
      tags: ["system-design", "performance", "architecture"],
      intro: "Caching is often introduced as a performance optimization, but the deeper problem is consistency. The moment a value exists in both a primary database and a cache, the system has two representations of the same fact. A read can now be fast while being stale. The engineering question is not simply how to make the cache fast. It is what freshness guarantee the application actually needs.",
      sections: [
        {
          heading: "A cache creates a second state",
          paragraphs: [
            "Suppose a blog article is cached for five minutes. An editor publishes a correction, but readers may continue seeing the previous value until the cache expires. That may be perfectly acceptable for a public blog. The same strategy could be unacceptable for account balances or permissions.",
            "This is why cache design starts with semantics. How stale can the data be? Who invalidates it? What happens if invalidation fails? Can the application tolerate a miss and fall back to the source? These questions define the design more than the choice of caching product."
          ],
        },
        {
          heading: "Do not cache problems that do not exist",
          paragraphs: [
            "A small portfolio database is unlikely to need a distributed cache merely because caching is considered a production technique. PostgreSQL can serve a modest dataset efficiently, and Next.js already has server-side rendering and caching primitives. Adding another system introduces operational complexity and another consistency boundary.",
            "The right time to introduce a cache is when measurements show that repeated computation or database access is a real bottleneck and the freshness tradeoff is understood."
          ],
        },
      ],
      callout: "Every cache is a consistency decision disguised as a performance decision.",
      list: ["Define freshness requirements", "Define invalidation", "Define fallback behavior", "Measure the bottleneck first"],
    },
    {
      slug: "debugging-a-database-query-from-the-outside-in",
      title: "Debugging a Database Query From the Outside In",
      excerpt: "Database errors become much easier when you stop changing code randomly and follow the failure through each boundary.",
      category: "career",
      publishedAt: "2026-08-16T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000019",
      tags: ["debugging", "postgresql", "learning"],
      intro: "A database error can appear in a page component even when the real problem is a stopped service, an incorrect connection string, a missing table, a migration mismatch, or a malformed query. The stack trace shows where the failure surfaced, not necessarily where the underlying assumption became false. Good debugging starts by reconstructing the path from the expected behavior to the actual behavior.",
      sections: [
        {
          heading: "Find the earliest broken boundary",
          paragraphs: [
            "If a page calls a query function and the query fails, first establish whether the database server is reachable. If it is reachable, establish which database the application connected to. If the connection works, inspect whether the expected tables exist. Only after those assumptions hold does it make sense to spend time on the SQL itself.",
            "This ordering prevents a common debugging failure mode: changing correct application code to compensate for a problem somewhere else. A database can be online while the wrong database is selected. A migration can be successful while the local database is stale. Evidence should narrow the search."
          ],
        },
        {
          heading: "Use logs as evidence",
          paragraphs: [
            "A good debugging session records what should happen, what actually happens, and what evidence supports the current hypothesis. That makes it possible to discard a hypothesis when a command contradicts it. Without that discipline, debugging becomes a sequence of guesses that happen to change several variables at once.",
            "The goal is not merely to make the error disappear. It is to identify the earliest meaningful divergence and understand why it occurred so that the same class of failure becomes easier to recognize next time."
          ],
        },
      ],
      callout: "The first visible error is not always the first meaningful failure.",
      list: ["Define expected behavior", "Capture actual behavior", "Check service availability", "Check connection and schema", "Then inspect the query"],
    },
    {
      slug: "what-docker-actually-solves",
      title: "What Docker Actually Solves",
      excerpt: "Containers are useful when environment consistency and process isolation solve a real problem, not because every project needs Docker.",
      category: "devops",
      publishedAt: "2026-08-14T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000020",
      tags: ["docker", "linux", "devops"],
      intro: "Docker is often introduced as a way to package an application, but the useful question is why packaging matters. A project can depend on a specific PostgreSQL version, operating system package, runtime, or command-line tool. If every developer installs those dependencies differently, the environment becomes part of the bug surface. Containers can make those dependencies explicit and reproducible.",
      sections: [
        {
          heading: "Isolation is the practical benefit",
          paragraphs: [
            "A container gives a process an isolated filesystem view, networking context, environment, and dependency set. It does not create a completely separate machine, but it provides enough isolation to make a service's assumptions more predictable.",
            "For a portfolio project, Docker can be particularly useful for PostgreSQL because the application can declare which database image and configuration it expects. A new development machine can reproduce the same environment without manually installing every dependency."
          ],
        },
        {
          heading: "Containers do not replace understanding",
          paragraphs: [
            "A container can be running while the application still cannot connect because the wrong port is exposed, the wrong hostname is used, or the database has not been initialized. Docker changes where the process runs; it does not remove the need to understand networking, processes, files, or configuration.",
            "That is why learning the underlying service first is valuable. Once the concepts are clear, Docker becomes a packaging and operational tool rather than a mysterious command sequence."
          ],
        },
      ],
      callout: "Docker is most useful when you can name the environment inconsistency or isolation problem it is solving.",
      list: ["Make dependencies reproducible", "Isolate services", "Document environment assumptions", "Still understand the underlying process"],
    },
    {
      slug: "environment-variables-are-not-configuration-magic",
      title: "Environment Variables Are Not Configuration Magic",
      excerpt: "Environment variables are a delivery mechanism for configuration; they do not automatically make configuration safe or well designed.",
      category: "devops",
      publishedAt: "2026-08-12T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000021",
      tags: ["devops", "nextjs", "architecture"],
      intro: "Environment variables are everywhere in modern applications, which can make them feel like a complete configuration system. They are not. They are simply one mechanism for providing values to a process at runtime. Good configuration design still requires deciding which values are secrets, which are public, which have safe defaults, which environments require different values, and what should happen when a required value is missing.",
      sections: [
        {
          heading: "Configuration has different kinds of values",
          paragraphs: [
            "A database password is fundamentally different from a public site origin. Treating both as generic strings hides an important security distinction. Server-only secrets should remain on the server boundary, while values intentionally exposed to browser code need a different handling model.",
            "Required configuration should also fail clearly. A missing database URL should produce an obvious startup or request error rather than silently falling back to a value that points at an unexpected database."
          ],
        },
        {
          heading: "The environment is part of the system",
          paragraphs: [
            "Development, preview, and production environments often need different values. That does not mean the application should contain dozens of conditional branches. The application should define a small configuration contract and let deployment supply the environment-specific values.",
            "Good configuration management therefore combines naming, validation, secret handling, and documentation. Environment variables are just one piece of that system."
          ],
        },
      ],
      callout: "An environment variable carries a value; your configuration design determines what that value means and who can see it.",
      list: ["Classify secrets", "Validate required values", "Keep server-only values server-side", "Document environment contracts"],
    },
    {
      slug: "understanding-processes-ports-and-services",
      title: "Understanding Processes, Ports, and Services",
      excerpt: "Many development environment problems become obvious once you understand the difference between a process, a port, and a service manager.",
      category: "devops",
      publishedAt: "2026-08-10T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000022",
      tags: ["linux", "devops", "debugging"],
      intro: "A surprising number of backend debugging sessions begin with a sentence like 'the database is running.' That statement can mean several different things. A service manager may report that a unit completed successfully while the actual database cluster is offline. A process can be alive without listening on the port you expect. A port can be open while the application is connected to a different host. Understanding these distinctions turns vague infrastructure problems into concrete checks.",
      sections: [
        {
          heading: "A process is not the same thing as a service",
          paragraphs: [
            "A process is an executing program. A service is a process or group of processes managed according to some operational contract. systemd can start a PostgreSQL cluster, but the top-level PostgreSQL service unit may behave differently from the cluster itself. This is why tools that inspect the actual cluster state can tell you more than one high-level status command.",
            "The same idea applies to application servers. Seeing a Node process does not prove that it is listening on the expected interface and port. The network endpoint is another fact that needs to be checked."
          ],
        },
        {
          heading: "Debug the boundary you actually depend on",
          paragraphs: [
            "If a web application needs PostgreSQL on localhost port 5432, the useful checks are whether the database is running, whether it is listening on that port, whether the configured credentials work, and whether the expected database exists. Each check eliminates a different class of failure.",
            "This layered approach is much faster than repeatedly restarting everything. Restarting can hide the evidence that would have told you what actually went wrong."
          ],
        },
      ],
      callout: "When a service is 'running', ask what exact process and network endpoint your application depends on.",
      list: ["Check the process", "Check the listening port", "Check the connection", "Check the application database", "Then inspect application queries"],
    },
    {
      slug: "what-happens-between-git-push-and-production",
      title: "What Happens Between git push and Production",
      excerpt: "A deployment is a chain of transformations from source code to a running process, and each transformation can introduce failure.",
      category: "devops",
      publishedAt: "2026-08-08T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000023",
      tags: ["git", "devops", "nextjs"],
      intro: "The phrase 'deploy the app' hides a lot of steps. Source code has to be selected, dependencies installed, environment configuration supplied, assets built, database migrations applied when appropriate, and a process started. A reliable deployment makes these steps explicit enough that a failure can be located rather than treated as one giant mysterious operation.",
      sections: [
        {
          heading: "Builds turn source into an artifact",
          paragraphs: [
            "A Git repository is source, not a running application. The deployment environment resolves dependencies, runs the framework build, creates generated output, and prepares the application for execution. If the build environment differs from development, a problem can appear even though the source code is unchanged.",
            "This is why reproducible dependency versions and a clearly defined build command matter. A deployment pipeline should make it possible to understand what artifact was produced from which source revision."
          ],
        },
        {
          heading: "Runtime is a separate problem",
          paragraphs: [
            "A successful build does not guarantee a successful runtime. The process still needs configuration, network access, database connectivity, filesystem permissions, and a way to receive traffic. Logs from the runtime environment are therefore as important as build logs.",
            "The more explicit these stages are, the easier it becomes to decide whether a failure belongs to source code, dependency resolution, build configuration, infrastructure, or runtime configuration."
          ],
        },
      ],
      callout: "A deployment pipeline is easier to debug when source, build, configuration, and runtime are treated as separate stages.",
      list: ["Select source", "Install dependencies", "Build artifact", "Apply required data changes", "Start runtime", "Verify endpoint"],
    },
    {
      slug: "logs-are-evidence-not-decoration",
      title: "Logs Are Evidence, Not Decoration",
      excerpt: "Useful logs help you reconstruct what the system believed and did at a specific moment.",
      category: "devops",
      publishedAt: "2026-08-06T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000024",
      tags: ["debugging", "devops", "linux"],
      intro: "A log line is valuable when it helps answer a question. 'Something went wrong' is technically a log, but it gives an engineer almost nothing to work with. Good logs establish context: what operation was happening, what resource was involved, what decision was made, and what error occurred. The goal is not maximum log volume. The goal is useful evidence.",
      sections: [
        {
          heading: "Context makes logs actionable",
          paragraphs: [
            "Consider a failed article query. A useful diagnostic might identify the operation, article identifier or route, and database error class without exposing secrets. That information lets an engineer connect an application symptom to a lower-level event.",
            "Structured logs can make this even easier because fields can be searched and aggregated. But structured logging does not automatically make logs useful. The event still needs the right context and a sensible severity level."
          ],
        },
        {
          heading: "Avoid logging everything",
          paragraphs: [
            "Dumping complete requests, tokens, cookies, database rows, or arbitrary objects can create security and privacy problems while making important events harder to find. Logging should be deliberate. Secrets should never become a debugging convenience.",
            "A mature logging strategy therefore asks what someone will need when the system behaves unexpectedly. That answer should shape the fields, not the desire to have more lines in a terminal."
          ],
        },
      ],
      callout: "The best log is not the longest one; it is the one that helps distinguish competing explanations.",
      list: ["Include useful context", "Choose meaningful severity", "Never log secrets", "Prefer searchable structure", "Log decisions and failures"],
    },
    {
      slug: "learning-systems-by-building-small-experiments",
      title: "Learning Systems by Building Small Experiments",
      excerpt: "When an abstraction feels magical, build a small experiment that exposes the mechanism underneath it.",
      category: "life",
      publishedAt: "2026-08-04T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000025",
      tags: ["learning", "linux", "debugging"],
      intro: "Reading documentation is useful, but some systems concepts remain fuzzy until you can observe them. A small experiment turns an abstract statement into evidence. Instead of merely reading that a database index changes query behavior, create a dataset and inspect the query plan. Instead of memorizing that processes listen on ports, start a tiny server and inspect the socket. The experiment does not need to be impressive. It needs to make one question observable.",
      sections: [
        {
          heading: "Start with a question, not a project",
          paragraphs: [
            "A common learning mistake is building too much infrastructure around a concept. If the question is how a cache changes response time, you do not need to build a distributed caching platform. A small program with two code paths can be enough. The smaller the experiment, the easier it is to understand what caused the observed behavior.",
            "The best experiments also make predictions possible. Before running the code, write down what you think will happen. The gap between prediction and observation is where learning becomes concrete."
          ],
        },
        {
          heading: "Change one variable at a time",
          paragraphs: [
            "If you change the database, query, network, and application simultaneously, a result tells you very little. Controlled experiments reduce the number of explanations. That is the same reasoning pattern used in debugging and performance work.",
            "Over time, these small experiments become a personal library of mental models. You stop memorizing isolated facts and start recognizing mechanisms because you have seen them behave directly."
          ],
        },
      ],
      callout: "If a concept feels magical, make one part of the mechanism observable.",
      list: ["Write one question", "Make a prediction", "Build the smallest experiment", "Measure the result", "Explain the difference"],
    },
    {
      slug: "big-o-is-about-growth-not-speed",
      title: "Big-O Is About Growth, Not Speed",
      excerpt: "Complexity analysis describes how resource usage grows as input grows; it does not predict the exact runtime of one machine.",
      category: "cs",
      publishedAt: "2026-08-02T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000026",
      tags: ["learning", "performance"],
      intro: "Big-O notation is often reduced to a ranking of algorithms, but its real value is more precise. It gives us a way to reason about how an algorithm's resource requirements scale with input size. An O(n) algorithm is not automatically faster than an O(n log n) algorithm for every small input, and an O(1) operation is not automatically the most important optimization in a program. Complexity is about growth.",
      sections: [
        {
          heading: "Ask what grows with the input",
          paragraphs: [
            "If an algorithm scans every element once, its work grows roughly in proportion to the number of elements. If it repeatedly divides the search space, the number of steps grows much more slowly. The notation abstracts away machine-specific constants so we can compare growth patterns.",
            "That abstraction is useful precisely because hardware changes. A benchmark measured on one laptop is evidence about one environment. Complexity gives us a more general statement about the algorithm itself."
          ],
        },
        {
          heading: "Complexity does not prove correctness",
          paragraphs: [
            "An incorrect O(1) algorithm is still incorrect. An O(n squared) brute-force solution can be valuable because it establishes a baseline and makes the problem easier to understand. Optimization should follow correctness rather than replace it.",
            "The same principle applies outside DSA. A highly optimized query that returns the wrong records is not a performance success. Engineering decisions need correctness, resource use, and real requirements considered together."
          ],
        },
      ],
      callout: "Complexity tells you how an algorithm scales. It does not tell you whether the algorithm solves the right problem.",
      list: ["Define the input size", "Count the dominant work", "Describe growth", "Check correctness separately", "Benchmark when constants matter"],
    },
    {
      slug: "how-i-approach-an-unfamiliar-codebase",
      title: "How I Approach an Unfamiliar Codebase",
      excerpt: "The fastest way to understand a project is usually to reconstruct its boundaries before reading every implementation detail.",
      category: "career",
      publishedAt: "2026-07-31T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000027",
      tags: ["learning", "architecture", "debugging"],
      intro: "Opening a large repository and reading files from top to bottom is rarely an efficient way to understand it. I prefer to reconstruct the system's boundaries first. What enters the application? Where are routes defined? Where does data come from? Where are mutations performed? Which parts run on the server and which run in the browser? Once those boundaries are visible, individual files become much easier to place in context.",
      sections: [
        {
          heading: "Start with the runtime path",
          paragraphs: [
            "Find the application entry points and follow one real user action through the system. A public page is a good starting point because it usually reveals routing, data access, rendering, and shared layout. An admin mutation can then show authentication, authorization, validation, and persistence.",
            "The point is to build one complete vertical slice rather than reading every module in isolation. A working mental model of one request is more useful than fifty disconnected facts about utility functions."
          ],
        },
        {
          heading: "Look for ownership boundaries",
          paragraphs: [
            "As you trace the request, ask which module owns each responsibility. If a component directly knows about SQL, if a mutation bypasses authorization, or if configuration is scattered across unrelated files, those are architectural signals. They are not necessarily bugs, but they tell you where assumptions live.",
            "Documentation becomes much more useful after you have this map. You can read a query file and immediately understand which boundary it belongs to instead of treating every file as an isolated puzzle."
          ],
        },
      ],
      callout: "Understand one complete path through the system before trying to understand every file.",
      list: ["Map entry points", "Trace one real request", "Identify data boundaries", "Identify mutation boundaries", "Record important assumptions"],
    },
    {
      slug: "the-difference-between-working-code-and-good-code",
      title: "The Difference Between Working Code and Good Code",
      excerpt: "Correctness is the first requirement, not the final definition of quality.",
      category: "career",
      publishedAt: "2026-07-29T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000028",
      tags: ["learning", "architecture", "typescript"],
      intro: "Code that works is valuable. But production engineering asks additional questions: can another developer understand it, can it fail safely, can the data remain consistent, can it be changed without surprising unrelated features, and can the system be operated when something goes wrong? Good code is not code with the most abstractions. It is code whose complexity is justified by the problem it solves.",
      sections: [
        {
          heading: "Correctness comes first",
          paragraphs: [
            "A beautiful abstraction that produces the wrong result is still a failure. That is why code review should begin with correctness and security before style. Once behavior is correct, maintainability and readability become meaningful because they affect how safely the system can evolve.",
            "This ordering also prevents teams from spending energy polishing code while missing a broken authorization check or a data integrity problem. Engineering quality has priorities."
          ],
        },
        {
          heading: "Simple code is not simplistic code",
          paragraphs: [
            "A small function can contain sophisticated reasoning while remaining easy to read. The goal is not to remove complexity that the problem genuinely requires. The goal is to avoid complexity that exists only because we introduced another abstraction, library, service, or pattern without a demonstrated need.",
            "When reviewing code, I therefore ask what problem each piece of complexity solves. If nobody can answer, it deserves another look."
          ],
        },
      ],
      callout: "Good engineering is not maximum abstraction. It is justified complexity around correct behavior.",
      list: ["Prove correctness", "Check security", "Protect data integrity", "Keep responsibilities clear", "Remove unjustified complexity"],
    },
    {
      slug: "why-productive-struggle-matters-when-learning-to-program",
      title: "Why Productive Struggle Matters When Learning to Program",
      excerpt: "The moment where an implementation does not work is often where the deepest understanding can be built.",
      category: "life",
      publishedAt: "2026-07-27T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000029",
      tags: ["learning", "career"],
      intro: "Programming is unusually good at exposing the difference between recognizing an explanation and being able to produce one. A tutorial can make a concept feel obvious while a blank editor makes the same concept difficult. That difficulty is not necessarily a sign that learning failed. It is often evidence that the knowledge has not yet become something you can retrieve and apply independently.",
      sections: [
        {
          heading: "Struggle needs structure",
          paragraphs: [
            "Productive struggle does not mean staring at an error for three hours without changing your approach. It means making hypotheses, testing them, narrowing the problem, and asking for progressively stronger hints when necessary. The goal is to keep the learner doing the reasoning while avoiding endless repetition of the same mistake.",
            "A good debugging process creates that structure naturally. What should happen? What actually happens? Where do those behaviors first diverge? Those questions turn frustration into an investigation."
          ],
        },
        {
          heading: "The explanation should eventually become yours",
          paragraphs: [
            "Getting a complete solution can be useful when a learner is genuinely stuck, but the useful part comes afterward. Can you explain why it works? Can you reproduce it without copying? Can you recognize the same pattern in a different problem? If not, the solution has been acquired but not fully learned.",
            "That is why I care about explanation as much as completion. The ability to reconstruct the reasoning is a stronger signal of understanding than having a working snippet in a repository."
          ],
        },
      ],
      callout: "The goal of struggle is not suffering. It is giving your own reasoning enough room to develop before replacing it.",
      list: ["Form a hypothesis", "Test it", "Use evidence", "Escalate help gradually", "Explain the final solution in your own words"],
    },
    {
      slug: "building-a-portfolio-that-shows-how-you-think",
      title: "Building a Portfolio That Shows How You Think",
      excerpt: "A project portfolio becomes more useful when it explains decisions, tradeoffs, failures, and lessons rather than only displaying screenshots.",
      category: "career",
      publishedAt: "2026-07-25T10:00:00Z",
      imageId: "00000000-0000-7000-0000-000000000030",
      tags: ["career", "architecture", "learning"],
      intro: "A portfolio can easily become a gallery of finished interfaces. That proves that something was built, but it says less about how the builder thinks. Technical projects become much more interesting when they explain the problem, the constraints, the architecture, the decisions that changed during implementation, and the things that did not work. The project becomes evidence of engineering reasoning rather than only evidence of visual output.",
      sections: [
        {
          heading: "Show decisions, not just technologies",
          paragraphs: [
            "A list of technologies is easy to produce. A useful project explanation answers why those technologies were chosen. Why PostgreSQL instead of another store? Why server-side data access? Why is one component interactive while another stays on the server? What constraint made the decision necessary? Those answers reveal judgment.",
            "Tradeoffs are especially valuable because real engineering rarely has a universally correct option. A portfolio can be honest about those tradeoffs without pretending every choice was perfect."
          ],
        },
        {
          heading: "Document the path, not only the destination",
          paragraphs: [
            "A polished final screenshot hides the debugging that made the result reliable. Writing about a database migration that failed, an architectural idea that was simplified, or a performance assumption that turned out to be wrong gives the reader evidence of how you respond to reality.",
            "That is also why a technical blog fits naturally beside a project portfolio. Projects show what was built. Writing shows how the builder reasons about the work. Together they provide a much richer picture than either one alone."
          ],
        },
      ],
      callout: "A strong portfolio does not try to look like you never made mistakes. It shows that you can learn from them and explain the reasoning.",
      list: ["Explain the problem", "Explain constraints", "Explain architectural decisions", "Show tradeoffs", "Document what changed after evidence"],
    },
  ];

  const blogArticles = blogSeeds.map((item) => {
    const categoryId = categoryBySlug.get(item.category);

    if (!categoryId) {
      throw new Error(`Blog category not found: ${item.category}`);
    }

    return {
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      categoryId,
      status: "published" as const,
      featured: item.featured ?? false,
      publishedAt: new Date(item.publishedAt),
      seoTitle: item.title,
      seoDescription: item.excerpt,
      robotsIndex: true,
      robotsFollow: true,
      socialTitle: item.title,
      socialDescription: item.excerpt,
      socialImageId: item.imageId,
    };
  });

  for (const item of blogArticles) {
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
          socialImageId: item.socialImageId,
          updatedAt: new Date(),
        },
      });
  }

  const seededBlogArticleRows = await db
    .select()
    .from(article);

  const seededBlogArticleMap = new Map<
    string,
    (typeof seededBlogArticleRows)[number]
  >(
    seededBlogArticleRows
      .filter((row) => blogSeeds.some((seed) => seed.slug === row.slug))
      .map((row) => [row.slug, row] as [string, (typeof seededBlogArticleRows)[number]]),
  );

  const allTags = await db.select().from(tag);
  const tagBySlug = new Map<string, string>(
    allTags.map((item) => [item.slug, item.id] as [string, string]),
  );

  const blogArticleTagRows: Array<{
    articleId: string;
    tagId: string;
  }> = [];

  for (const seed of blogSeeds) {
    const seededArticle = seededBlogArticleMap.get(seed.slug);

    if (!seededArticle) {
      throw new Error(`Blog article was not found after upsert: ${seed.slug}`);
    }

    for (const tagSlug of seed.tags) {
      const tagId = tagBySlug.get(tagSlug);

      if (!tagId) {
        throw new Error(
          `Blog tag was not found: ${tagSlug}. BlogSeed.tags must contain tag slugs, not display names.`,
        );
      }

      blogArticleTagRows.push({
        articleId: seededArticle.id,
        tagId,
      });
    }
  }

  for (const item of blogArticleTagRows) {
    await db
      .insert(articleTag)
      .values(item)
      .onConflictDoNothing();
  }

  const seededBlogArticleIds = Array.from(
    seededBlogArticleMap.values(),
  ).map((row) => row.id);

  if (seededBlogArticleIds.length > 0) {
    await db
      .delete(articleBlock)
      .where(inArray(articleBlock.articleId, seededBlogArticleIds));
  }

  const generatedBlogBlocks: Array<{
    articleId: string;
    type: string;
    position: number;
    data: Record<string, unknown>;
  }> = [];

  for (const seed of blogSeeds) {
    const seededArticle = seededBlogArticleMap.get(seed.slug);

    if (!seededArticle) {
      throw new Error(`Blog article block dependency missing: ${seed.slug}`);
    }

    let position = 0;

    generatedBlogBlocks.push({
      articleId: seededArticle.id,
      type: "heading",
      position: position++,
      data: {
        level: 2,
        text: "The starting point",
      },
    });

    generatedBlogBlocks.push({
      articleId: seededArticle.id,
      type: "paragraph",
      position: position++,
      data: {
        text: seed.intro,
      },
    });

    for (const section of seed.sections) {
      generatedBlogBlocks.push({
        articleId: seededArticle.id,
        type: "heading",
        position: position++,
        data: {
          level: 2,
          text: section.heading,
        },
      });

      for (const paragraph of section.paragraphs) {
        generatedBlogBlocks.push({
          articleId: seededArticle.id,
          type: "paragraph",
          position: position++,
          data: {
            text: paragraph,
          },
        });
      }
    }

    generatedBlogBlocks.push({
      articleId: seededArticle.id,
      type: "list",
      position: position++,
      data: {
        ordered: false,
        items: seed.list,
      },
    });

    generatedBlogBlocks.push({
      articleId: seededArticle.id,
      type: "callout",
      position: position++,
      data: {
        title: "Takeaway",
        text: seed.callout,
      },
    });
  }

  await db.insert(articleBlock).values(generatedBlogBlocks);

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
