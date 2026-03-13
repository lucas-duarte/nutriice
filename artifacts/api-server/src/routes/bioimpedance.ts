import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bioimpedanceTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireNutritionist } from "../lib/auth";

const router: IRouter = Router();

router.get("/patients/:id/bioimpedance", requireAuth, async (req, res): Promise<void> => {
  const patientId = parseInt(req.params.id, 10);
  if (isNaN(patientId)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }
  const records = await db
    .select()
    .from(bioimpedanceTable)
    .where(eq(bioimpedanceTable.patientId, patientId))
    .orderBy(desc(bioimpedanceTable.dataBio));
  res.json(records);
});

router.post("/patients/:id/bioimpedance", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const patientId = parseInt(req.params.id, 10);
  if (isNaN(patientId)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }
  const body = req.body as Record<string, unknown>;
  if (!body.dataBio || typeof body.dataBio !== "string") {
    res.status(400).json({ error: "dataBio is required" });
    return;
  }

  const toNum = (v: unknown): number | null =>
    v !== undefined && v !== null && v !== "" ? Number(v) : null;
  const toInt = (v: unknown): number | null => {
    const n = toNum(v);
    return n !== null ? Math.round(n) : null;
  };

  const [record] = await db.insert(bioimpedanceTable).values({
    patientId,
    dataBio: body.dataBio as unknown as string,
    peso: toNum(body.peso),
    imc: toNum(body.imc),
    gorduraCorporal: toNum(body.gorduraCorporal),
    aguaCorporal: toNum(body.aguaCorporal),
    massaEsqueletica: toNum(body.massaEsqueletica),
    tmb: toNum(body.tmb),
    massaLivreGordura: toNum(body.massaLivreGordura),
    gorduraSubcutanea: toNum(body.gorduraSubcutanea),
    gorduraVisceral: toNum(body.gorduraVisceral),
    massaMuscular: toNum(body.massaMuscular),
    massaOssea: toNum(body.massaOssea),
    proteina: toNum(body.proteina),
    idadeMetabolica: toInt(body.idadeMetabolica),
  }).returning();
  res.status(201).json(record);
});

router.delete("/bioimpedance/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [deleted] = await db.delete(bioimpedanceTable).where(eq(bioimpedanceTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json({ message: "Record deleted" });
});

export default router;
