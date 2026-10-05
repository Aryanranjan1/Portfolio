/* eslint-disable react/jsx-no-comment-textnodes */
import type { getPublishedProjectPage } from "@/db/queries/projects";

import styles from "../ProjectPage.module.css";
import ProjectMediaViewer from "./ProjectMediaViewer";

type Project = NonNullable<
  Awaited<ReturnType<typeof getPublishedProjectPage>>
>;

type Block =
  Project["sections"][number]["blocks"][number];

type Media = Project["media"][number];

type Technology = Project["technologies"][number];

type ProjectBlockRendererProps = {
  block: Block;
  media: Media[];
  technologies: Technology[];
};

export default function ProjectBlockRenderer({
  block,
  media,
  technologies,
}: ProjectBlockRendererProps) {
  const data = block.data as Record<
    string,
    unknown
  >;

  switch (block.type) {
    case "rich_text":
      return (
        <RichTextBlock
          data={data}
        />
      );

    case "quote":
      return (
        <QuoteBlock
          data={data}
        />
      );

    case "image":
      return (
        <ImageBlock
          data={data}
          media={media}
        />
      );

    case "gallery":
      return (
        <GalleryBlock
          data={data}
          media={media}
        />
      );

    case "problem_list":
      return (
        <ListBlock
          data={data}
          label="// THE PROBLEM"
        />
      );

    case "objective_list":
      return (
        <ListBlock
          data={data}
          label="// OBJECTIVES"
        />
      );

    case "technology_list":
      return (
        <TechnologyListBlock
          technologies={technologies}
        />
      );

    case "process_steps":
      return (
        <ProcessStepsBlock
          data={data}
        />
      );

    case "metrics":
      return (
        <MetricsBlock
          data={data}
        />
      );

    case "roadmap":
      return (
        <RoadmapBlock
          data={data}
        />
      );

    case "callout":
      return (
        <CalloutBlock
          data={data}
        />
      );

    default:
      return null;
  }
}

function RichTextBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const content = getString(
    data,
    "content",
  );

  if (!content) {
    return null;
  }

  return (
    <div className={styles.richText}>
      {content
        .split(/\n{2,}/)
        .map((paragraph, index) => (
          <p key={index}>
            {paragraph}
          </p>
        ))}
    </div>
  );
}

function QuoteBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const quote =
    getString(data, "quote") ||
    getString(data, "text");

  const author =
    getString(data, "author") ||
    getString(data, "by");

  if (!quote) {
    return null;
  }

  return (
    <figure className={styles.quoteBlock}>
      <blockquote>
        “{quote}”
      </blockquote>

      {author && (
        <figcaption>
          // {author}
        </figcaption>
      )}
    </figure>
  );
}

function ImageBlock({
  data,
  media,
}: {
  data: Record<string, unknown>;
  media: Media[];
}) {
  const mediaId = getString(
    data,
    "mediaId",
  );

  const image = mediaId
    ? media.find(
        (item) => item.mediaId === mediaId,
      )
    : undefined;

  if (!image?.url) {
    return null;
  }

  return (
    <ProjectMediaViewer
      media={[image]}
      variant="single"
    />
  );
}

function GalleryBlock({
  data,
  media,
}: {
  data: Record<string, unknown>;
  media: Media[];
}) {
  const mediaIds = getStringArray(
    data,
    "mediaIds",
  );

  const selectedMedia = mediaIds.length
    ? media.filter((item) =>
        mediaIds.includes(item.mediaId),
      )
    : media.filter(
        (item) =>
          item.role === "gallery",
      );

  if (selectedMedia.length === 0) {
    return null;
  }

  return (
    <ProjectMediaViewer
      media={selectedMedia}
      variant="gallery"
    />
  );
}

function ListBlock({
  data,
  label,
}: {
  data: Record<string, unknown>;
  label: string;
}) {
  const items =
    getStringArray(data, "items").length > 0
      ? getStringArray(data, "items")
      : getStringArray(data, "points");

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.listBlock}>
      <div className={styles.technicalLabel}>
        {label}
      </div>

      <div className={styles.numberedList}>
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={styles.numberedListItem}
          >
            <span>
              {String(index + 1).padStart(
                2,
                "0",
              )}
            </span>

            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnologyListBlock({
  technologies,
}: {
  technologies: Technology[];
}) {
  if (technologies.length === 0) {
    return null;
  }

  return (
    <div className={styles.technologyBlock}>
      <div className={styles.technicalLabel}>
        // TECHNOLOGY STACK
      </div>

      <div className={styles.technologyGrid}>
        {technologies.map((technology) => (
          <div
            key={technology.id}
            className={styles.technologyCard}
          >
            <span className={styles.technologyName}>
              {technology.name}
            </span>

            {technology.description && (
              <span
                className={
                  styles.technologyDescription
                }
              >
                {technology.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessStepsBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const rawSteps = Array.isArray(
    data.steps,
  )
    ? data.steps
    : [];

  const steps = rawSteps
    .map((step) => {
      if (
        typeof step !== "object" ||
        step === null
      ) {
        return null;
      }

      const value =
        step as Record<
          string,
          unknown
        >;

      return {
        title: getString(
          value,
          "title",
        ),
        description: getString(
          value,
          "description",
        ),
      };
    })
    .filter(
      (
        step,
      ): step is {
        title: string;
        description: string;
      } =>
        Boolean(
          step?.title ||
            step?.description,
        ),
    );

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={styles.processBlock}>
      {steps.map((step, index) => (
        <article
          key={`${step.title}-${index}`}
          className={styles.processStep}
        >
          <span
            className={
              styles.processStepNumber
            }
          >
            {String(index + 1).padStart(
              2,
              "0",
            )}
          </span>

          <div>
            <h3>
              {step.title}
            </h3>

            {step.description && (
              <p>
                {step.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function MetricsBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const rawMetrics = Array.isArray(
    data.metrics,
  )
    ? data.metrics
    : [];

  const metrics = rawMetrics
    .map((metric) => {
      if (
        typeof metric !== "object" ||
        metric === null
      ) {
        return null;
      }

      const value =
        metric as Record<
          string,
          unknown
        >;

      return {
        value:
          getString(value, "value") ||
          getString(value, "number"),

        label:
          getString(value, "label") ||
          getString(value, "title"),
      };
    })
    .filter(
      (
        metric,
      ): metric is {
        value: string;
        label: string;
      } =>
        Boolean(
          metric?.value ||
            metric?.label,
        ),
    );

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className={styles.metricsBlock}>
      {metrics.map((metric, index) => (
        <div
          key={`${metric.label}-${index}`}
          className={styles.metric}
        >
          <strong>
            {metric.value}
          </strong>

          <span>
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RoadmapBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const rawItems = Array.isArray(
    data.items,
  )
    ? data.items
    : Array.isArray(data.phases)
      ? data.phases
      : [];

  const items = rawItems
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const value =
        item as Record<
          string,
          unknown
        >;

      return {
        phase:
          getString(value, "phase") ||
          getString(value, "date") ||
          "",

        title:
          getString(value, "title") ||
          getString(value, "name") ||
          "",

        description:
          getString(
            value,
            "description",
          ) || "",
      };
    })
    .filter(
      (
        item,
      ): item is {
        phase: string;
        title: string;
        description: string;
      } =>
        Boolean(
          item?.title ||
            item?.description,
        ),
    );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.roadmap}>
      <div
        className={styles.roadmapLine}
        aria-hidden="true"
      />

      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className={styles.roadmapItem}
        >
          <div
            className={styles.roadmapDate}
          >
            {item.phase ||
              `Phase / ${String(
                index + 1,
              ).padStart(2, "0")}`}
          </div>

          <div
            className={styles.roadmapCopy}
          >
            <h3>
              {item.title}
            </h3>

            {item.description && (
              <p>
                {item.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function CalloutBlock({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const title =
    getString(data, "title") ||
    getString(data, "label");

  const content =
    getString(data, "content") ||
    getString(data, "text");

  if (!content && !title) {
    return null;
  }

  return (
    <aside className={styles.callout}>
      <div className={styles.technicalLabel}>
        {title
          ? `// ${title}`
          : "// CORE IDEA"}
      </div>

      {content && (
        <p>{content}</p>
      )}
    </aside>
  );
}

function getString(
  data: Record<string, unknown>,
  key: string,
): string {
  const value = data[key];

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getStringArray(
  data: Record<string, unknown>,
  key: string,
): string[] {
  const value = data[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}