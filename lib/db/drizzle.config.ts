import { defineConfig } from "drizzle-kit";
import path from "path";

const connectionString = process.env.SUPA_DB_URL || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const isSupabase = !!(process.env.SUPA_DB_URL || process.env.SUPABASE_DATABASE_URL);

if (!connectionString) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
    ssl: isSupabase ? "require" : undefined,
  },
});
