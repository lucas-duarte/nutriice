import { useListAppointments } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, Video, MapPin, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Appointments() {
  const { data: appointments, isLoading } = useListAppointments(undefined, getAuthOptions());
  const [search, setSearch] = useState("");

  const filtered = appointments?.filter(a => 
    a.patientName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Agenda de Consultas</h1>
          <p className="text-muted-foreground">Gerencie seus horários e retornos.</p>
        </div>
        <Link href="/appointments/new">
          <Button className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
            <Plus size={18} className="mr-2" />
            Nova Consulta
          </Button>
        </Link>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm border-border/50">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar por paciente..." 
            className="pl-10 rounded-xl bg-secondary/50 border-transparent focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 px-4 bg-secondary/30 rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sua agenda está livre ou a busca não retornou resultados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered?.map(apt => (
              <div key={apt.id} className="border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all bg-card flex flex-col md:flex-row justify-between md:items-center gap-4">
                
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex flex-col items-center justify-center border border-border/50 shadow-sm">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{format(new Date(apt.scheduledAt), "MMM", { locale: ptBR })}</span>
                    <span className="text-2xl font-display font-bold text-primary leading-none">{format(new Date(apt.scheduledAt), "dd")}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{apt.patientName}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 font-medium text-foreground"><Calendar size={14}/> {format(new Date(apt.scheduledAt), "HH:mm")}</span>
                      <span className="flex items-center gap-1">{apt.type === 'online' ? <Video size={14} className="text-blue-500"/> : <MapPin size={14} className="text-emerald-600"/>} {apt.type === 'online' ? 'Online' : 'Presencial'}</span>
                      <span className="flex items-center gap-1 capitalize"><Activity size={14}/> {apt.type === 'initial' ? '1ª Consulta' : 'Retorno'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${apt.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                    ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Pendente' : apt.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                  </span>
                  
                  <Link href={`/patients/${apt.patientId}`}>
                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/50">
                      Ver Paciente
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
