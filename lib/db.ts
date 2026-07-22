import { neon, Pool } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL!;

export const sql = neon(databaseUrl);

export const pool = new Pool({
  connectionString: databaseUrl,
});