import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, nutritionistsTable, patientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword, requireAuth } from "../lib/auth";
import { LoginBody, RegisterNutritionistBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  let nutritionistId: number | undefined;
  let patientId: number | undefined;

  if (user.role === "nutritionist") {
    const [nutri] = await db.select().from(nutritionistsTable).where(eq(nutritionistsTable.userId, user.id));
    nutritionistId = nutri?.id;
  } else if (user.role === "patient") {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.userId, user.id));
    patientId = patient?.id;
  }

  const token = signToken({ userId: user.id, role: user.role as "nutritionist" | "patient", nutritionistId, patientId });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.post("/auth/register/nutritionist", async (req, res): Promise<void> => {
  const parsed = RegisterNutritionistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, email, password, crn, phone } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role: "nutritionist" }).returning();
  const [nutri] = await db.insert(nutritionistsTable).values({ userId: user.id, crn, phone: phone ?? null }).returning();

  const token = signToken({ userId: user.id, role: "nutritionist", nutritionistId: nutri.id });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const auth = req.auth!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
