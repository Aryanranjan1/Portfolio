const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const SECRET_PATTERN = /\b(password|secret|token|authorization)(\s*[:=]\s*)[^\s,;]+/gi;

type ErrorDiagnostics = {
  errorName: string;
  errorMessage: string;
  stackTrace?: string;
  cause?: ErrorDiagnostics;
};

export function getSafeErrorDiagnostics(error: unknown, sensitiveValues: string[] = [], causeDepth = 0): ErrorDiagnostics {
  if (!(error instanceof Error)) {
    return { errorName: "UnknownError", errorMessage: "Non-Error exception" };
  }

  const redact = (value: string, maxLength: number) => {
    let safe = value;
    for (const secret of [...new Set(sensitiveValues)].filter((item) => item.length >= 3).sort((a, b) => b.length - a.length)) {
      safe = safe.split(secret).join("[REDACTED]");
    }
    return safe
      .replace(URL_PATTERN, "[REDACTED_URL]")
      .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
      .replace(UUID_PATTERN, "[REDACTED_ID]")
      .replace(SECRET_PATTERN, "$1$2[REDACTED]")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .slice(0, maxLength);
  };

  const result: ErrorDiagnostics = {
    errorName: /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(error.name) ? error.name : "Error",
    errorMessage: redact(error.message || "Unspecified error", 1200),
  };
  if (error.stack) result.stackTrace = redact(error.stack, 4000);
  if (error.cause instanceof Error && causeDepth < 2) {
    result.cause = getSafeErrorDiagnostics(error.cause, sensitiveValues, causeDepth + 1);
  }
  return result;
}
