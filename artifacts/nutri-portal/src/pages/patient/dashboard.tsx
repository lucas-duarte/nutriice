import { useGetPatientProfile, useGetMyDiets, useGetMyAppointments } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Apple, Calendar, ArrowRight, User } from "lucide-react";

export default function PatientDashboard() {
  const { data: profile, isLoading: isLoadingProfile } = useGetPatientProfile(getAuthOptions());
  const { data: diets, isLoading: isLoadingDiets } = useGetMyDiets(getAuthOptions());
  const { data: appointments, isLoading: isLoadingAppts } = useGetMyAppointments(getAuthOptions());

  const activeDiet = diets?.find(d => d.isActive);
  const nextAppointment = appointments?.find(a => isFuture(new Date(a.scheduledAt)) && a.status !== 'cancelled');

  if (isLoadingProfile || isLoadingDiets || isLoadingAppts) {
    return <div className="p-12 text-center text-muted-foreground">Carregando seu painel...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
          {profile?.name?.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Olá, {profile?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Acompanhe sua jornada nutricional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Diet Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-emerald-500 to-primary p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Apple size={24} className="text-white" />
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">Plano Atual</span>
            </div>
            {activeDiet ? (
              <>
                <h3 className="text-2xl font-bold font-display mb-1">{activeDiet.name}</h3>
                <p className="text-white/80 text-sm mb-4">{activeDiet.totalCalories ? `${activeDiet.totalCalories} kcal diárias` : 'Dieta Flexível'}</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold font-display mb-4">Nenhum plano ativo</h3>
              </>
            )}
          </div>
          <CardContent className="p-6 bg-card flex-1 flex flex-col justify-between">
            {activeDiet ? (
              <p className="text-muted-foreground text-sm mb-6">{activeDiet.description || "Siga as orientações na aba de refeições."}</p>
            ) : (
              <p className="text-muted-foreground text-sm mb-6">Sua nutricionista ainda não liberou seu plano alimentar.</p>
            )}
            <Link href={activeDiet ? `/patient/diets/${activeDiet.id}` : "/patient/diets"} className="mt-auto">
              <Button className="w-full rounded-xl bg-secondary text-foreground hover:bg-secondary/80">
                {activeDiet ? "Ver Refeições" : "Ver Histórico"} <ArrowRight size={16} className="ml-2"/>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Appointment Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar size={24} className="text-white" />
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">Próxima Consulta</span>
            </div>
            {nextAppointment ? (
              <>
                <h3 className="text-3xl font-bold font-display mb-1">
                  {format(new Date(nextAppointment.scheduledAt), "dd/MM", { locale: ptBR })}
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  às {format(new Date(nextAppointment.scheduledAt), "HH:mm")} • {nextAppointment.type === 'online' ? 'Online' : 'Presencial'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold font-display mb-4">Nenhuma consulta agendada</h3>
              </>
            )}
          </div>
          <CardContent className="p-6 bg-card flex-1 flex flex-col justify-between">
            {nextAppointment ? (
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold mb-2">Status: {nextAppointment.status}</span>
                <p className="text-muted-foreground text-sm text-balance">{nextAppointment.notes || "Prepare-se para relatar seus resultados!"}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-6">Entre em contato com sua nutricionista para agendar seu retorno.</p>
            )}
            <Link href="/patient/appointments" className="mt-auto">
              <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-secondary/50">
                Ver Todas as Consultas <ArrowRight size={16} className="ml-2"/>
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
