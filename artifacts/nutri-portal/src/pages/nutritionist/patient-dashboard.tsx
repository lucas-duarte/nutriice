import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthReq } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Loader2, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface BioRecord {
  id: number;
  patientId: number;
  dataBio: string;
  peso: number | null;
  imc: number | null;
  gorduraCorporal: number | null;
  aguaCorporal: number | null;
  massaEsqueletica: number | null;
  tmb: number | null;
  massaLivreGordura: number | null;
  gorduraSubcutanea: number | null;
  gorduraVisceral: number | null;
  massaMuscular: number | null;
  massaOssea: number | null;
  proteina: number | null;
  idadeMetabolica: number | null;
}

const METRICS: { key: keyof BioRecord; label: string; unit: string; color: string; decimals?: number }[] = [
  { key: "peso", label: "Peso", unit: "kg", color: "#22C55E" },
  { key: "imc", label: "IMC", unit: "", color: "#3B82F6", decimals: 1 },
  { key: "gorduraCorporal", label: "Gordura Corporal", unit: "%", color: "#EF4444" },
  { key: "massaMuscular", label: "Massa Muscular", unit: "kg", color: "#8B5CF6" },
  { key: "aguaCorporal", label: "Água Corporal", unit: "%", color: "#06B6D4" },
  { key: "massaEsqueletica", label: "Massa Esquelética", unit: "kg", color: "#F59E0B" },
  { key: "tmb", label: "TMB", unit: "kcal", color: "#EC4899" },
  { key: "massaLivreGordura", label: "Massa Livre de Gordura", unit: "kg", color: "#10B981" },
  { key: "gorduraSubcutanea", label: "Gordura Subcutânea", unit: "%", color: "#F97316" },
  { key: "gorduraVisceral", label: "Gordura Visceral", unit: "", color: "#DC2626" },
  { key: "massaOssea", label: "Massa Óssea", unit: "kg", color: "#6366F1" },
  { key: "proteina", label: "Proteína", unit: "%", color: "#84CC16" },
  { key: "idadeMetabolica", label: "Idade Metabólica", unit: "anos", color: "#64748B" },
];

function Trend({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return <Minus size={14} className="text-muted-foreground" />;
  if (diff > 0) return <TrendingUp size={14} className="text-red-500" />;
  return <TrendingDown size={14} className="text-green-500" />;
}

function MetricChart({ metric, records }: { metric: typeof METRICS[0]; records: BioRecord[] }) {
  const data = [...records]
    .reverse()
    .map(r => ({
      date: format(new Date(r.dataBio + "T12:00:00"), "dd/MM", { locale: ptBR }),
      value: r[metric.key] as number | null,
    }))
    .filter(d => d.value !== null);

  if (data.length < 2) return null;

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
          {metric.label}
          {metric.unit && <span className="text-muted-foreground font-normal">({metric.unit})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number) => [`${Number(v).toFixed(metric.decimals ?? 1)} ${metric.unit}`, metric.label]}
              labelFormatter={(l) => `Data: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              dot={{ r: 3, fill: metric.color }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function PatientDashboard() {
  const [, params] = useRoute("/patients/:id/dashboard");
  const patientId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<BioRecord[]>({
    queryKey: ["bioimpedance", patientId],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/patients/${patientId}/bioimpedance`, getAuthReq());
      if (!res.ok) throw new Error("Falha ao carregar");
      return res.json();
    },
    enabled: !!patientId,
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Remover esta medição?")) return;
    try {
      const res = await fetch(`${BASE}/api/bioimpedance/${id}`, { method: "DELETE", ...getAuthReq() });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["bioimpedance", patientId] });
      toast({ title: "Removida", description: "Medição removida com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Falha ao remover medição.", variant: "destructive" });
    }
  };

  const latest = records[0];
  const previous = records[1];

  const chartsWithData = METRICS.filter(m =>
    records.filter(r => r[m.key] !== null).length >= 2
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Activity size={28} className="text-primary" />
              Dashboard de Bioimpedância
            </h1>
            <p className="text-muted-foreground">Acompanhe a evolução da composição corporal</p>
          </div>
        </div>
        <Link href={`/patients/${patientId}/bioimpedance/new`}>
          <Button className="rounded-xl shadow-md">
            <Plus size={18} className="mr-2" /> Nova Medição
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <Activity size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-lg mb-4">Nenhuma medição registrada ainda.</p>
          <Link href={`/patients/${patientId}/bioimpedance/new`}>
            <Button className="rounded-xl"><Plus size={18} className="mr-2" /> Registrar Primeira Medição</Button>
          </Link>
        </div>
      ) : (
        <>
          {latest && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                Última medição — {format(new Date(latest.dataBio + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {METRICS.map(m => {
                  const val = latest[m.key] as number | null;
                  if (val === null) return null;
                  return (
                    <Card key={m.key} className="rounded-xl border-border/50 shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <Trend current={val} previous={previous ? previous[m.key] as number | null : null} />
                        </div>
                        <p className="text-xl font-bold text-foreground" style={{ color: m.color }}>
                          {Number(val).toFixed(m.decimals ?? 1)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">{m.unit}</span>
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {chartsWithData.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Evolução ao longo do tempo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {chartsWithData.map(m => (
                  <MetricChart key={m.key} metric={m} records={records} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Histórico de Medições</h2>
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Data</th>
                      {METRICS.slice(0, 6).map(m => (
                        <th key={m.key} className="text-left px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">{m.label}</th>
                      ))}
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {format(new Date(r.dataBio + "T12:00:00"), "dd/MM/yyyy")}
                        </td>
                        {METRICS.slice(0, 6).map(m => (
                          <td key={m.key} className="px-3 py-3 text-foreground">
                            {r[m.key] !== null ? `${Number(r[m.key]).toFixed(1)} ${m.unit}` : "—"}
                          </td>
                        ))}
                        <td className="px-3 py-3">
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDelete(r.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
