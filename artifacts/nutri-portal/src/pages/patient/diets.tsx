import { useGetMyDiets } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, ArrowRight, Activity } from "lucide-react";

export default function PatientDiets() {
  const { data: diets, isLoading } = useGetMyDiets(getAuthOptions());

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Carregando dietas...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Meus Planos Alimentares</h1>
        <p className="text-muted-foreground">Histórico de todas as suas dietas prescritas.</p>
      </div>

      {diets && diets.length > 0 ? (
        <div className="space-y-4">
          {diets.map(diet => (
            <Card key={diet.id} className={`rounded-2xl overflow-hidden transition-all shadow-sm ${diet.isActive ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/50 opacity-80 hover:opacity-100'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${diet.isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      <Apple size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">{diet.name}</h3>
                        {diet.isActive && <span className="bg-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white tracking-wider">Ativo</span>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{diet.description || "Dieta personalizada"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right text-sm">
                      <p className="font-semibold text-foreground">{diet.totalCalories ? `${diet.totalCalories} kcal` : '-'}</p>
                      <p className="text-muted-foreground text-xs">Desde: {diet.startDate ? format(new Date(diet.startDate), "dd/MM/yyyy") : '-'}</p>
                    </div>
                    <Link href={`/patient/diets/${diet.id}`}>
                      <Button className={`rounded-xl ${diet.isActive ? 'bg-primary text-white hover:bg-primary/90 shadow-md' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                        Abrir <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border/60">
          <Activity size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum plano disponível</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Sua nutricionista ainda não disponibilizou nenhum plano alimentar para você.
          </p>
        </div>
      )}
    </div>
  );
}
