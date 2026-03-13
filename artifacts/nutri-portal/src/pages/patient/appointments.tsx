import { useGetMyAppointments } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Video, MapPin, CheckCircle2 } from "lucide-react";

export default function PatientAppointments() {
  const { data: appointments, isLoading } = useGetMyAppointments(getAuthOptions());

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Carregando consultas...</div>;

  const sortedAppts = appointments?.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Meus Agendamentos</h1>
        <p className="text-muted-foreground">Acompanhe suas consultas com a nutricionista.</p>
      </div>

      {sortedAppts && sortedAppts.length > 0 ? (
        <div className="space-y-4">
          {sortedAppts.map(apt => (
            <Card key={apt.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="bg-primary/5 p-6 md:w-48 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50">
                  <span className="text-sm text-primary font-bold uppercase tracking-wider">{format(new Date(apt.scheduledAt), "MMMM", { locale: ptBR })}</span>
                  <span className="text-4xl font-display font-bold text-foreground leading-none my-1">{format(new Date(apt.scheduledAt), "dd")}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{format(new Date(apt.scheduledAt), "EEEE", { locale: ptBR })}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <Calendar size={18} className="text-muted-foreground"/> 
                        {format(new Date(apt.scheduledAt), "HH:mm")}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1 font-medium bg-secondary px-2 py-1 rounded-md">
                          {apt.type === 'online' ? <Video size={14} className="text-blue-500"/> : <MapPin size={14} className="text-emerald-600"/>} 
                          {apt.type === 'online' ? 'Atendimento Online' : 'Atendimento Presencial'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                        ${apt.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                        ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                      `}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                  
                  {apt.notes && (
                    <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                      <strong className="text-foreground">Orientações:</strong> {apt.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border/60">
          <Calendar size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum agendamento</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Você não possui consultas agendadas no momento.
          </p>
        </div>
      )}
    </div>
  );
}
