import { useRoute, Link } from "wouter";
import { useGetDietPlan, useListDietMeals, useDeleteMeal } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Clock, Info, Trash2, Loader2, FileText, Droplets, Pill } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function DietDetail() {
  const [, params] = useRoute("/diets/:id");
  const dietId = parseInt(params?.id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: diet, isLoading: isDietLoading } = useGetDietPlan(dietId, getAuthOptions());
  const { data: meals, isLoading: isMealsLoading } = useListDietMeals(dietId, getAuthOptions());
  const deleteMeal = useDeleteMeal(getAuthOptions());

  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm("Remover esta refeição?")) return;
    try {
      await deleteMeal.mutateAsync({ id: mealId });
      queryClient.invalidateQueries({ queryKey: [`/api/diets/${dietId}/meals`] });
      toast({ title: "Removida", description: "Refeição removida com sucesso." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao remover refeição.", variant: "destructive" });
    }
  };

  if (isDietLoading) return <div className="p-12 text-center">Carregando dieta...</div>;
  if (!diet) return <div className="p-12 text-center text-destructive">Dieta não encontrada.</div>;

  const waterLiters = diet.waterGoalMl ? (diet.waterGoalMl / 1000).toFixed(1) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${diet.patientId}`}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-foreground">{diet.name}</h1>
              {diet.isActive && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">Ativa</span>}
            </div>
            <p className="text-muted-foreground mt-1">Total planejado: <strong className="text-foreground">{diet.totalCalories || 0} kcal</strong></p>
          </div>
        </div>
        <Link href={`/diets/${dietId}/meals/new`}>
          <Button className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
            <Plus size={18} className="mr-2" />
            Adicionar Refeição
          </Button>
        </Link>
      </div>

      {diet.description && (
        <Card className="rounded-xl bg-secondary/30 border-dashed border-border shadow-none">
          <CardContent className="p-4 flex gap-3">
            <Info className="text-primary shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-foreground">{diet.description}</p>
          </CardContent>
        </Card>
      )}

      {(diet.recommendations || waterLiters) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diet.recommendations && (
            <Card className="rounded-xl border-border/50 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Recomendações</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{diet.recommendations}</p>
              </CardContent>
            </Card>
          )}
          {waterLiters && (
            <Card className="rounded-xl border-blue-200 bg-blue-50/50 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets size={16} className="text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Meta de Hidratação</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{waterLiters}<span className="text-lg font-medium text-blue-400 ml-1">L/dia</span></p>
                <p className="text-xs text-blue-400 mt-1">{diet.waterGoalMl} ml por dia</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-semibold border-b pb-2">Refeições</h2>

        {isMealsLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : meals && meals.length > 0 ? (
          <div className="space-y-6">
            {meals.sort((a, b) => a.order - b.order).map(meal => (
              <Card key={meal.id} className={`rounded-2xl border-border/50 shadow-sm overflow-hidden ${meal.isSupplement ? "border-l-4 border-l-purple-400" : ""}`}>
                <div className="bg-secondary/50 border-b px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center ${meal.isSupplement ? "bg-purple-100" : "bg-white"}`}>
                      {meal.isSupplement ? <Pill size={18} className="text-purple-500" /> : <Clock size={18} className="text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{meal.name}</h3>
                        {meal.isSupplement && (
                          <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-semibold">Suplemento</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{meal.time || "Horário livre"} • {meal.calories || 0} kcal</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteMeal(meal.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
                <CardContent className="p-0">
                  {meal.description && <p className="px-6 py-3 text-sm text-muted-foreground border-b">{meal.description}</p>}
                  <div className="divide-y">
                    {meal.foods?.map((food, idx) => (
                      <div key={idx} className="px-6 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">{food.name}</p>
                            <p className="text-sm text-muted-foreground">{food.quantity}</p>
                            {food.alternatives && (
                              <p className="text-xs text-primary/70 mt-0.5">
                                <span className="font-medium">Alternativas:</span> {food.alternatives}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex gap-4 text-xs shrink-0">
                            {food.protein && <span className="text-blue-600 font-medium">P: {food.protein}g</span>}
                            {food.carbs && <span className="text-amber-600 font-medium">C: {food.carbs}g</span>}
                            {food.fat && <span className="text-red-500 font-medium">G: {food.fat}g</span>}
                            {food.calories && <span className="font-bold text-foreground">{food.calories} kcal</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!meal.foods || meal.foods.length === 0) && (
                      <div className="px-6 py-4 text-sm text-muted-foreground italic">Nenhum alimento cadastrado.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
            <p className="text-muted-foreground mb-4 text-lg">Este plano ainda não tem refeições.</p>
            <Link href={`/diets/${dietId}/meals/new`}>
              <Button className="rounded-xl shadow-sm"><Plus size={18} className="mr-2" /> Cadastrar Primeira Refeição</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
