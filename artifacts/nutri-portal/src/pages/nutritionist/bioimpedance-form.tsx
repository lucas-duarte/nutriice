import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthReq } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Activity } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const FIELDS: { key: string; label: string; unit: string; step: string; description?: string }[] = [
  { key: "dataBio", label: "Data da Medição", unit: "", step: "", description: "" },
  { key: "peso", label: "Peso", unit: "kg", step: "0.1" },
  { key: "imc", label: "IMC", unit: "kg/m²", step: "0.1" },
  { key: "gorduraCorporal", label: "Gordura Corporal", unit: "%", step: "0.1" },
  { key: "aguaCorporal", label: "Água Corporal", unit: "%", step: "0.1" },
  { key: "massaEsqueletica", label: "Massa Esquelética", unit: "kg", step: "0.1" },
  { key: "tmb", label: "TMB (Taxa Metabólica Basal)", unit: "kcal", step: "1" },
  { key: "massaLivreGordura", label: "Massa Livre de Gordura", unit: "kg", step: "0.1" },
  { key: "gorduraSubcutanea", label: "Gordura Subcutânea", unit: "%", step: "0.1" },
  { key: "gorduraVisceral", label: "Gordura Visceral", unit: "nível", step: "1" },
  { key: "massaMuscular", label: "Massa Muscular", unit: "kg", step: "0.1" },
  { key: "massaOssea", label: "Massa Óssea", unit: "kg", step: "0.01" },
  { key: "proteina", label: "Proteína", unit: "%", step: "0.1" },
  { key: "idadeMetabolica", label: "Idade Metabólica", unit: "anos", step: "1" },
];

export default function BioimpedanceForm() {
  const [, params] = useRoute("/patients/:id/bioimpedance/new");
  const patientId = parseInt(params?.id || "0");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<Record<string, string>>({
    dataBio: today,
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dataBio) {
      toast({ title: "Campo obrigatório", description: "Informe a data da medição.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = { dataBio: form.dataBio };
      for (const field of FIELDS) {
        if (field.key === "dataBio") continue;
        const raw = form[field.key];
        if (raw !== undefined && raw !== "") {
          body[field.key] = Number(raw);
        }
      }
      const res = await fetch(`${BASE}/api/patients/${patientId}/bioimpedance`, {
        method: "POST",
        ...getAuthReq(),
        headers: { ...(getAuthReq().headers as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["bioimpedance", patientId] });
      toast({ title: "Medição registrada!", description: "Dados de bioimpedância salvos com sucesso." });
      navigate(`/patients/${patientId}/dashboard`);
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar. Verifique os dados.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}/dashboard`}>
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Activity size={26} className="text-primary" />
            Nova Medição de Bioimpedância
          </h1>
          <p className="text-muted-foreground">Registre os dados da avaliação corporal do paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2 rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Data da Medição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label htmlFor="dataBio">Data *</Label>
                <Input
                  id="dataBio"
                  type="date"
                  className="mt-1 rounded-xl"
                  value={form.dataBio || ""}
                  onChange={e => handleChange("dataBio", e.target.value)}
                  required
                  max={today}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Indicadores Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {FIELDS.filter(f => ["peso", "imc", "gorduraCorporal", "massaMuscular", "aguaCorporal", "massaEsqueletica"].includes(f.key)).map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.unit && <span className="text-muted-foreground ml-1 font-normal">({field.unit})</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    min="0"
                    className="mt-1 rounded-xl"
                    placeholder="—"
                    value={form[field.key] || ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Indicadores Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {FIELDS.filter(f => ["tmb", "massaLivreGordura", "gorduraSubcutanea", "gorduraVisceral", "massaOssea", "proteina", "idadeMetabolica"].includes(f.key)).map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.unit && <span className="text-muted-foreground ml-1 font-normal">({field.unit})</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    min="0"
                    className="mt-1 rounded-xl"
                    placeholder="—"
                    value={form[field.key] || ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link href={`/patients/${patientId}/dashboard`}>
              <Button type="button" variant="outline" className="rounded-xl">Cancelar</Button>
            </Link>
            <Button type="submit" className="rounded-xl shadow-md min-w-[140px]" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Salvar Medição
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
