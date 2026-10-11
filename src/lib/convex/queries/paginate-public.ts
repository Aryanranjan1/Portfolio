import { readPublic } from "@/lib/convex-read";
import { collectPublicPages } from "./collect-pages";
export { collectPublicPages } from "./collect-pages";

type PublicPage<T> = { page: T[]; continueCursor: string; isDone: boolean };

export async function readAllPublicPages<T>(collection: string): Promise<T[]> {
  return collectPublicPages((cursor) => readPublic<PublicPage<T>>("contentPage", { collection, cursor, numItems: 100 }));
}
