export function validateContactSubmissionId(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > 255 ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return value;
}
