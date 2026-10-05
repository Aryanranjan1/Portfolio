export function resolveResumeUrl(resume: { url: string } | null | undefined): string | null {
  return resume?.url || null;
}
