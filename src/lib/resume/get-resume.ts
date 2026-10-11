import "server-only";

import { cache } from "react";
import { getConfiguredResume } from "@/lib/convex/queries/site";
import { resolveResumeUrl } from "./resume-state";

export const getPublicResumeUrl = cache(async function getPublicResumeUrl(): Promise<string | null> {
  const resume = await getConfiguredResume();
  return resolveResumeUrl(resume);
});
