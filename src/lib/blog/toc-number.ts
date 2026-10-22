export function getDiscussionTocNumber(headingCount: number) {
  return String(Math.max(0, Math.trunc(headingCount)) + 1).padStart(2, "0");
}
