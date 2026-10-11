import type { Doc, TableNames } from "../../../convex/_generated/dataModel";

type SystemFields = "_id" | "_creationTime" | "legacyId";
type TimestampFields<T> = Extract<keyof T, `${string}At`>;
type TimestampValue<T> = null extends T ? Date | null : Date;

/** Application DTO shape returned by the Convex service modules. */
export type ConvexRow<Table extends TableNames> =
  Omit<Doc<Table>, SystemFields | TimestampFields<Doc<Table>>> &
  { id: string } &
  { [Field in TimestampFields<Doc<Table>>]: TimestampValue<Doc<Table>[Field]> };
