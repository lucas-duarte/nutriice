import { useListPatients, useListAppointments } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, Activity, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: patients, isLoading: isLoadingPatients } = useListPatients(getAuthOptions());
  const { data: appointments, isLoading: isLoadingAppts } = useListAppointments(undefined, getAuthOptions());

  const todayAppointments = appointments?.filter(a => isToday(new Date(a.scheduledAt))) || [];
  const pendingAppointments = appointments?.filter(a => a.status === "pending") || [];

  if (isLoadingPatients || isLoadingAppts) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando painel...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo(a) ao seu painel Nutriice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-md shadow-primary/5 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pacientes</CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pacientes ativos na clínica</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-md shadow-blue-500/5 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consultas Hoje</CardTitle>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CalendarIcon size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Agendadas para o dia de hoje</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-md shadow-amber-500/5 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Confirmação</CardTitle>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Activity size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">{pendingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Consultas pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Consultas Recentes</CardTitle>
            <Link href="/appointments" className="text-sm text-primary hover:underline flex items-center">
              Ver todas <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.patientName?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.scheduledAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${apt.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {apt.status === 'confirmed' && 'Confirmada'}
                        {apt.status === 'pending' && 'Pendente'}
                        {apt.status === 'cancelled' && 'Cancelada'}
                        {apt.status === 'completed' && 'Concluída'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhuma consulta agendada.</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Pacientes Adicionados Recentemente</CardTitle>
            <Link href="/patients" className="text-sm text-primary hover:underline flex items-center">
              Ver todos <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {patients && patients.length > 0 ? (
              <div className="space-y-4">
                {patients.slice(0, 5).map(p => (
                  <Link key={p.id} href={`/patients/${p.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={18} className="text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhum paciente cadastrado ainda.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
