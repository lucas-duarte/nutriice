import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable, nutritionistsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireNutritionist, hashPassword } from "../lib/auth";
import {
  CreatePatientBody,
  UpdatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  DeletePatientParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/patients", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const nutritionistId = req.auth!.nutritionistId!;
  const rows = await db
    .select({
      id: patientsTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: patientsTable.phone,
      birthDate: patientsTable.birthDate,
      gender: patientsTable.gender,
      height: patientsTable.height,
      weight: patientsTable.weight,
      objective: patientsTable.objective,
      observations: patientsTable.observations,
      nutritionistId: patientsTable.nutritionistId,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.nutritionistId, nutritionistId));
  res.json(rows);
});

router.post("/patients", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, email, password, phone, birthDate, gender, height, weight, objective, observations } = parsed.data;
  const nutritionistId = req.auth!.nutritionistId!;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role: "patient" }).returning();
  const [patient] = await db.insert(patientsTable).values({
    userId: user.id,
    nutritionistId,
    phone: phone ?? null,
    birthDate: (birthDate as string | null | undefined) ?? null,
    gender: gender ?? null,
    height: height ?? null,
    weight: weight ?? null,
    objective: objective ?? null,
    observations: observations ?? null,
  }).returning();

  res.status(201).json({
    id: patient.id,
    name: user.name,
    email: user.email,
    phone: patient.phone,
    birthDate: patient.birthDate,
    gender: patient.gender,
    height: patient.height,
    weight: patient.weight,
    objective: patient.objective,
    observations: patient.observations,
    nutritionistId: patient.nutritionistId,
    createdAt: patient.createdAt,
  });
});

router.get("/patients/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }

  const [row] = await db
    .select({
      id: patientsTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: patientsTable.phone,
      birthDate: patientsTable.birthDate,
      gender: patientsTable.gender,
      height: patientsTable.height,
      weight: patientsTable.weight,
      objective: patientsTable.objective,
      observations: patientsTable.observations,
      nutritionistId: patientsTable.nutritionistId,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  if (req.auth!.role === "nutritionist" && row.nutritionistId !== req.auth!.nutritionistId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(row);
});

router.put("/patients/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name: _name, birthDate, ...restPatientFields } = parsed.data;
  const patientFields = {
    ...restPatientFields,
    ...(birthDate !== undefined ? { birthDate: birthDate as unknown as string | null } : {}),
  };

  const [patient] = await db.update(patientsTable).set(patientFields).where(
    and(eq(patientsTable.id, id), eq(patientsTable.nutritionistId, req.auth!.nutritionistId!))
  ).returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  if (parsed.data.name) {
    await db.update(usersTable).set({ name: parsed.data.name }).where(eq(usersTable.id, patient.userId));
  }

  const [row] = await db
    .select({
      id: patientsTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: patientsTable.phone,
      birthDate: patientsTable.birthDate,
      gender: patientsTable.gender,
      height: patientsTable.height,
      weight: patientsTable.weight,
      objective: patientsTable.objective,
      observations: patientsTable.observations,
      nutritionistId: patientsTable.nutritionistId,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.id, id));

  res.json(row);
});

router.delete("/patients/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }

  const [patient] = await db.delete(patientsTable).where(
    and(eq(patientsTable.id, id), eq(patientsTable.nutritionistId, req.auth!.nutritionistId!))
  ).returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, patient.userId));

  res.json({ message: "Patient deleted" });
});

router.put("/patients/:id/reset-password", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient ID" }); return; }
  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "New password (min 6 chars) required" });
    return;
  }
  const [patient] = await db.select().from(patientsTable)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.nutritionistId, req.auth!.nutritionistId!)));
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  const passwordHash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, patient.userId));
  res.json({ message: "Password reset" });
});

router.get("/patient/me", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.auth!.patientId;
  if (!patientId) {
    res.status(403).json({ error: "Not a patient" });
    return;
  }

  const [row] = await db
    .select({
      id: patientsTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: patientsTable.phone,
      birthDate: patientsTable.birthDate,
      gender: patientsTable.gender,
      height: patientsTable.height,
      weight: patientsTable.weight,
      objective: patientsTable.objective,
      observations: patientsTable.observations,
      nutritionistId: patientsTable.nutritionistId,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.id, patientId));

  if (!row) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json(row);
});

export default router;
