import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema/media";

import {
  contactMethod,
  footerResource,
  footerExploreItem,
  siteSettings,
} from "@/db/schema/site";

import {
  faq,
  timelineEntry,
} from "@/db/schema/content";

export type UpdateSiteSettingsInput = {
  siteName: string;
  personName: string;
  professionalTitle: string;
  shortDescription: string;
  bio: string;
  location: string;
  education: string | null;
  interests: string | null;
  availabilityStatus: string;
  availabilityText: string | null;
  yearsBuilding: number;
  projectsCompleted: number;
  leetcodeSolved: number;
  learningHours: number;
  primaryEmail: string;
  siteDescription: string;
  canonicalOrigin: string;
  defaultSocialImageId: string | null;
};

export async function getSiteSettingsForMutation() {
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.singleton, true))
    .limit(1);

  if (!settings) {
    throw new Error("NOT_FOUND");
  }

  return settings;
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
) {
  if (input.defaultSocialImageId) {
    const [image] = await db.select({ id: media.id, mimeType: media.mimeType }).from(media).where(eq(media.id, input.defaultSocialImageId)).limit(1);
    if (!image || !image.mimeType.startsWith("image/")) throw new Error("MEDIA_NOT_FOUND");
  }
  const [updatedSettings] = await db
    .update(siteSettings)
    .set({
      siteName: input.siteName,
      personName: input.personName,
      professionalTitle:
        input.professionalTitle,
      shortDescription:
        input.shortDescription,
      bio: input.bio,
      location: input.location,
      education: input.education,
      interests: input.interests,
      availabilityStatus:
        input.availabilityStatus,
      availabilityText:
        input.availabilityText,
      yearsBuilding:
        input.yearsBuilding,
      projectsCompleted:
        input.projectsCompleted,
      leetcodeSolved:
        input.leetcodeSolved,
      learningHours:
        input.learningHours,
      primaryEmail:
        input.primaryEmail,
      siteDescription:
        input.siteDescription,
      canonicalOrigin:
        input.canonicalOrigin,
      defaultSocialImageId:
        input.defaultSocialImageId,
      updatedAt: new Date(),
    })
    .where(
      eq(
        siteSettings.singleton,
        true,
      ),
    )
    .returning();

  if (!updatedSettings) {
    throw new Error("NOT_FOUND");
  }

  return updatedSettings;
}

export async function setDefaultSocialImage(mediaId: string | null) {
  if (mediaId) {
    const [selectedImage] = await db.select({ id: media.id, mimeType: media.mimeType }).from(media).where(eq(media.id, mediaId)).limit(1);
    if (!selectedImage || !selectedImage.mimeType.startsWith("image/")) throw new Error("MEDIA_NOT_FOUND");
  }
  const [updated] = await db.update(siteSettings).set({ defaultSocialImageId: mediaId, updatedAt: new Date() }).where(eq(siteSettings.singleton, true)).returning({ id: siteSettings.id });
  if (!updated) throw new Error("NOT_FOUND");
  return updated;
}

export async function setResumeMediaReference(mediaId: string | null) {
  return db.transaction(async (tx) => {
    const [settings] = await tx.select({ id: siteSettings.id, resumeMediaId: siteSettings.resumeMediaId })
      .from(siteSettings).where(eq(siteSettings.singleton, true)).limit(1);
    if (!settings) throw new Error("NOT_FOUND");
    if (mediaId) {
      const [resume] = await tx.select({ mimeType: media.mimeType, filename: media.filename, storageKey: media.storageKey, deletionPending: media.deletionPending })
        .from(media).where(eq(media.id, mediaId)).limit(1);
      if (!resume || resume.deletionPending || resume.mimeType !== "application/pdf" || !resume.filename.toLowerCase().endsWith(".pdf") || !resume.storageKey.startsWith("resume/")) throw new Error("MEDIA_NOT_FOUND");
    }
    const [updated] = await tx.update(siteSettings).set({ resumeMediaId: mediaId, updatedAt: new Date() })
      .where(eq(siteSettings.id, settings.id)).returning({ id: siteSettings.id });
    if (!updated) throw new Error("NOT_FOUND");
    return settings.resumeMediaId;
  });
}

export type ContactMethodType =
  | "email"
  | "linkedin"
  | "github"
  | "x"
  | "other";

export type CreateContactMethodInput = {
  type: ContactMethodType;
  label: string;
  value: string | null;
  url: string | null;
  position: number;
  active: boolean;
};

export type UpdateContactMethodInput =
  CreateContactMethodInput & {
    id: string;
  };

export async function createContactMethod(
  input: CreateContactMethodInput,
) {
  try {
    const [created] = await db
      .insert(contactMethod)
      .values({
        type: input.type,
        label: input.label,
        value: input.value,
        url: input.url,
        position: input.position,
        active: input.active,
      })
      .returning();

    if (!created) {
      throw new Error("INTERNAL_ERROR");
    }

    return created;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "contact_method_position_unique",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function updateContactMethod(
  input: UpdateContactMethodInput,
) {
  try {
    const [updated] = await db
      .update(contactMethod)
      .set({
        type: input.type,
        label: input.label,
        value: input.value,
        url: input.url,
        position: input.position,
        active: input.active,
      })
      .where(
        eq(
          contactMethod.id,
          input.id,
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("NOT_FOUND");
    }

    return updated;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "contact_method_position_unique",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function deleteContactMethod(
  contactMethodId: string,
) {
  const [deleted] = await db
    .delete(contactMethod)
    .where(
      eq(
        contactMethod.id,
        contactMethodId,
      ),
    )
    .returning({
      id: contactMethod.id,
    });

  if (!deleted) {
    throw new Error("NOT_FOUND");
  }

  return deleted;
}

export type FooterResourceInput = {
  label: string;
  url: string;
  active: boolean;
  position: number;
};

export async function createFooterResource(input: FooterResourceInput) {
  const [row] = await db.insert(footerResource).values(input).returning();
  if (!row) throw new Error("INTERNAL_ERROR");
  return row;
}

export async function updateFooterResource(id: string, input: FooterResourceInput) {
  const [row] = await db.update(footerResource).set(input).where(eq(footerResource.id, id)).returning();
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function deleteFooterResource(id: string) {
  const [row] = await db.delete(footerResource).where(eq(footerResource.id, id)).returning({ id: footerResource.id });
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function reorderFooterResources(items: { id: string; position: number }[]) {
  return db.transaction(async (tx) => {
    const ids = items.map((item) => item.id);
    const current = await tx.select({ id: footerResource.id }).from(footerResource);
    if (ids.length !== current.length || new Set(ids).size !== ids.length || current.some((row) => !ids.includes(row.id))) throw new Error("CONFLICT");
    for (const item of items) await tx.update(footerResource).set({ position: item.position }).where(eq(footerResource.id, item.id));
  });
}

export type FooterExploreItemInput = FooterResourceInput;
export async function createFooterExploreItem(input: FooterExploreItemInput) { const [row] = await db.insert(footerExploreItem).values(input).returning(); if (!row) throw new Error("INTERNAL_ERROR"); return row; }
export async function updateFooterExploreItem(id: string, input: FooterExploreItemInput) { const [row] = await db.update(footerExploreItem).set(input).where(eq(footerExploreItem.id, id)).returning(); if (!row) throw new Error("NOT_FOUND"); return row; }
export async function deleteFooterExploreItem(id: string) { const [row] = await db.delete(footerExploreItem).where(eq(footerExploreItem.id, id)).returning({ id: footerExploreItem.id }); if (!row) throw new Error("NOT_FOUND"); return row; }
export async function reorderFooterExploreItems(items: { id: string; position: number }[]) { return db.transaction(async (tx) => { const ids = items.map((item) => item.id); const current = await tx.select({ id: footerExploreItem.id }).from(footerExploreItem); if (ids.length !== current.length || new Set(ids).size !== ids.length || current.some((row) => !ids.includes(row.id))) throw new Error("CONFLICT"); for (const item of items) await tx.update(footerExploreItem).set({ position: item.position }).where(eq(footerExploreItem.id, item.id)); }); }

export type CreateTimelineEntryInput = {
  year: number;
  title: string;
  description: string;
  tag: string | null;
  position: number;
  active: boolean;
};

export type UpdateTimelineEntryInput =
  CreateTimelineEntryInput & {
    id: string;
  };

export async function createTimelineEntry(
  input: CreateTimelineEntryInput,
) {
  try {
    const [created] = await db
      .insert(timelineEntry)
      .values({
        year: input.year,
        title: input.title,
        description: input.description,
        tag: input.tag,
        position: input.position,
        active: input.active,
      })
      .returning();

    if (!created) {
      throw new Error("INTERNAL_ERROR");
    }

    return created;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "timeline_entry_position",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function updateTimelineEntry(
  input: UpdateTimelineEntryInput,
) {
  try {
    return await db.transaction(async (tx) => {
      const rows = await tx.select({ id: timelineEntry.id, position: timelineEntry.position }).from(timelineEntry).orderBy(timelineEntry.position).for("update");
      const currentIndex = rows.findIndex((row) => row.id === input.id);
      if (currentIndex < 0) throw new Error("NOT_FOUND");
      if (!Number.isInteger(input.position) || input.position < 0 || input.position >= rows.length) throw new Error("VALIDATION_ERROR");
      const ordered = [...rows];
      const [moving] = ordered.splice(currentIndex, 1);
      ordered.splice(input.position, 0, moving!);
      const ids = rows.map((row) => row.id);
      const maxPosition = Math.max(...rows.map((row) => row.position));
      const offset = maxPosition + rows.length + 1;
      if (!Number.isSafeInteger(offset + maxPosition) || offset + maxPosition > 2_147_483_647) throw new Error("VALIDATION_ERROR");
      await tx.update(timelineEntry).set({ position: sql`${timelineEntry.position} + ${offset}` }).where(inArray(timelineEntry.id, ids));
      let updated;
      for (const [position, row] of ordered.entries()) {
        const values = row.id === input.id
          ? { year: input.year, title: input.title, description: input.description, tag: input.tag, active: input.active, position }
          : { position };
        const [saved] = await tx.update(timelineEntry).set(values).where(eq(timelineEntry.id, row.id)).returning();
        if (row.id === input.id) updated = saved;
      }
      if (!updated) throw new Error("INTERNAL_ERROR");
      return updated;
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "timeline_entry_position",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function deleteTimelineEntry(
  timelineEntryId: string,
) {
  const [deleted] = await db
    .delete(timelineEntry)
    .where(
      eq(
        timelineEntry.id,
        timelineEntryId,
      ),
    )
    .returning({
      id: timelineEntry.id,
    });

  if (!deleted) {
    throw new Error("NOT_FOUND");
  }

  return deleted;
}

export type CreateFaqInput = {
  question: string;
  answer: string;
  position: number;
  active: boolean;
};

export type UpdateFaqInput =
  CreateFaqInput & {
    id: string;
  };

export async function createFaq(
  input: CreateFaqInput,
) {
  try {
    const [created] = await db
      .insert(faq)
      .values({
        question: input.question,
        answer: input.answer,
        position: input.position,
        active: input.active,
      })
      .returning();

    if (!created) {
      throw new Error("INTERNAL_ERROR");
    }

    return created;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "faq_position",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function updateFaq(
  input: UpdateFaqInput,
) {
  try {
    return await db.transaction(async (tx) => {
      const rows = await tx.select({ id: faq.id, position: faq.position }).from(faq).orderBy(faq.position).for("update");
      const currentIndex = rows.findIndex((row) => row.id === input.id);
      if (currentIndex < 0) throw new Error("NOT_FOUND");
      if (!Number.isInteger(input.position) || input.position < 0 || input.position >= rows.length) throw new Error("VALIDATION_ERROR");
      const ordered = [...rows];
      const [moving] = ordered.splice(currentIndex, 1);
      ordered.splice(input.position, 0, moving!);
      const ids = rows.map((row) => row.id);
      const maxPosition = Math.max(...rows.map((row) => row.position));
      const offset = maxPosition + rows.length + 1;
      if (!Number.isSafeInteger(offset + maxPosition) || offset + maxPosition > 2_147_483_647) throw new Error("VALIDATION_ERROR");
      await tx.update(faq).set({ position: sql`${faq.position} + ${offset}` }).where(inArray(faq.id, ids));
      let updated;
      for (const [position, row] of ordered.entries()) {
        const values = row.id === input.id
          ? { question: input.question, answer: input.answer, active: input.active, position }
          : { position };
        const [saved] = await tx.update(faq).set(values).where(eq(faq.id, row.id)).returning();
        if (row.id === input.id) updated = saved;
      }
      if (!updated) throw new Error("INTERNAL_ERROR");
      return updated;
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "faq_position",
      )
    ) {
      throw new Error("CONFLICT");
    }

    throw error;
  }
}

export async function deleteFaq(
  faqId: string,
) {
  const [deleted] = await db
    .delete(faq)
    .where(
      eq(
        faq.id,
        faqId,
      ),
    )
    .returning({
      id: faq.id,
    });

  if (!deleted) {
    throw new Error("NOT_FOUND");
  }

  return deleted;
}
