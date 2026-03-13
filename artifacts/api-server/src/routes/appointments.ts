import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, usersTable, patientsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireNutritionist } from "../lib/auth";
import { CreateAppointmentBody, UpdateAppointmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getAppointmentWithPatientName(appointmentId: number) {
  const [row] = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      nutritionistId: appointmentsTable.nutritionistId,
      patientName: usersTable.name,
      scheduledAt: appointmentsTable.scheduledAt,
      durationMinutes: appointmentsTable.durationMinutes,
      status: appointmentsTable.status,
      type: appointmentsTable.type,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(appointmentsTable.id, appointmentId));
  return row;
}

router.get("/appointments", requireAuth, async (req, res): Promise<void> => {
  const auth = req.auth!;

  let rows: {
    id: number;
    patientId: number;
    nutritionistId: number;
    patientName: string;
    scheduledAt: Date;
    durationMinutes: number;
    status: string;
    type: string;
    notes: string | null;
    createdAt: Date;
  }[];

  if (auth.role === "nutritionist") {
    const nutritionistId = auth.nutritionistId!;
    const statusFilter = req.query.status as string | undefined;
    const patientIdFilter = req.query.patientId ? parseInt(req.query.patientId as string, 10) : undefined;

    rows = await db
      .select({
        id: appointmentsTable.id,
        patientId: appointmentsTable.patientId,
        nutritionistId: appointmentsTable.nutritionistId,
        patientName: usersTable.name,
        scheduledAt: appointmentsTable.scheduledAt,
        durationMinutes: appointmentsTable.durationMinutes,
        status: appointmentsTable.status,
        type: appointmentsTable.type,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
      })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .where(eq(appointmentsTable.nutritionistId, nutritionistId));

    if (statusFilter) {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (patientIdFilter) {
      rows = rows.filter((r) => r.patientId === patientIdFilter);
    }
  } else {
    const patientId = auth.patientId!;
    rows = await db
      .select({
        id: appointmentsTable.id,
        patientId: appointmentsTable.patientId,
        nutritionistId: appointmentsTable.nutritionistId,
        patientName: usersTable.name,
        scheduledAt: appointmentsTable.scheduledAt,
        durationMinutes: appointmentsTable.durationMinutes,
        status: appointmentsTable.status,
        type: appointmentsTable.type,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
      })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .where(eq(appointmentsTable.patientId, patientId));
  }

  res.json(rows);
});

router.post("/appointments", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const nutritionistId = req.auth!.nutritionistId!;
  const [appt] = await db.insert(appointmentsTable).values({
    patientId: parsed.data.patientId,
    nutritionistId,
    scheduledAt: new Date(parsed.data.scheduledAt),
    durationMinutes: parsed.data.durationMinutes ?? 60,
    status: "pending",
    type: parsed.data.type,
    notes: parsed.data.notes ?? null,
  }).returning();

  const row = await getAppointmentWithPatientName(appt.id);
  res.status(201).json(row);
});

router.get("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid appointment ID" });
    return;
  }

  const row = await getAppointmentWithPatientName(id);
  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json(row);
});

router.put("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid appointment ID" });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.scheduledAt !== undefined) updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  if (parsed.data.durationMinutes !== undefined) updateData.durationMinutes = parsed.data.durationMinutes;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [appt] = await db.update(appointmentsTable).set(updateData).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const row = await getAppointmentWithPatientName(id);
  res.json(row);
});

router.delete("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid appointment ID" });
    return;
  }

  const [appt] = await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json({ message: "Appointment deleted" });
});

router.get("/patient/appointments", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.auth!.patientId;
  if (!patientId) {
    res.status(403).json({ error: "Not a patient" });
    return;
  }

  const rows = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      nutritionistId: appointmentsTable.nutritionistId,
      patientName: usersTable.name,
      scheduledAt: appointmentsTable.scheduledAt,
      durationMinutes: appointmentsTable.durationMinutes,
      status: appointmentsTable.status,
      type: appointmentsTable.type,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(appointmentsTable.patientId, patientId));

  res.json(rows);
});

export default router;
