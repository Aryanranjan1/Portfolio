"use server";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { applyPublicInvalidation } from "@/lib/cache/public-invalidation";
import { aboutContentPlan } from "@/lib/cache/public-invalidation-plan";
import { mutateApplication } from "@/lib/convex-server";
import { createCertificate, deleteCertificate, reorderCertificates, updateCertificate, type CertificateInput } from "@/lib/convex/mutations/certificates";

type FieldErrors = Record<string, string>;
type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: FieldErrors };

function fieldError(fieldErrors: FieldErrors): ActionResult {
  return { success: false, error: "VALIDATION_ERROR", fieldErrors };
}

function validate(input: unknown): { data?: CertificateInput; fieldErrors?: FieldErrors } {
  const errors: FieldErrors = {};
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const required = (key: string, label: string, max: number) => {
    const raw = value[key];
    if (typeof raw !== "string" || !raw.trim()) { errors[key] = `${label} is required.`; return ""; }
    if (raw.trim().length > max) { errors[key] = `${label} must be ${max} characters or fewer.`; return ""; }
    return raw.trim();
  };
  const optional = (key: string, max: number) => {
    const raw = value[key];
    if (raw === null || raw === undefined || raw === "") return null;
    if (typeof raw !== "string" || raw.trim().length > max) { errors[key] = "Enter valid text within the length limit."; return null; }
    return raw.trim() || null;
  };
  const slug = required("slug", "Slug", 200);
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "Use lowercase letters, numbers, and hyphens.";
  const title = required("title", "Title", 200);
  const issuer = required("issuer", "Issuer", 200);
  const category = required("category", "Category", 100);
  const startDate = optional("startDate", 7);
  const endDate = optional("endDate", 7);
  for (const [key, date] of [["startDate", startDate], ["endDate", endDate]] as const) if (date && !/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) errors[key] = "Choose a valid month.";
  if (startDate && endDate && endDate < startDate) errors.endDate = "End date cannot be earlier than start date.";
  const credentialUrl = optional("credentialUrl", 2048);
  if (credentialUrl) { try { if (!["http:", "https:"].includes(new URL(credentialUrl).protocol)) throw new Error(); } catch { errors.credentialUrl = "Enter a valid verification URL."; } }
  const description = optional("description", 5000);
  const credentialId = optional("credentialId", 300);
  const status = value.status === "published" ? "published" : value.status === "draft" ? "draft" : null;
  if (!status) errors.status = "Choose Draft or Published.";
  const sortOrder = Number(value.sortOrder);
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) errors.sortOrder = "Enter a non-negative whole number.";
  const skills = Array.isArray(value.skills) ? value.skills : typeof value.skills === "string" ? value.skills.split(",") : [];
  const cleanedSkills = skills.map((skill) => typeof skill === "string" ? skill.trim() : "").filter(Boolean);
  if (cleanedSkills.length > 50 || cleanedSkills.some((skill) => skill.length > 100)) errors.skills = "Use up to 50 skills, each 100 characters or fewer.";
  const imageUrl = optional("imageUrl", 2048);
  const imageStorageId = optional("imageStorageId", 200);
  const imageAlt = optional("imageAlt", 1000);
  const pdfUrl = optional("pdfUrl", 2048);
  const pdfStorageId = optional("pdfStorageId", 200);
  const pdfName = optional("pdfName", 255);
  if (pdfName && (/[\/\\]/.test(pdfName) || /[\u0000-\u001f]/.test(pdfName))) errors.pdfName = "Enter a file name without a path.";
  const imageWidth = value.imageWidth == null || value.imageWidth === "" ? null : Number(value.imageWidth);
  const imageHeight = value.imageHeight == null || value.imageHeight === "" ? null : Number(value.imageHeight);
  const pdfSize = value.pdfSize == null || value.pdfSize === "" ? null : Number(value.pdfSize);
  for (const [key, number] of [["imageWidth", imageWidth], ["imageHeight", imageHeight], ["pdfSize", pdfSize]] as const) if (number !== null && (!Number.isSafeInteger(number) || number < 1)) errors[key] = "Upload a valid file.";
  const isSample = value.isSample === true || value.isSample === "true";
  if (status === "published") {
    if (!imageUrl || !imageStorageId) errors.imageUrl = "An image is required before publishing.";
    if (!imageWidth || !imageHeight) errors.imageUrl = "The image dimensions could not be read. Upload the image again.";
    if (!imageAlt) errors.imageAlt = "Image alt text is required before publishing.";
    if (!pdfUrl || !pdfStorageId || !pdfSize || !pdfName) errors.pdfUrl = "A verified PDF is required before publishing.";
  }
  if (Object.keys(errors).length) return { fieldErrors: errors };
  return { data: {
    slug, title, issuer, category, description, startDate, endDate,
    credentialId, credentialUrl, skills: cleanedSkills,
    imageUrl, imageStorageId, imageWidth, imageHeight, imageAlt, pdfUrl, pdfStorageId, pdfName, pdfSize,
    sortOrder, status: status!, isSample,
  } };
}

function failure(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "CONFLICT") return { success: false, error: message, fieldErrors: { slug: "That slug is already in use." } };
  return { success: false, error: message === "VALIDATION_ERROR" ? message : "SAVE_FAILED" };
}

async function cleanupReplaced(files?: { imageStorageId?: string | null; pdfStorageId?: string | null }) {
  for (const storageId of new Set([files?.imageStorageId, files?.pdfStorageId].filter((id): id is string => Boolean(id)))) {
    try { await mutateApplication("deleteStorageFile", { storageId }); } catch { /* The Convex cleanup job retries files tracked as pending. */ }
  }
}

function refreshPublic() {
  applyPublicInvalidation(aboutContentPlan());
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}

export async function saveCertificateAction(id: string | null, input: unknown): Promise<ActionResult> {
  await requireAdminAction();
  const validated = validate(input);
  if (!validated.data) return fieldError(validated.fieldErrors ?? {});
  try {
    const replaced = id ? await updateCertificate(id, validated.data) : await createCertificate(validated.data);
    await cleanupReplaced({
      imageStorageId: replaced.imageStorageId && replaced.imageStorageId !== validated.data.imageStorageId ? replaced.imageStorageId : null,
      pdfStorageId: replaced.pdfStorageId && replaced.pdfStorageId !== validated.data.pdfStorageId ? replaced.pdfStorageId : null,
    });
    refreshPublic();
    return { success: true };
  } catch (error) { return failure(error); }
}

export async function deleteCertificateAction(id: string): Promise<ActionResult> {
  await requireAdminAction();
  try { await cleanupReplaced(await deleteCertificate(id)); refreshPublic(); return { success: true }; }
  catch (error) { return failure(error); }
}

export async function reorderCertificatesAction(ids: string[]): Promise<ActionResult> {
  await requireAdminAction();
  try { await reorderCertificates(ids); refreshPublic(); return { success: true }; }
  catch (error) { return failure(error); }
}
