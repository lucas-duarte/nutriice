import { useRoute } from "wouter";
import { Link } from "wouter";
import { useGetPatient, useListPatientDiets, useListAppointments } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, Calendar, Activity, Apple, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const id = parseInt(params?.id || "0");

  const { data: patient, isLoading: isPatientLoading } = useGetPatient(id, getAuthOptions());
  const { data: diets, isLoading: isDietsLoading } = useListPatientDiets(id, getAuthOptions());
  const { data: appointments, isLoading: isApptsLoading } = useListAppointments({ patientId: id }, getAuthOptions());

  if (isPatientLoading) return <div className="p-12 text-center">Carregando dados do paciente...</div>;
  if (!patient) return <div className="p-12 text-center text-destructive">Paciente não encontrado.</div>;

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
        <Button variant="outline" className="rounded-xl bg-white">
          <Edit size={16} className="mr-2" /> Editar
        </Button>
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
              <TabsList className="grid w-[400px] grid-cols-2 bg-secondary rounded-xl p-1">
                <TabsTrigger value="diets" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Planos Alimentares</TabsTrigger>
                <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Consultas</TabsTrigger>
              </TabsList>
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

            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
