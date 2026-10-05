"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { getAdminProjectEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import { createProjectAction, updateProjectAction } from "./actions";
import ProjectBlockCanvas from "@/components/admin/ProjectBlockCanvas";
import { collectEditorErrors, navigateToEditorError, presentEditorErrors, type EditorFieldErrors } from "@/lib/admin/editor-validation";

type EditorData = Awaited<ReturnType<typeof getAdminProjectEditorData>>;

export default function ProjectEditorForm({ data }: { data: EditorData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<EditorFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const current = data.project;
  const [categories, setCategories] = useState<string[]>(current?.categories ?? []);
  const [technologies, setTechnologies] = useState<string[]>(current?.technologies.map((item) => item.technologyId) ?? []);

  function toggle(values: string[], setValues: (next: string[]) => void, id: string) {
    setValues(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formNode = event.currentTarget;
    const fieldErrors = collectEditorErrors(formNode, "project");
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); presentEditorErrors(formNode, fieldErrors); return; }
    setErrors({}); presentEditorErrors(formNode, {});
    const form = new FormData(event.currentTarget);
    let media: unknown, sections: unknown, links: unknown;
    try { media = JSON.parse(String(form.get("mediaPayload") ?? "[]")); sections = JSON.parse(String(form.get("sectionsPayload") ?? "[]")); links = JSON.parse(String(form.get("linksPayload") ?? "[]")); if (![media, sections, links].every(Array.isArray)) throw new Error(); }
    catch { const invalid = { sections: "Project content could not be read. Review the visual editor." }; setErrors(invalid); presentEditorErrors(formNode, invalid); return; }
    const status = String(form.get("status"));
    const publishedAtValue = String(form.get("publishedAt") ?? "");
    const payload: Record<string, unknown> = {
      ...(current ? { id: current.id } : {}),
      slug: form.get("slug"), title: form.get("title"), shortDescription: form.get("shortDescription"),
      description: form.get("description"), projectType: form.get("projectType"), location: form.get("location") || null,
      year: form.get("year") ? Number(form.get("year")) : null,
      status, featured: form.get("featured") === "on", publishedAt: publishedAtValue ? new Date(publishedAtValue).toISOString() : null,
      seoTitle: form.get("seoTitle") || null, seoDescription: form.get("seoDescription") || null,
      canonicalOverride: form.get("canonicalOverride") || null, robotsIndex: form.get("robotsIndex") === "on",
      robotsFollow: form.get("robotsFollow") === "on", socialTitle: form.get("socialTitle") || null,
      socialDescription: form.get("socialDescription") || null, socialImageId: form.get("socialImageId") || null,
      categories: categories.map((categoryId) => ({ categoryId })),
      technologies: technologies.map((technologyId, position) => ({ technologyId, position })),
      media, sections, links,
    };
    startTransition(async () => {
      const result = current ? await updateProjectAction(payload) : await createProjectAction(payload);
      if (!result.success) {
        const detectedErrors = result.error === "VALIDATION_ERROR" ? collectEditorErrors(formNode, "project") : {};
        const serverErrors: EditorFieldErrors = result.fieldErrors ?? (result.error === "CONFLICT" ? { slug: "This slug or related value is already in use." } : result.error === "VALIDATION_ERROR" && Object.keys(detectedErrors).length ? detectedErrors : { form: errorMessage(result.error) });
        setErrors(serverErrors); presentEditorErrors(formNode, serverErrors);
        return;
      }
      router.push("/admin/projects");
      router.refresh();
    });
  }

  return <form ref={formRef} className={styles.editorForm} noValidate onInput={() => requestAnimationFrame(() => { const form = formRef.current; if (form) { const next = collectEditorErrors(form, "project"); setErrors(next); presentEditorErrors(form, next, false); } })} onChange={() => requestAnimationFrame(() => { const form = formRef.current; if (form) { const next = collectEditorErrors(form, "project"); setErrors(next); presentEditorErrors(form, next, false); } })} onSubmit={submit}>
    <section className={styles.settingsSection}>
      <h2>Project details</h2>
      <div className={styles.settingsGrid}>
        <Field label="Title" name="title" required defaultValue={current?.title} />
        <Field label="Slug" name="slug" required defaultValue={current?.slug} />
        <Field label="Project type" name="projectType" required defaultValue={current?.projectType} />
        <Field label="Location" name="location" defaultValue={current?.location ?? ""} />
        <Field label="Year" name="year" type="number" min="1900" max="2200" defaultValue={current?.year ?? ""} />
        <label className={styles.field}><span>Status</span><select defaultValue={current?.status ?? "draft"} name="status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <Field label="Published at" name="publishedAt" type="datetime-local" defaultValue={toLocalDateTime(current?.publishedAt)} />
        <label className={styles.field}><span>Short description</span><textarea defaultValue={current?.shortDescription ?? ""} maxLength={500} name="shortDescription" required rows={3} /></label>
        <label className={styles.field}><span>Description</span><textarea defaultValue={current?.description ?? ""} maxLength={10000} name="description" required rows={6} /></label>
      </div>
      <label className={styles.checkField}><input defaultChecked={current?.featured ?? false} name="featured" type="checkbox" /> Featured project</label>
    </section>

    <section className={styles.settingsSection}>
      <h2>Search and social metadata</h2>
      <div className={styles.settingsGrid}>
        <Field label="SEO title" name="seoTitle" defaultValue={current?.seoTitle ?? ""} />
        <Field label="SEO description" name="seoDescription" defaultValue={current?.seoDescription ?? ""} />
        <Field label="Canonical URL override" name="canonicalOverride" type="url" defaultValue={current?.canonicalOverride ?? ""} />
        <Field label="Social title" name="socialTitle" defaultValue={current?.socialTitle ?? ""} />
        <Field label="Social description" name="socialDescription" defaultValue={current?.socialDescription ?? ""} />
        <label className={styles.field}><span>Social image</span><select defaultValue={current?.socialImageId ?? ""} name="socialImageId"><option value="">Use no project image</option>{data.media.filter((item) => item.mimeType.startsWith("image/")).map((item) => <option key={item.id} value={item.id}>{item.filename}</option>)}</select></label>
      </div>
      <label className={styles.checkField}><input defaultChecked={current?.robotsIndex ?? true} name="robotsIndex" type="checkbox" /> Allow indexing</label>
      <label className={styles.checkField}><input defaultChecked={current?.robotsFollow ?? true} name="robotsFollow" type="checkbox" /> Allow link following</label>
    </section>

    <section className={styles.settingsSection}>
      <h2>Categories and technologies</h2>
      <div className={styles.assignmentGrid}>
        <fieldset className={styles.assignmentGroup}><legend>Categories</legend>{data.categories.map((item) => <label className={styles.checkField} key={item.id}><input checked={categories.includes(item.id)} onChange={() => toggle(categories, setCategories, item.id)} type="checkbox" /> {item.name}</label>)}{!data.categories.length && <p className={styles.dashboardEmpty}>No project categories are configured.</p>}</fieldset>
        <fieldset className={styles.assignmentGroup}><legend>Technologies</legend>{data.technologies.map((item) => <label className={styles.checkField} key={item.id}><input checked={technologies.includes(item.id)} onChange={() => toggle(technologies, setTechnologies, item.id)} type="checkbox" /> {item.name}</label>)}{!data.technologies.length && <p className={styles.dashboardEmpty}>No technologies are configured.</p>}</fieldset>
      </div>
    </section>

    <ProjectBlockCanvas initial={current?.sections ?? []} availableMedia={data.media} initialMedia={current?.media ?? []} initialLinks={current?.links ?? []} />

    {Object.keys(errors).length > 0 && <div className={styles.validationSummary} role="alert"><strong>{Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field" : "fields"} need attention.</strong><ul>{Object.entries(errors).map(([path,message]) => <li key={path}><button type="button" onClick={() => { if (formRef.current) navigateToEditorError(formRef.current,path); }}>{message}</button></li>)}</ul></div>}
    <div className={styles.formFooter}><button className={styles.saveButton} disabled={pending} type="submit">{pending ? "Saving…" : current ? "Save project" : "Create project"}</button><button className={styles.quickLink} onClick={() => router.push("/admin/projects")} type="button">Cancel</button></div>
  </form>;
}

function Field({ label, name, defaultValue = "", required = false, type = "text", min, max }: { label: string; name: string; defaultValue?: string | number; required?: boolean; type?: string; min?: string; max?: string }) {
  return <label className={styles.field}><span>{label}</span><input defaultValue={defaultValue} max={max} min={min} name={name} required={required} type={type} /></label>;
}

function toLocalDateTime(value?: Date | null) {
  if (!value) return "";
  const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function errorMessage(code: string) {
  if (code === "CONFLICT") return "That slug or related value is already in use.";
  if (code === "VALIDATION_ERROR") return "The submitted value could not be validated. Review the form fields.";
  if (code === "NOT_FOUND") return "A selected category, technology, or media record no longer exists.";
  if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "Your administrator session is no longer authorized.";
  if (code === "DATABASE_ERROR") return "The project could not be saved because the database operation failed.";
  return "The project could not be saved. Please try again.";
}
