import { useState } from "react";
import { Link } from "wouter";
import { useListPatients } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, User, ChevronRight } from "lucide-react";

export default function PatientsList() {
  const { data: patients, isLoading } = useListPatients(getAuthOptions());
  const [search, setSearch] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie seus pacientes e acompanhe o progresso.</p>
        </div>
        <Link href="/patients/new">
          <Button className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
            <Plus size={18} className="mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm border-border/50">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar por nome ou e-mail..." 
            className="pl-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredPatients?.length === 0 ? (
          <div className="text-center py-16 px-4 bg-secondary/30 rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Você ainda não tem pacientes cadastrados ou a busca não retornou resultados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients?.map(patient => (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <div className="group border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground truncate">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground truncate mb-4">{patient.email}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                    {patient.phone && <span>{patient.phone}</span>}
                    {patient.objective && <span className="truncate flex-1 text-right">{patient.objective}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
