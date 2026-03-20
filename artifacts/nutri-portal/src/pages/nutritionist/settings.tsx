import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar, CheckCircle2, XCircle, ExternalLink, Unlink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuthReq } from "@/lib/api-helpers";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

async function fetchCalendarStatus(): Promise<boolean> {
  const res = await fetch(`${BASE}/api/calendar/status`, getAuthReq());
  if (!res.ok) return false;
  const data = await res.json();
  return data.connected === true;
}

async function fetchAuthUrl(): Promise<string | null> {
  const res = await fetch(`${BASE}/api/auth/google`, getAuthReq());
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}

async function disconnectCalendar(): Promise<boolean> {
  const res = await fetch(`${BASE}/api/calendar/disconnect`, {
    method: "DELETE",
    ...getAuthReq(),
  });
  return res.ok;
}

export default function Settings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get("google_auth");
    if (googleAuth === "success") {
      toast({ title: "Google Agenda vinculada com sucesso!", description: "Suas consultas serão sincronizadas automaticamente." });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (googleAuth === "error") {
      toast({ title: "Falha ao vincular Google Agenda", description: "Tente novamente ou verifique as permissões.", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    fetchCalendarStatus().then(setConnected);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const url = await fetchAuthUrl();
      if (url) {
        window.location.href = url;
      } else {
        toast({ title: "Erro ao iniciar autenticação", variant: "destructive" });
        setIsConnecting(false);
      }
    } catch {
      toast({ title: "Erro ao conectar", variant: "destructive" });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const ok = await disconnectCalendar();
      if (ok) {
        setConnected(false);
        toast({ title: "Google Agenda desvinculada." });
      } else {
        toast({ title: "Erro ao desvincular", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao desvincular", variant: "destructive" });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as integrações e preferências do sistema.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar size={22} className="text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Agenda</CardTitle>
              <CardDescription>Sincronize consultas automaticamente com seu Google Calendar.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected === null ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Verificando status...</span>
            </div>
          ) : connected ? (
            <>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3">
                <CheckCircle2 size={18} />
                <span className="font-medium text-sm">Vinculada — consultas são sincronizadas automaticamente</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ao criar uma nova consulta no sistema, ela será adicionada automaticamente ao seu Google Calendar.
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Unlink size={16} className="mr-2" />}
                Desvincular Google Agenda
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3">
                <XCircle size={18} />
                <span className="font-medium text-sm">Não vinculada</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Conecte sua conta Google para que as consultas agendadas neste sistema sejam adicionadas automaticamente ao seu Google Calendar.
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isConnecting ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <ExternalLink size={16} className="mr-2" />
                )}
                Vincular com Google Agenda
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
