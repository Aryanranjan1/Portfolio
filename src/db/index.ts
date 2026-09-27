import dotenv from "dotenv";
import * as schema from "./schema/index";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

dotenv.config({
  path: ".env.local",
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString);

export const db = drizzle(client, {
  schema,
});