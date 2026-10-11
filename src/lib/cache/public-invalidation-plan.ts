export type PublicInvalidationPlan = { paths: string[]; tags: string[]; layoutPaths?: string[] };

function unique(values: string[]) {
  return [...new Set(values)];
}

export function projectContentPlan(slugs: string[] = [], discovery = true): PublicInvalidationPlan {
  return {
    tags: ["public-projects"],
    paths: unique([
      "/", "/projects",
      ...slugs.filter(Boolean).map((slug) => `/projects/${slug}`),
      ...(discovery ? ["/sitemap.xml", "/llms.txt"] : []),
    ]),
  };
}

export function projectTaxonomyPlan(): PublicInvalidationPlan {
  return { tags: ["public-projects"], paths: ["/", "/projects", "/projects/[slug]"] };
}

export function articleContentPlan(slugs: string[] = [], discovery = true): PublicInvalidationPlan {
  return {
    tags: ["public-articles", "public-blog-index", "blog-index"],
    paths: unique([
      "/", "/blog",
      ...slugs.filter(Boolean).map((slug) => `/blog/${slug}`),
      ...(discovery ? ["/sitemap.xml", "/llms.txt"] : []),
    ]),
  };
}

export function articleTaxonomyPlan(): PublicInvalidationPlan {
  return { tags: ["public-articles", "public-blog-index", "blog-index"], paths: ["/", "/blog", "/blog/[slug]"] };
}

export function aboutContentPlan(): PublicInvalidationPlan {
  return { tags: ["public-about"], paths: ["/", "/about"] };
}

export function faqContentPlan(): PublicInvalidationPlan {
  return { tags: ["public-faq"], paths: ["/", "/contact"] };
}

export function contactContentPlan(): PublicInvalidationPlan {
  return { tags: ["public-contact"], paths: ["/(public)"], layoutPaths: ["/"] };
}

export function footerContentPlan(): PublicInvalidationPlan {
  return { tags: ["public-footer"], paths: ["/(public)"] };
}

export function siteContentPlan(): PublicInvalidationPlan {
  return {
    tags: ["public-site", "public-media"],
    paths: ["/sitemap.xml", "/llms.txt"],
    layoutPaths: ["/"],
  };
}

export function mediaContentPlan(referencedContentChanged = true): PublicInvalidationPlan {
  if (!referencedContentChanged) return { tags: ["public-media"], paths: [] };
  return {
    tags: ["public-media", "public-site", "public-projects", "public-articles", "public-blog-index", "blog-index", "public-about"],
    paths: ["/", "/projects", "/blog", "/about", "/projects/[slug]", "/blog/[slug]"],
  };
}

export async function runAfterSuccessfulMutation<T>(
  mutation: () => Promise<T>,
  invalidate: (result: T) => void | Promise<void>,
): Promise<T> {
  const result = await mutation();
  await invalidate(result);
  return result;
}
