import { randomUUID } from "node:crypto";
import { mutateApplication, readAdmin } from "@/lib/convex-server";

export type UpdateSiteSettingsInput = {
  siteName: string; personName: string; professionalTitle: string; shortDescription: string; bio: string; location: string;
  education: string | null; interests: string | null; availabilityStatus: string; availabilityText: string | null;
  yearsBuilding: number; projectsCompleted: number; leetcodeSolved: number; learningHours: number; primaryEmail: string;
  siteDescription: string; canonicalOrigin: string; defaultSocialImageId: string | null;
};

export async function getSiteSettingsForMutation() {
  return readAdmin<Record<string, unknown> | null>("siteSettingsForMutation");
}

export function updateSiteSettings(input: UpdateSiteSettingsInput) {
  return mutateApplication("updateSiteSettings", { data: input });
}

export function setDefaultSocialImage(id: string | null) {
  return mutateApplication("setDefaultSocialImage", { id });
}

export function setResumeMediaReference(id: string | null) {
  return mutateApplication<string | null>("setResumeMediaReference", { id });
}

export type ContactMethodType = "email" | "linkedin" | "github" | "x" | "threads" | "instagram" | "youtube" | "location" | "other";
export type ContactMethodInput = { type: ContactMethodType; label: string; value: string | null; url: string | null; position: number; active: boolean; iconMode: "built_in" | "uploaded"; iconName: string | null; iconMediaId: string | null };
export type CreateContactMethodInput = ContactMethodInput;
export type UpdateContactMethodInput = CreateContactMethodInput & { id: string };
export function createContactMethod(input: CreateContactMethodInput) { return mutateApplication("simpleCreate", { table: "contactMethod", legacyId: randomUUID(), data: input }); }
export function updateContactMethod(input: UpdateContactMethodInput) { const { id, ...data } = input; return mutateApplication<{ id: string }>("simpleUpdate", { table: "contactMethod", id, data }); }
export function deleteContactMethod(id: string) { return mutateApplication("simpleDelete", { table: "contactMethod", id }); }

export type FooterResourceInput = { label: string; url: string; active: boolean; position: number };
export type FooterExploreItemInput = FooterResourceInput;
export function createFooterResource(input: FooterResourceInput) { return mutateApplication("simpleCreate", { table: "footerResource", legacyId: randomUUID(), data: input }); }
export function updateFooterResource(id: string, input: FooterResourceInput) { return mutateApplication("simpleUpdate", { table: "footerResource", id, data: input }); }
export function deleteFooterResource(id: string) { return mutateApplication("simpleDelete", { table: "footerResource", id }); }
export function reorderFooterResources(items: { id: string; position: number }[]) { return mutateApplication("simpleReorder", { table: "footerResource", items }); }
export function createFooterExploreItem(input: FooterExploreItemInput) { return mutateApplication("simpleCreate", { table: "footerExploreItem", legacyId: randomUUID(), data: input }); }
export function updateFooterExploreItem(id: string, input: FooterExploreItemInput) { return mutateApplication("simpleUpdate", { table: "footerExploreItem", id, data: input }); }
export function deleteFooterExploreItem(id: string) { return mutateApplication("simpleDelete", { table: "footerExploreItem", id }); }
export function reorderFooterExploreItems(items: { id: string; position: number }[]) { return mutateApplication("simpleReorder", { table: "footerExploreItem", items }); }

export type CreateTimelineEntryInput = { year: number; title: string; description: string; tag: string | null; position: number; active: boolean };
export type UpdateTimelineEntryInput = CreateTimelineEntryInput & { id: string };
export function createTimelineEntry(input: CreateTimelineEntryInput) { return mutateApplication("simpleCreate", { table: "timelineEntry", legacyId: randomUUID(), data: input }); }
export function updateTimelineEntry(input: UpdateTimelineEntryInput) { return mutateApplication("reorderTimelineEntry", { id: input.id, data: input }); }
export function deleteTimelineEntry(id: string) { return mutateApplication("simpleDelete", { table: "timelineEntry", id }); }

export type CreateFaqInput = { question: string; answer: string; position: number; active: boolean };
export type UpdateFaqInput = CreateFaqInput & { id: string };
export function createFaq(input: CreateFaqInput) { return mutateApplication("simpleCreate", { table: "faq", legacyId: randomUUID(), data: input }); }
export function updateFaq(input: UpdateFaqInput) { return mutateApplication("reorderFaq", { id: input.id, data: input }); }
export function deleteFaq(id: string) { return mutateApplication("simpleDelete", { table: "faq", id }); }
