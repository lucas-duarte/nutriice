import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const nutritionistsTable = pgTable("nutritionists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  crn: text("crn").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
});

export const insertNutritionistSchema = createInsertSchema(nutritionistsTable).omit({ id: true, createdAt: true });
export type InsertNutritionist = z.infer<typeof insertNutritionistSchema>;
export type Nutritionist = typeof nutritionistsTable.$inferSelect;
