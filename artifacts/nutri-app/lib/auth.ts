import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: "nutritionist" | "patient";
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem("auth_token", token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem("auth_token");
}

export async function getUser(): Promise<UserInfo | null> {
  const raw = await AsyncStorage.getItem("user_info");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setUser(user: UserInfo): Promise<void> {
  await AsyncStorage.setItem("user_info", JSON.stringify(user));
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove(["auth_token", "user_info"]);
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function login(email: string, password: string): Promise<UserInfo> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }
  const data = await res.json();
  await setToken(data.token);
  await setUser(data.user);
  return data.user;
}

export async function logout(): Promise<void> {
  await clearAuth();
}
