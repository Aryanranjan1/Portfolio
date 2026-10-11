type PublicPage<T> = { page: T[]; continueCursor: string; isDone: boolean };

export async function collectPublicPages<T>(fetchPage: (cursor: string | null) => Promise<PublicPage<T>>) {
  const items: T[] = [];
  let cursor: string | null = null;

  while (true) {
    const result = await fetchPage(cursor);
    items.push(...result.page);
    if (result.isDone) return items;
    if (!result.continueCursor || result.continueCursor === cursor) {
      throw new Error("Invalid pagination cursor for public content");
    }
    cursor = result.continueCursor;
  }
}
