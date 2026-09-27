import { eq } from "drizzle-orm";

import { db } from "@/db";

import {
  contactMethod,
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

export type ContactMethodType =
  | "email"
  | "linkedin"
  | "github"
  | "x"
  | "location"
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
    const [updated] = await db
      .update(timelineEntry)
      .set({
        year: input.year,
        title: input.title,
        description: input.description,
        tag: input.tag,
        position: input.position,
        active: input.active,
      })
      .where(
        eq(
          timelineEntry.id,
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
    const [updated] = await db
      .update(faq)
      .set({
        question: input.question,
        answer: input.answer,
        position: input.position,
        active: input.active,
      })
      .where(
        eq(
          faq.id,
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