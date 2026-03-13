import { pgTable, serial, integer, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const bioimpedanceTable = pgTable("bioimpedance_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  dataBio: date("data_bio").notNull(),
  peso: real("peso"),
  imc: real("imc"),
  gorduraCorporal: real("gordura_corporal"),
  aguaCorporal: real("agua_corporal"),
  massaEsqueletica: real("massa_esqueletica"),
  tmb: real("tmb"),
  massaLivreGordura: real("massa_livre_gordura"),
  gorduraSubcutanea: real("gordura_subcutanea"),
  gorduraVisceral: real("gordura_visceral"),
  massaMuscular: real("massa_muscular"),
  massaOssea: real("massa_ossea"),
  proteina: real("proteina"),
  idadeMetabolica: integer("idade_metabolica"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBioimpedanceSchema = createInsertSchema(bioimpedanceTable).omit({ id: true, createdAt: true });
export type InsertBioimpedance = z.infer<typeof insertBioimpedanceSchema>;
export type Bioimpedance = typeof bioimpedanceTable.$inferSelect;
