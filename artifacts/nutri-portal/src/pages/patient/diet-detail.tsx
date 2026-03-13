import { useRoute, Link } from "wouter";
import { useGetMyDiets, useListDietMeals } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Info, CheckCircle2 } from "lucide-react";

export default function PatientDietDetail() {
  const [, params] = useRoute("/patient/diets/:id");
  const dietId = parseInt(params?.id || "0");

  const { data: diets, isLoading: isDietsLoading } = useGetMyDiets(getAuthOptions());
  const diet = diets?.find(d => d.id === dietId);
  const { data: meals, isLoading: isMealsLoading } = useListDietMeals(dietId, getAuthOptions());

  if (isDietsLoading || isMealsLoading) return <div className="p-12 text-center text-muted-foreground">Carregando plano...</div>;
  if (!diet) return <div className="p-12 text-center text-destructive">Plano não encontrado.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/patient/diets">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-foreground">{diet.name}</h1>
            {diet.isActive && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">Plano Ativo</span>}
          </div>
        </div>
      </div>

      {diet.description && (
        <Card className="rounded-xl bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-5 flex gap-3">
            <Info className="text-primary shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-primary mb-1">Orientações da Nutricionista</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{diet.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-display font-semibold border-b pb-2">Refeições do Dia</h2>
        
        {meals && meals.length > 0 ? (
          <div className="space-y-4">
            {meals.sort((a, b) => a.order - b.order).map(meal => (
              <Card key={meal.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:shadow-md">
                <div className="bg-secondary/50 px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{meal.time || "Horário livre"}</p>
                  </div>
                </div>
                <CardContent className="p-0">
                  {meal.description && (
                    <div className="px-6 py-3 bg-amber-50/50 text-sm text-amber-800 border-b border-amber-100">
                      <strong>Modo de preparo:</strong> {meal.description}
                    </div>
                  )}
                  <div className="divide-y divide-border/50">
                    {meal.foods?.map((food, idx) => (
                      <div key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-primary mt-0.5 opacity-50" />
                          <div>
                            <p className="font-bold text-foreground text-base">{food.name}</p>
                            <p className="text-sm text-muted-foreground">{food.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded font-semibold">
                            {food.calories ? `${food.calories} kcal` : 'Livre'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/60">
            <p className="text-muted-foreground text-lg">Este plano ainda não tem refeições cadastradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
