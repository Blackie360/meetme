import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { drizzleSchema } from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your environment variables to connect to PostgreSQL.",
  );
}

const sslEnabled =
  process.env.DATABASE_SSL === "true" || process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema: drizzleSchema });

export type Database = typeof db;
