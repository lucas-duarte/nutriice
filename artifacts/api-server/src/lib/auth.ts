import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "nutri-planner-secret-key-change-in-production";

export interface AuthPayload {
  userId: number;
  role: "nutritionist" | "patient";
  nutritionistId?: number;
  patientId?: number;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireNutritionist(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== "nutritionist") {
    res.status(403).json({ error: "Forbidden: nutritionist access required" });
    return;
  }
  next();
}

export function requirePatient(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== "patient") {
    res.status(403).json({ error: "Forbidden: patient access required" });
    return;
  }
  next();
}
