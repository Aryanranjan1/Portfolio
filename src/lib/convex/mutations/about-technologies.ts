import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

export type AboutTechnologyInput = { label: string; mediaId: string | null; position: number; active: boolean };

export function createAboutTechnology(input: AboutTechnologyInput) {
  return mutateApplication("simpleCreate", { table: "aboutTechnology", legacyId: randomUUID(), data: input });
}

export function updateAboutTechnology(id: string, input: AboutTechnologyInput) {
  return mutateApplication("simpleUpdate", { table: "aboutTechnology", id, data: input });
}

export function deleteAboutTechnology(id: string) {
  return mutateApplication("simpleDelete", { table: "aboutTechnology", id });
}
