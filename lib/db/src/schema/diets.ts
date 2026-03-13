import { pgTable, text, serial, integer, timestamp, boolean, real, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const dietPlansTable = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  recommendations: text("recommendations"),
  waterGoalMl: integer("water_goal_ml"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  totalCalories: real("total_calories"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  dietPlanId: integer("diet_plan_id").notNull().references(() => dietPlansTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  time: text("time"),
  description: text("description"),
  foods: jsonb("foods"),
  calories: real("calories"),
  order: integer("order").notNull().default(0),
  isSupplement: boolean("is_supplement").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDietPlanSchema = createInsertSchema(dietPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type DietPlan = typeof dietPlansTable.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;
