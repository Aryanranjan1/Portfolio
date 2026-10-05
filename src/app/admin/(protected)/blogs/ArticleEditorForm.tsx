"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { getAdminArticleEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import { createArticleAction, updateArticleAction } from "./actions";
import ArticleBlockCanvas from "@/components/admin/ArticleBlockCanvas";
import { collectEditorErrors, navigateToEditorError, presentEditorErrors, type EditorFieldErrors } from "@/lib/admin/editor-validation";

type EditorData = Awaited<ReturnType<typeof getAdminArticleEditorData>>;

export default function ArticleEditorForm({ data }: { data: EditorData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<EditorFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const current = data.article;
  const [tags, setTags] = useState<string[]>(current?.tags ?? []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formNode = event.currentTarget;
    const fieldErrors = collectEditorErrors(formNode, "article");
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); presentEditorErrors(formNode, fieldErrors); return; }
    setErrors({}); presentEditorErrors(formNode, {});
    const form = new FormData(event.currentTarget);
    const blocksField = form.get("blocksPayload");
    let blocks: unknown;
    try { blocks = JSON.parse(String(blocksField ?? "[]")); if (!Array.isArray(blocks)) throw new Error(); }
    catch { const invalid = { blocks: "Article blocks could not be read. Review the visual editor." }; setErrors(invalid); presentEditorErrors(formNode, invalid); return; }
    const publishedAtValue = String(form.get("publishedAt") ?? "");
    const payload: Record<string, unknown> = {
      ...(current ? { id: current.id } : {}),
      slug: form.get("slug"), title: form.get("title"), excerpt: form.get("excerpt"), categoryId: form.get("categoryId"),
      tags: tags.map((tagId) => ({ tagId })), status: form.get("status"), featured: form.get("featured") === "on",
      publishedAt: publishedAtValue ? new Date(publishedAtValue).toISOString() : null,
      seoTitle: form.get("seoTitle") || null, seoDescription: form.get("seoDescription") || null,
      canonicalOverride: form.get("canonicalOverride") || null, robotsIndex: form.get("robotsIndex") === "on",
      robotsFollow: form.get("robotsFollow") === "on", socialTitle: form.get("socialTitle") || null,
      socialDescription: form.get("socialDescription") || null, socialImageId: form.get("socialImageId") || null,
      blocks,
    };
    startTransition(async () => {
      const result = current ? await updateArticleAction(payload) : await createArticleAction(payload);
      if (!result.success) {
        const detectedErrors = result.error === "VALIDATION_ERROR" ? collectEditorErrors(formNode, "article") : {};
        const serverErrors: EditorFieldErrors = result.fieldErrors ?? (result.error === "CONFLICT" ? { slug: "This slug or related value is already in use" } : result.error === "VALIDATION_ERROR" && Object.keys(detectedErrors).length ? detectedErrors : { form: result.error === "VALIDATION_ERROR" ? "The server rejected this data. Review the form and structured content." : errorMessage(result.error) });
        setErrors(serverErrors); presentEditorErrors(formNode, serverErrors);
        return;
      }
      router.push("/admin/blogs");
      router.refresh();
    });
  }

  return <form ref={formRef} className={styles.editorForm} noValidate onInput={() => requestAnimationFrame(() => { const form = formRef.current; if (form) { const next = collectEditorErrors(form, "article"); setErrors(next); presentEditorErrors(form, next, false); } })} onChange={() => requestAnimationFrame(() => { const form = formRef.current; if (form) { const next = collectEditorErrors(form, "article"); setErrors(next); presentEditorErrors(form, next, false); } })} onSubmit={submit}>
    <section className={styles.settingsSection}>
      <h2>Article details</h2>
      <div className={styles.settingsGrid}>
        <Field label="Title" name="title" required defaultValue={current?.title} />
        <Field label="Slug" name="slug" required defaultValue={current?.slug} />
        <label className={styles.field}><span>Category</span><select defaultValue={current?.categoryId ?? ""} name="categoryId" required><option value="" disabled>Select a category</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className={styles.field}><span>Status</span><select defaultValue={current?.status ?? "draft"} name="status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <Field label="Published at" name="publishedAt" type="datetime-local" defaultValue={toLocalDateTime(current?.publishedAt)} />
        <label className={styles.field}><span>Excerpt</span><textarea defaultValue={current?.excerpt ?? ""} maxLength={1000} name="excerpt" required rows={4} /></label>
      </div>
      <label className={styles.checkField}><input defaultChecked={current?.featured ?? false} name="featured" type="checkbox" /> Featured article</label>
    </section>

    <section className={styles.settingsSection}>
      <h2>Tags</h2>
      <div className={styles.tagChoices}>{data.tags.map((item) => <label className={styles.checkField} key={item.id}><input checked={tags.includes(item.id)} onChange={() => setTags((values) => values.includes(item.id) ? values.filter((id) => id !== item.id) : [...values, item.id])} type="checkbox" /> {item.name}</label>)}</div>
      {!data.tags.length && <p className={styles.dashboardEmpty}>No tags are configured.</p>}
    </section>

    <section className={styles.settingsSection}>
      <h2>Search and social metadata</h2>
      <div className={styles.settingsGrid}>
        <Field label="SEO title" name="seoTitle" defaultValue={current?.seoTitle ?? ""} />
        <Field label="SEO description" name="seoDescription" defaultValue={current?.seoDescription ?? ""} />
        <Field label="Canonical URL override" name="canonicalOverride" type="url" defaultValue={current?.canonicalOverride ?? ""} />
        <Field label="Social title" name="socialTitle" defaultValue={current?.socialTitle ?? ""} />
        <Field label="Social description" name="socialDescription" defaultValue={current?.socialDescription ?? ""} />
        <label className={styles.field}><span>Social image</span><select defaultValue={current?.socialImageId ?? ""} name="socialImageId"><option value="">No article image</option>{data.media.filter((item) => item.mimeType.startsWith("image/")).map((item) => <option key={item.id} value={item.id}>{item.filename}</option>)}</select></label>
      </div>
      <label className={styles.checkField}><input defaultChecked={current?.robotsIndex ?? true} name="robotsIndex" type="checkbox" /> Allow indexing</label>
      <label className={styles.checkField}><input defaultChecked={current?.robotsFollow ?? true} name="robotsFollow" type="checkbox" /> Allow link following</label>
    </section>

    <ArticleBlockCanvas initial={current?.blocks ?? []} media={data.media} errors={errors} />

    {Object.keys(errors).length > 0 && <div className={styles.validationSummary} role="alert"><strong>{Object.keys(errors).length} {Object.keys(errors).length === 1 ? "field" : "fields"} need attention.</strong><ul>{Object.entries(errors).map(([path,message]) => <li key={path}><button type="button" onClick={() => { if (formRef.current) navigateToEditorError(formRef.current,path); }}>{message}</button></li>)}</ul></div>}
    <div className={styles.formFooter}><button className={styles.saveButton} disabled={pending} type="submit">{pending ? "Saving…" : current ? "Save article" : "Create article"}</button><button className={styles.quickLink} onClick={() => router.push("/admin/blogs")} type="button">Cancel</button></div>
  </form>;
}

function Field({ label, name, defaultValue = "", required = false, type = "text" }: { label: string; name: string; defaultValue?: string | number; required?: boolean; type?: string }) {
  return <label className={styles.field}><span>{label}</span><input defaultValue={defaultValue} name={name} required={required} type={type} /></label>;
}
function toLocalDateTime(value?: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function errorMessage(code: string) {
  if (code === "CONFLICT") return "That slug or related value is already in use.";
  if (code === "VALIDATION_ERROR") return "Check required fields, publication date, URLs, and block data.";
  if (code === "NOT_FOUND") return "The selected category, tag, or media record no longer exists.";
  if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "Your administrator session is no longer authorized.";
  if (code === "DATABASE_ERROR") return "The article could not be saved because the database operation failed.";
  return "The article could not be saved. Please try again.";
}
