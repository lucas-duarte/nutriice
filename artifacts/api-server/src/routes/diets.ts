import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { dietPlansTable, mealsTable, patientsTable, appointmentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireNutritionist } from "../lib/auth";
import {
  CreateDietPlanBody,
  UpdateDietPlanBody,
  AddMealToDietBody,
  UpdateMealBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getMealsForDiet(dietPlanId: number) {
  return db.select().from(mealsTable).where(eq(mealsTable.dietPlanId, dietPlanId)).orderBy(mealsTable.order);
}

router.get("/patient/diets", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.auth!.patientId;
  if (!patientId) {
    res.status(403).json({ error: "Not a patient" });
    return;
  }
  const diets = await db.select().from(dietPlansTable).where(eq(dietPlansTable.patientId, patientId));
  const dietsWithMeals = await Promise.all(diets.map(async (diet) => ({
    ...diet,
    meals: await getMealsForDiet(diet.id),
  })));
  res.json(dietsWithMeals);
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

router.get("/patients/:id/diets", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const patientId = parseInt(raw, 10);
  if (isNaN(patientId)) {
    res.status(400).json({ error: "Invalid patient ID" });
    return;
  }

  const diets = await db.select().from(dietPlansTable).where(eq(dietPlansTable.patientId, patientId));
  const dietsWithMeals = await Promise.all(diets.map(async (diet) => ({
    ...diet,
    meals: await getMealsForDiet(diet.id),
  })));

  res.json(dietsWithMeals);
});

router.post("/diets", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreateDietPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [diet] = await db.insert(dietPlansTable).values({
    patientId: parsed.data.patientId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    recommendations: parsed.data.recommendations ?? null,
    waterGoalMl: parsed.data.waterGoalMl ?? null,
    startDate: parsed.data.startDate ? (parsed.data.startDate as unknown as string) : null,
    endDate: parsed.data.endDate ? (parsed.data.endDate as unknown as string) : null,
    isActive: parsed.data.isActive ?? true,
  }).returning();

  res.status(201).json({ ...diet, meals: [] });
});

router.get("/diets/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid diet plan ID" });
    return;
  }

  const [diet] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, id));
  if (!diet) {
    res.status(404).json({ error: "Diet plan not found" });
    return;
  }

  const meals = await getMealsForDiet(id);
  res.json({ ...diet, meals });
});

router.put("/diets/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid diet plan ID" });
    return;
  }

  const parsed = UpdateDietPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.recommendations !== undefined) updateData.recommendations = parsed.data.recommendations;
  if (parsed.data.waterGoalMl !== undefined) updateData.waterGoalMl = parsed.data.waterGoalMl;
  if (parsed.data.startDate !== undefined) updateData.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) updateData.endDate = parsed.data.endDate;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [diet] = await db.update(dietPlansTable).set(updateData).where(eq(dietPlansTable.id, id)).returning();
  if (!diet) {
    res.status(404).json({ error: "Diet plan not found" });
    return;
  }

  const meals = await getMealsForDiet(id);
  res.json({ ...diet, meals });
});

router.delete("/diets/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid diet plan ID" });
    return;
  }

  const [diet] = await db.delete(dietPlansTable).where(eq(dietPlansTable.id, id)).returning();
  if (!diet) {
    res.status(404).json({ error: "Diet plan not found" });
    return;
  }

  res.json({ message: "Diet plan deleted" });
});

router.post("/diets/:id/clone", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const sourceId = parseInt(raw, 10);
  if (isNaN(sourceId)) { res.status(400).json({ error: "Invalid diet plan ID" }); return; }

  const [source] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, sourceId));
  if (!source) { res.status(404).json({ error: "Diet plan not found" }); return; }

  const targetPatientId = req.body?.patientId ? parseInt(req.body.patientId) : source.patientId;
  const newName = req.body?.name || `Cópia de ${source.name}`;

  const [newDiet] = await db.insert(dietPlansTable).values({
    patientId: targetPatientId,
    name: newName,
    description: source.description,
    recommendations: source.recommendations,
    waterGoalMl: source.waterGoalMl,
    startDate: null,
    endDate: null,
    isActive: false,
    totalCalories: source.totalCalories,
  }).returning();

  const meals = await db.select().from(mealsTable).where(eq(mealsTable.dietPlanId, sourceId));
  if (meals.length > 0) {
    await db.insert(mealsTable).values(meals.map(m => ({
      dietPlanId: newDiet.id,
      name: m.name,
      time: m.time,
      description: m.description,
      foods: m.foods,
      calories: m.calories,
      order: m.order,
      isSupplement: m.isSupplement,
    })));
  }

  res.status(201).json(newDiet);
});

router.get("/diets/:id/meals", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid diet plan ID" });
    return;
  }
  const meals = await getMealsForDiet(id);
  res.json(meals);
});

router.post("/diets/:id/meals", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const dietPlanId = parseInt(raw, 10);
  if (isNaN(dietPlanId)) {
    res.status(400).json({ error: "Invalid diet plan ID" });
    return;
  }

  const parsed = AddMealToDietBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [meal] = await db.insert(mealsTable).values({
    dietPlanId,
    name: parsed.data.name,
    time: parsed.data.time ?? null,
    description: parsed.data.description ?? null,
    foods: parsed.data.foods ?? null,
    calories: parsed.data.calories ?? null,
    order: parsed.data.order ?? 0,
    isSupplement: parsed.data.isSupplement ?? false,
  }).returning();

  res.status(201).json(meal);
});

router.put("/meals/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid meal ID" });
    return;
  }

  const parsed = UpdateMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.time !== undefined) updateData.time = parsed.data.time;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.isSupplement !== undefined) updateData.isSupplement = parsed.data.isSupplement;
  if (parsed.data.foods !== undefined) updateData.foods = parsed.data.foods;
  if (parsed.data.calories !== undefined) updateData.calories = parsed.data.calories;
  if (parsed.data.order !== undefined) updateData.order = parsed.data.order;

  const [meal] = await db.update(mealsTable).set(updateData).where(eq(mealsTable.id, id)).returning();
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  res.json(meal);
});

router.delete("/meals/:id", requireAuth, requireNutritionist, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid meal ID" });
    return;
  }

  const [meal] = await db.delete(mealsTable).where(eq(mealsTable.id, id)).returning();
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  res.json({ message: "Meal deleted" });
});

router.get("/patient/diets", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.auth!.patientId;
  if (!patientId) {
    res.status(403).json({ error: "Not a patient" });
    return;
  }

  const diets = await db.select().from(dietPlansTable).where(eq(dietPlansTable.patientId, patientId));
  const dietsWithMeals = await Promise.all(diets.map(async (diet) => ({
    ...diet,
    meals: await getMealsForDiet(diet.id),
  })));

  res.json(dietsWithMeals);
});

export default router;
