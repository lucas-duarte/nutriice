import { pgTable, text, serial, integer, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { nutritionistsTable } from "./nutritionists";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  nutritionistId: integer("nutritionist_id").notNull().references(() => nutritionistsTable.id, { onDelete: "cascade" }),
  phone: text("phone"),
  birthDate: date("birth_date"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  height: real("height"),
  weight: real("weight"),
  objective: text("objective"),
  observations: text("observations"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
