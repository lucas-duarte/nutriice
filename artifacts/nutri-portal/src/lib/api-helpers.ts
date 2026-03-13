export const getAuthReq = (): RequestInit => {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
};

export const getAuthOptions = () => ({
  request: getAuthReq()
});

const API_ERROR_MESSAGES: Record<string, string> = {
  "Email already registered": "Este e-mail já está cadastrado no sistema.",
  "Invalid request body": "Dados inválidos. Verifique os campos e tente novamente.",
  "Invalid credentials": "E-mail ou senha incorretos.",
  "Unauthorized": "Sessão expirada. Faça login novamente.",
  "Forbidden": "Você não tem permissão para esta ação.",
  "Patient not found": "Paciente não encontrado.",
  "Diet not found": "Plano alimentar não encontrado.",
  "Meal not found": "Refeição não encontrada.",
  "Appointment not found": "Consulta não encontrada.",
  "Nutritionist not found": "Nutricionista não encontrado.",
};

export function extractApiError(error: unknown, fallback = "Ocorreu um erro inesperado. Tente novamente."): string {
  if (!error || typeof error !== "object") return fallback;

  const err = error as any;

  if (err.status === 401) return "Sessão expirada. Faça login novamente.";
  if (err.status === 403) return "Você não tem permissão para esta ação.";
  if (err.status === 404) return "Registro não encontrado.";

  const apiMessage = err.data?.error as string | undefined;
  if (apiMessage && API_ERROR_MESSAGES[apiMessage]) {
    return API_ERROR_MESSAGES[apiMessage];
  }

  if (apiMessage) return apiMessage;

  if (err.message && !err.message.startsWith("HTTP")) return err.message;

  return fallback;
}
