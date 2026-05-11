import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { db } from "@workspace/db";
import { nutritionistsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireNutritionist } from "../lib/auth";

const router = Router();

const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

async function getCalendarClient(nutritionistId: number) {
  const [n] = await db.select().from(nutritionistsTable).where(eq(nutritionistsTable.id, nutritionistId));
  if (!n?.googleAccessToken) return null;
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
  client.setCredentials({
    access_token: n.googleAccessToken,
    refresh_token: n.googleRefreshToken,
  });
  client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await db.update(nutritionistsTable).set({
        googleAccessToken: tokens.access_token,
        ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
      }).where(eq(nutritionistsTable.id, nutritionistId));
    }
  });
  return { client, nutritionist: n };
}

router.get("/auth/google", requireAuth, requireNutritionist, (req: Request, res: Response) => {
  const nutritionistId = req.auth!.nutritionistId!;
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: String(nutritionistId),
    prompt: "consent",
  });
  res.json({ url });
});

router.get("/auth/google/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  const frontendBase = process.env.FRONTEND_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

  if (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${frontendBase}/settings?google_auth=error`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendBase}/settings?google_auth=error`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    const nutritionistId = parseInt(state as string);

    if (isNaN(nutritionistId)) {
      return res.redirect(`${frontendBase}/settings?google_auth=error`);
    }

    await db.update(nutritionistsTable).set({
      googleAccessToken: tokens.access_token || null,
      googleRefreshToken: tokens.refresh_token || null,
    }).where(eq(nutritionistsTable.id, nutritionistId));

    res.redirect(`${frontendBase}/settings?google_auth=success`);
  } catch (err) {
    console.error("Erro no callback do Google:", err);
    res.redirect(`${frontendBase}/settings?google_auth=error`);
  }
});

router.get("/calendar/status", requireAuth, requireNutritionist, async (req: Request, res: Response) => {
  const nutritionistId = req.auth!.nutritionistId!;
  const [n] = await db.select().from(nutritionistsTable).where(eq(nutritionistsTable.id, nutritionistId));
  res.json({ connected: !!n?.googleAccessToken });
});

router.delete("/calendar/disconnect", requireAuth, requireNutritionist, async (req: Request, res: Response) => {
  const nutritionistId = req.auth!.nutritionistId!;
  await db.update(nutritionistsTable).set({
    googleAccessToken: null,
    googleRefreshToken: null,
  }).where(eq(nutritionistsTable.id, nutritionistId));
  res.json({ success: true });
});

router.post("/calendar/events", requireAuth, requireNutritionist, async (req: Request, res: Response) => {
  const nutritionistId = req.auth!.nutritionistId!;
  const { title, description, startDateTime, endDateTime, attendeeEmail } = req.body;

  if (!title || !startDateTime || !endDateTime) {
    res.status(400).json({ error: "title, startDateTime e endDateTime são obrigatórios" });
    return;
  }

  const result = await getCalendarClient(nutritionistId);
  if (!result) {
    res.status(403).json({ error: "Google Calendar não conectado." });
    return;
  }

  try {
    const cal = google.calendar({ version: "v3", auth: result.client });
    const event: any = {
      summary: title,
      description: description || "",
      start: { dateTime: startDateTime, timeZone: "America/Sao_Paulo" },
      end: { dateTime: endDateTime, timeZone: "America/Sao_Paulo" },
    };
    if (attendeeEmail) event.attendees = [{ email: attendeeEmail }];
    const created = await cal.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: attendeeEmail ? "all" : "none",
    });
    res.status(201).json({ event: created.data });
  } catch (err) {
    console.error("Erro ao criar evento:", err);
    res.status(500).json({ error: "Falha ao criar evento no Google Calendar" });
  }
});

export { getCalendarClient };
export default router;
