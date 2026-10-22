export type ContactSubmissionDeleteResult = { id: string };
export type ContactSubmissionDeleteOutcome = {
  deleted: ContactSubmissionDeleteResult;
  cacheInvalidated: boolean;
  cacheInvalidationError?: unknown;
};

/** Confirms the committed delete before attempting cache invalidation. */
export async function deleteContactSubmissionAndInvalidate(
  id: string,
  deleteRecord: (id: string) => Promise<ContactSubmissionDeleteResult>,
  invalidate: () => void,
): Promise<ContactSubmissionDeleteOutcome> {
  const deleted = await deleteRecord(id);
  if (deleted.id !== id) throw new Error("DELETE_RESULT_MISMATCH");

  try {
    invalidate();
    return { deleted, cacheInvalidated: true };
  } catch (cacheInvalidationError) {
    return { deleted, cacheInvalidated: false, cacheInvalidationError };
  }
}
