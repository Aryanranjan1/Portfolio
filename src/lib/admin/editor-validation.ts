import { getBlockDataErrors } from "@/lib/blog/block-schema";
import { getProjectBlockDataErrors } from "@/lib/validation";

export type EditorFieldErrors = Record<string, string>;

function validWebUrl(value: string) {
  try { const url = new URL(value); return (url.protocol === "http:" || url.protocol === "https:") && !/(^|\.)example\.(com|org|net)$/i.test(url.hostname); }
  catch { return false; }
}

export function collectEditorErrors(form: HTMLFormElement, kind: "project" | "article"): EditorFieldErrors {
  const errors: EditorFieldErrors = {};
  const controls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input:not([type=hidden]), textarea, select")];
  controls.forEach((control, index) => {
    const path = control.dataset.validationPath ?? control.name ?? `field.${index}`;
    control.dataset.validationPath = path;
    const label = control.closest("label")?.querySelector("span")?.textContent?.trim() || path;
    if (control.required && !control.value.trim()) errors[path] = `${label} is required`;
    else if (control.type === "url" && control.value && !validWebUrl(control.value)) errors[path] = "Enter a valid URL";
    else if ("maxLength" in control && control.maxLength > 0 && control.value.length > control.maxLength) errors[path] = `${label} must be ${control.maxLength} characters or fewer`;
    else if (path === "slug" && control.value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(control.value.trim())) errors[path] = "Slug must contain only lowercase letters, numbers, and hyphens.";
    else if ((control.type === "number" || path === "year") && control.value) {
      const number = Number(control.value);
      if (!Number.isInteger(number) || (path === "year" && (number < 1900 || number > 2200))) errors[path] = path === "year" ? "Enter a year from 1900 to 2200" : "Enter a whole number";
    }
    const maxLengths: Record<string, number> = { title: 200, slug: 200, shortDescription: 500, description: 10000, projectType: 100, location: 200, excerpt: 1000, seoTitle: 200, seoDescription: 160, socialTitle: 200, socialDescription: 320 };
    if (!errors[path] && maxLengths[path] && control.value.length > maxLengths[path]) errors[path] = `${label} must be ${maxLengths[path]} characters or fewer`;
  });
  const status = (form.elements.namedItem("status") as HTMLSelectElement | null)?.value;
  const publishedAt = form.elements.namedItem("publishedAt") as HTMLInputElement | null;
  if (status === "published" && publishedAt && !publishedAt.value) errors.publishedAt = "Published date is required when status is Published";
  const jsonField = form.elements.namedItem(kind === "article" ? "blocksPayload" : "sectionsPayload") as HTMLInputElement | null;
  if (jsonField) {
    try {
      const values = JSON.parse(jsonField.value) as Array<Record<string, unknown>>;
      if (kind === "article") values.forEach((block, index) => {
        const blockId = typeof block.id === "string" && block.id ? block.id : `position-${index}`;
        const path = `blocks.${blockId}`;
        const detail = getBlockDataErrors(String(block.type), block.data);
        if (Object.keys(detail).length) for (const [field,message] of Object.entries(detail)) errors[["data", "images", "items", "columns", "rows", "type"].includes(field) ? path : `${path}.${field}`] = message;
      });
      else values.forEach((section, si) => {
        const sectionId = typeof section.id === "string" && section.id ? section.id : `position-${typeof section.position === "number" ? section.position : si}`;
        const sectionBlocks = Array.isArray(section.blocks) ? section.blocks as Array<Record<string, unknown>> : [];
        const mediaInput = form.elements.namedItem("mediaPayload") as HTMLInputElement | null;
        let assignedMedia = new Set<string>();
        try { assignedMedia = new Set((JSON.parse(mediaInput?.value ?? "[]") as Array<Record<string, unknown>>).map((item) => item.mediaId).filter((id): id is string => typeof id === "string")); } catch { /* the media payload receives its own error below */ }
        sectionBlocks.forEach((block, bi) => {
          const blockId = typeof block.id === "string" && block.id ? block.id : `position-${typeof block.position === "number" ? block.position : bi}`;
          const path = `sections.${sectionId}.blocks.${blockId}`;
          const detail = getProjectBlockDataErrors(String(block.type), block.data);
          for (const [field, message] of Object.entries(detail)) errors[field === "data" || field === "type" ? path : `${path}.data.${field}`] = message;
          const blockData = block.data && typeof block.data === "object" ? block.data as Record<string, unknown> : {};
          if (block.type === "image" && typeof blockData.mediaId === "string" && blockData.mediaId && !assignedMedia.has(blockData.mediaId)) errors[`${path}.data.mediaId`] = "Add this image to the project media assignments.";
          if (block.type === "gallery" && Array.isArray(blockData.mediaIds)) blockData.mediaIds.forEach((id, index) => { if (typeof id === "string" && id && !assignedMedia.has(id)) errors[`${path}.data.mediaIds.${index}`] = "Add this image to the project media assignments."; });
        });
      });
    } catch { errors[kind === "article" ? "blocks" : "sections"] = "Content data could not be read. Review the visual editor."; }
  }
  if (kind === "project") {
    const mediaInput = form.elements.namedItem("mediaPayload") as HTMLInputElement | null;
    try { (JSON.parse(mediaInput?.value ?? "[]") as Array<Record<string, unknown>>).forEach((item, index) => { const id = item.mediaId; if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) errors[`media.${index}.mediaId`] = `Media assignment ${index + 1}: select a media item`; }); } catch { errors.media = "Media assignments could not be read."; }
    const linksInput = form.elements.namedItem("linksPayload") as HTMLInputElement | null;
    try { (JSON.parse(linksInput?.value ?? "[]") as Array<Record<string, unknown>>).forEach((link, index) => { if (typeof link.url !== "string" || !validWebUrl(link.url)) errors[`links.${index}.url`] = `Project link ${index + 1}: enter a valid URL`; }); } catch { errors.links = "Project links could not be read."; }
  }
  return Object.fromEntries(Object.entries(errors).sort(([left], [right]) => {
    const a = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(left)}"]`) ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(left)}"]`);
    const b = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(right)}"]`) ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(right)}"]`);
    if (!a) return b ? 1 : 0;
    if (!b) return -1;
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  }));
}

export function presentEditorErrors(form: HTMLFormElement, errors: EditorFieldErrors, navigate = true) {
  form.querySelectorAll<HTMLElement>("[data-validation-error]").forEach((node) => node.remove());
  form.querySelectorAll<HTMLElement>("[data-validation-path][aria-describedby]").forEach((node) => node.removeAttribute("aria-describedby"));
  form.querySelectorAll<HTMLElement>("[data-invalid=true]").forEach((node) => node.removeAttribute("data-invalid"));
  form.querySelectorAll<HTMLElement>("[aria-invalid=true]").forEach((node) => node.removeAttribute("aria-invalid"));
  const firstTargets: HTMLElement[] = [];
  const entries = Object.entries(errors).sort(([left], [right]) => {
    const a = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(left)}"]`) ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(left)}"]`);
    const b = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(right)}"]`) ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(right)}"]`);
    if (!a) return b ? 1 : 0;
    if (!b) return -1;
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  });
  for (const [path, message] of entries) {
    const direct = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(path)}"]`);
    const block = direct ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(path)}"]`);
    if (!block) continue;
    const target = direct ?? block.querySelector<HTMLElement>("input:not([type=hidden]), textarea, select") ?? block.querySelector<HTMLElement>("button:not(:disabled)") ?? block;
    target.closest<HTMLElement>("[data-block-path]")?.setAttribute("data-invalid", "true");
    target.setAttribute("aria-invalid", "true");
    const container = target.closest("label") ?? target;
    container.setAttribute("data-invalid", "true");
    const error = document.createElement("span"); error.id = `validation-${path.replaceAll(".", "-")}`; error.dataset.validationError = "true"; error.className = "fieldError"; error.setAttribute("role", "alert"); error.textContent = message;
    target.setAttribute("aria-describedby", error.id);
    container.append(error);
    if (target === block || target.matches("input,textarea,select")) firstTargets.push(target);
  }
  const first = firstTargets[0];
  if (navigate && first) requestAnimationFrame(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    first.focus({ preventScroll: true });
  });
}

export function navigateToEditorError(form: HTMLFormElement, path: string) {
  const target = form.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(path)}"]`) ?? form.querySelector<HTMLElement>(`[data-block-path="${CSS.escape(path)}"]`);
  if (!target) return;
  const focusTarget = target.matches("input,textarea,select,button") ? target : target.querySelector<HTMLElement>("input:not([type=hidden]),textarea,select,button:not(:disabled)") ?? target;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  focusTarget.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  focusTarget.focus({ preventScroll: true });
}
