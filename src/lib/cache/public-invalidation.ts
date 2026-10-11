import { revalidatePath, updateTag } from "next/cache";
import type { PublicInvalidationPlan } from "./public-invalidation-plan";

export function applyPublicInvalidation(plan: PublicInvalidationPlan) {
  for (const tag of plan.tags) updateTag(tag);
  for (const path of plan.paths) {
    if (path.includes("[slug]")) revalidatePath(path, "page");
    else if (path === "/(public)") revalidatePath(path, "layout");
    else revalidatePath(path);
  }
  for (const path of plan.layoutPaths ?? []) revalidatePath(path, "layout");
}
