import { useRoute } from "wouter";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useGetPatient, useListPatientDiets, useListAppointments } from "@workspace/api-client-react";
import { getAuthOptions, getAuthReq } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, Calendar, Activity, Apple, Loader2, Scale, TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";
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
  if (Math.abs(diff) < 0.01) return <Minus size={13} className="text-muted-foreground" />;
  if (diff > 0) return <TrendingUp size={13} className="text-red-500" />;
  return <TrendingDown size={13} className="text-green-500" />;
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
    <Card className="rounded-xl border-border/50 shadow-sm">
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: metric.color }} />
        <span className="text-xs font-semibold text-foreground">{metric.label}</span>
        {metric.unit && <span className="text-xs text-muted-foreground">({metric.unit})</span>}
      </div>
      <CardContent className="px-2 pb-3 pt-1">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
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

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const id = parseInt(params?.id || "0");

  const { data: patient, isLoading: isPatientLoading } = useGetPatient(id, getAuthOptions());
  const { data: diets, isLoading: isDietsLoading } = useListPatientDiets(id, getAuthOptions());
  const { data: appointments, isLoading: isApptsLoading } = useListAppointments({ patientId: id }, getAuthOptions());

  const [bioRecords, setBioRecords] = useState<BioRecord[]>([]);
  const [isBioLoading, setIsBioLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsBioLoading(true);
    fetch(`${BASE}/api/patients/${id}/bioimpedance`, getAuthReq())
      .then(r => r.ok ? r.json() : [])
      .then(data => setBioRecords(data))
      .catch(() => setBioRecords([]))
      .finally(() => setIsBioLoading(false));
  }, [id]);

  if (isPatientLoading) return <div className="p-12 text-center">Carregando dados do paciente...</div>;
  if (!patient) return <div className="p-12 text-center text-destructive">Paciente não encontrado.</div>;

  const latest = bioRecords[0];
  const previous = bioRecords[1];
  const chartsWithData = METRICS.filter(m =>
    bioRecords.filter(r => r[m.key] !== null).length >= 2
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/patients">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-foreground">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.email} {patient.phone ? ` • ${patient.phone}` : ''}</p>
        </div>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="outline" className="rounded-xl bg-white">
            <Edit size={16} className="mr-2" /> Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 rounded-2xl shadow-sm border-border/50 h-fit">
          <CardContent className="p-6">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {patient.name.charAt(0)}
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Objetivo</p>
                <p className="font-medium">{patient.objective || "Não informado"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Peso</p>
                  <p className="font-medium">{patient.weight ? `${patient.weight} kg` : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Altura</p>
                  <p className="font-medium">{patient.height ? `${patient.height} cm` : "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nascimento</p>
                <p className="font-medium">{patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              {patient.observations && (
                <div>
                  <p className="text-muted-foreground text-xs">Observações</p>
                  <p className="font-medium bg-secondary/50 p-2 rounded-lg mt-1">{patient.observations}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 rounded-2xl shadow-sm border-border/50">
          <Tabs defaultValue="diets" className="w-full">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <TabsList className="grid w-full max-w-[560px] grid-cols-3 bg-secondary rounded-xl p-1">
                  <TabsTrigger value="diets" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Planos Alimentares</TabsTrigger>
                  <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Consultas</TabsTrigger>
                  <TabsTrigger value="bioimpedance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bioimpedância</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="p-6 min-h-[400px]">

              <TabsContent value="diets" className="mt-0 outline-none">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2"><Apple size={20} className="text-primary"/> Dietas Prescritas</h3>
                  <Link href={`/patients/${patient.id}/diets/new`}>
                    <Button size="sm" className="rounded-xl shadow-sm">
                      <Plus size={16} className="mr-2"/> Nova Dieta
                    </Button>
                  </Link>
                </div>

                {isDietsLoading ? (
                  <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                ) : diets && diets.length > 0 ? (
                  <div className="space-y-4">
                    {diets.map(diet => (
                      <Link key={diet.id} href={`/diets/${diet.id}`}>
                        <div className="border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center bg-card">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{diet.name}</h4>
                              {diet.isActive && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">Ativa</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{diet.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{diet.totalCalories ? `${diet.totalCalories} kcal` : ''}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {diet.startDate && format(new Date(diet.startDate), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/20">
                    <p className="text-muted-foreground mb-4">Nenhum plano alimentar criado para este paciente.</p>
                    <Link href={`/patients/${patient.id}/diets/new`}>
                      <Button variant="outline" className="rounded-xl bg-white"><Plus size={16} className="mr-2"/> Criar Primeiro Plano</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="appointments" className="mt-0 outline-none">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2"><Calendar size={20} className="text-blue-500"/> Histórico de Consultas</h3>
                  <Link href={`/appointments/new?patientId=${patient.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl border-blue-500 text-blue-600 hover:bg-blue-50">
                      <Plus size={16} className="mr-2"/> Agendar
                    </Button>
                  </Link>
                </div>

                {isApptsLoading ? (
                  <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map(apt => (
                      <div key={apt.id} className="border rounded-xl p-4 flex justify-between items-center bg-card">
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            {format(new Date(apt.scheduledAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            <span className="text-muted-foreground font-normal">• {format(new Date(apt.scheduledAt), "HH:mm")}</span>
                          </p>
                          <p className="text-sm text-muted-foreground capitalize mt-1 flex items-center gap-1">
                            <Activity size={14}/> {apt.type === 'inperson' ? 'Presencial' : 'Online'} - {apt.type === 'initial' ? 'Primeira Consulta' : 'Retorno'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${apt.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                          ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Pendente' : apt.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/20">
                    <p className="text-muted-foreground">Nenhuma consulta agendada.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bioimpedance" className="mt-0 outline-none">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Scale size={20} className="text-violet-500"/> Bioimpedância
                  </h3>
                  <div className="flex gap-2">
                    <Link href={`/patients/${patient.id}/dashboard`}>
                      <Button size="sm" variant="outline" className="rounded-xl border-violet-300 text-violet-700 hover:bg-violet-50">
                        <BarChart2 size={15} className="mr-1.5"/> Dashboard
                      </Button>
                    </Link>
                    <Link href={`/patients/${patient.id}/bioimpedance/new`}>
                      <Button size="sm" className="rounded-xl bg-violet-600 hover:bg-violet-700 shadow-sm">
                        <Plus size={16} className="mr-1.5"/> Novo Registro
                      </Button>
                    </Link>
                  </div>
                </div>

                {isBioLoading ? (
                  <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" /></div>
                ) : bioRecords.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/20">
                    <Scale size={32} className="mx-auto text-muted-foreground mb-3 opacity-50"/>
                    <p className="text-muted-foreground mb-4">Nenhum registro de bioimpedância para este paciente.</p>
                    <Link href={`/patients/${patient.id}/bioimpedance/new`}>
                      <Button variant="outline" className="rounded-xl bg-white border-violet-300 text-violet-700">
                        <Plus size={16} className="mr-2"/> Adicionar Primeiro Registro
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {latest && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Última medição — {format(new Date(latest.dataBio + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {METRICS.map(m => {
                            const val = latest[m.key] as number | null;
                            if (val === null) return null;
                            return (
                              <div key={m.key} className="rounded-xl border border-border/60 bg-card p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs text-muted-foreground">{m.label}</p>
                                  <Trend current={val} previous={previous ? previous[m.key] as number | null : null} />
                                </div>
                                <p className="text-lg font-bold" style={{ color: m.color }}>
                                  {Number(val).toFixed(m.decimals ?? 1)}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">{m.unit}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {chartsWithData.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Evolução ao longo do tempo</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {chartsWithData.map(m => (
                            <MetricChart key={m.key} metric={m} records={bioRecords} />
                          ))}
                        </div>
                      </div>
                    )}

                    {bioRecords.length > 1 && chartsWithData.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Adicione pelo menos 2 registros com a mesma métrica para ver os gráficos de evolução.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
