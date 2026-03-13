import { apiFetch } from "./auth";

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  height?: number;
  weight?: number;
  objective?: string;
  observations?: string;
  nutritionistId: number;
  createdAt: string;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  id: number;
  dietPlanId: number;
  name: string;
  time?: string;
  description?: string;
  foods?: FoodItem[];
  calories?: number;
  order: number;
}

export interface DietPlan {
  id: number;
  patientId: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  totalCalories?: number;
  meals: Meal[];
  createdAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  nutritionistId: number;
  patientName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  type: "initial" | "followup" | "online" | "inperson";
  notes?: string;
  createdAt: string;
}

export async function getMyProfile(): Promise<Patient> {
  const res = await apiFetch("/patient/me");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function getMyDiets(): Promise<DietPlan[]> {
  const res = await apiFetch("/patient/diets");
  if (!res.ok) throw new Error("Failed to fetch diets");
  return res.json();
}

export async function getDiet(id: number): Promise<DietPlan> {
  const res = await apiFetch(`/diets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch diet");
  return res.json();
}

export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await apiFetch("/appointments");
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
}
