import { useRoute, useLocation, Link } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddMealToDiet, useGetDietPlan } from "@workspace/api-client-react";
import { getAuthOptions, extractApiError } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Plus, Trash2, Save, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const foodSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  quantity: z.string().min(1, "Obrigatório"),
  alternatives: z.string().optional(),
  calories: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  carbs: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
});

const mealSchema = z.object({
  name: z.string().min(2, "Nome da refeição obrigatório"),
  time: z.string().optional(),
  description: z.string().optional(),
  isSupplement: z.boolean().default(false),
  order: z.coerce.number().default(1),
  calories: z.coerce.number().optional(),
  foods: z.array(foodSchema).optional()
});

type FormValues = z.infer<typeof mealSchema>;

export default function MealForm() {
  const [, params] = useRoute("/diets/:id/meals/new");
  const dietId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: diet } = useGetDietPlan(dietId, getAuthOptions());
  const addMeal = useAddMealToDiet(getAuthOptions());

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      order: 1,
      isSupplement: false,
      foods: [{ name: "", quantity: "", alternatives: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]
    }
  });

  const isSupplement = watch("isSupplement");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "foods"
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.calories && data.foods) {
        data.calories = data.foods.reduce((acc, f) => acc + (f.calories || 0), 0);
      }

      await addMeal.mutateAsync({
        id: dietId,
        data: {
          ...data,
          foods: data.foods?.map(f => ({
            ...f,
            alternatives: f.alternatives || undefined,
          }))
        }
      });
      queryClient.invalidateQueries({ queryKey: [`/api/diets/${dietId}/meals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/diets/${dietId}`] });
      toast({ title: "Sucesso", description: "Refeição adicionada." });
      setLocation(`/diets/${dietId}`);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: extractApiError(error, "Falha ao adicionar refeição."), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/diets/${dietId}`}>
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Adicionar Refeição</h1>
          <p className="text-muted-foreground">Dieta: <strong className="text-primary">{diet?.name || '...'}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6 rounded-2xl shadow-sm border-border/50">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Detalhes da Refeição</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="name">Nome * (Ex: Café da Manhã)</Label>
              <Input id="name" className="rounded-xl" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" className="rounded-xl" {...register("time")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input id="order" type="number" placeholder="1, 2, 3..." className="rounded-xl" {...register("order")} />
            </div>
            <div className="space-y-2 lg:col-span-4">
              <Label htmlFor="description">Instruções de preparo (Opcional)</Label>
              <Input id="description" placeholder="Ex: Bater tudo no liquidificador" className="rounded-xl" {...register("description")} />
            </div>
            <div className="lg:col-span-4">
              <Controller
                control={control}
                name="isSupplement"
                render={({ field }) => (
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${isSupplement ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/20"}`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <Checkbox
                      id="isSupplement"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Pill size={16} className="text-primary" />
                        <Label htmlFor="isSupplement" className="font-semibold cursor-pointer">Suplementação</Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Marque se esta refeição é um suplemento (whey, creatina, vitaminas, etc.)</p>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm border-border/50">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold">{isSupplement ? "Suplementos" : "Alimentos"}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-primary"
              onClick={() => append({ name: "", quantity: "", alternatives: "", calories: 0, protein: 0, carbs: 0, fat: 0 })}
            >
              <Plus size={16} className="mr-1" /> Adicionar Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 flex-1">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">{isSupplement ? "Suplemento *" : "Alimento *"}</Label>
                      <Input placeholder={isSupplement ? "Whey Protein" : "Aveia em flocos"} className="h-9 rounded-lg" {...register(`foods.${index}.name`)} />
                      {errors.foods?.[index]?.name && <p className="text-xs text-destructive">Obrigatório</p>}
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1">
                      <Label className="text-xs">Quantidade *</Label>
                      <Input placeholder="30g / 2 colheres" className="h-9 rounded-lg" {...register(`foods.${index}.quantity`)} />
                      {errors.foods?.[index]?.quantity && <p className="text-xs text-destructive">Obrigatório</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-600">Prot. (g)</Label>
                      <Input type="number" step="0.1" className="h-9 rounded-lg border-blue-200 focus-visible:ring-blue-500" {...register(`foods.${index}.protein`)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-amber-600">Carb. (g)</Label>
                      <Input type="number" step="0.1" className="h-9 rounded-lg border-amber-200 focus-visible:ring-amber-500" {...register(`foods.${index}.carbs`)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-red-500">Gord. (g)</Label>
                      <Input type="number" step="0.1" className="h-9 rounded-lg border-red-200 focus-visible:ring-red-500" {...register(`foods.${index}.fat`)} />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-6" onClick={() => remove(index)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Alternativas (opcional)</Label>
                  <Input
                    placeholder="Ex: frango / peixe / carne bovina"
                    className="h-9 rounded-lg text-sm"
                    {...register(`foods.${index}.alternatives`)}
                  />
                  <p className="text-xs text-muted-foreground">Informe outras opções separadas por barra ( / )</p>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">Nenhum alimento adicionado. Clique no botão acima para inserir.</p>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
            disabled={isSubmitting || addMeal.isPending}
          >
            {(isSubmitting || addMeal.isPending) ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
            Salvar Refeição
          </Button>
        </div>
      </form>
    </div>
  );
}
