import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDietPlan, useGetPatient, useListPatientDiets } from "@workspace/api-client-react";
import { getAuthOptions, getAuthReq, extractApiError } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Apple, Droplets, FileText, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const dietSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  description: z.string().optional(),
  recommendations: z.string().optional(),
  waterGoalMl: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof dietSchema>;

export default function DietForm() {
  const [, params] = useRoute("/patients/:id/diets/new");
  const patientId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showClonePanel, setShowClonePanel] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const { data: patient } = useGetPatient(patientId, getAuthOptions());
  const { data: existingDiets = [] } = useListPatientDiets(patientId, getAuthOptions());
  const createMutation = useCreateDietPlan(getAuthOptions());

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(dietSchema),
    defaultValues: { isActive: true }
  });

  const handleClone = async (sourceDietId: number, sourceName: string) => {
    setIsCloning(true);
    try {
      const res = await fetch(`${BASE}/api/diets/${sourceDietId}/clone`, {
        method: "POST",
        ...getAuthReq(),
        headers: { ...(getAuthReq().headers as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) throw new Error();
      const newDiet = await res.json();
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/diets`] });
      toast({ title: "Dieta clonada!", description: `"Cópia de ${sourceName}" criada com todas as refeições.` });
      setLocation(`/diets/${newDiet.id}`);
    } catch {
      toast({ title: "Erro", description: "Falha ao clonar dieta.", variant: "destructive" });
      setIsCloning(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        data: {
          ...data,
          patientId,
          waterGoalMl: data.waterGoalMl || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/diets`] });
      toast({ title: "Sucesso", description: "Plano alimentar criado. Agora adicione as refeições." });
      setLocation(`/diets/${res.id}`);
    } catch (error) {
      toast({ title: "Erro ao criar plano", description: extractApiError(error, "Falha ao criar plano alimentar."), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/patients/${patientId}`}>
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Novo Plano Alimentar</h1>
          <p className="text-muted-foreground">Paciente: <strong className="text-primary">{patient?.name || '...'}</strong></p>
        </div>
      </div>

      {existingDiets.length > 0 && (
        <Card className="rounded-2xl border-violet-200 bg-violet-50/50 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setShowClonePanel(v => !v)}
          >
            <div className="flex items-center gap-2">
              <Copy size={17} className="text-violet-600" />
              <span className="font-semibold text-violet-800">Clonar uma dieta existente</span>
              <span className="text-xs text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">{existingDiets.length} disponível{existingDiets.length > 1 ? 'is' : ''}</span>
            </div>
            {showClonePanel ? <ChevronUp size={16} className="text-violet-500" /> : <ChevronDown size={16} className="text-violet-500" />}
          </button>
          {showClonePanel && (
            <div className="px-5 pb-5 border-t border-violet-100">
              <p className="text-sm text-violet-700 mt-3 mb-3">Selecione uma dieta para clonar com todas as refeições já incluídas:</p>
              <div className="space-y-2">
                {existingDiets.map((diet: any) => (
                  <div key={diet.id} className="flex items-center justify-between bg-white rounded-xl border border-violet-100 px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{diet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {diet.meals?.length || 0} refeição{diet.meals?.length !== 1 ? 'ões' : ''} • {diet.totalCalories || 0} kcal
                        {diet.isActive && <span className="ml-2 text-primary font-medium">• Ativa</span>}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white ml-3"
                      disabled={isCloning}
                      onClick={() => handleClone(diet.id, diet.name)}
                    >
                      {isCloning ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} className="mr-1" />}
                      Clonar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-8 rounded-2xl shadow-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano *</Label>
            <Input id="name" placeholder="Ex: Hipertrofia Fase 1" className="rounded-xl" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Orientações Gerais</Label>
            <Textarea id="description" placeholder="Instruções gerais para seguir esta dieta..." className="rounded-xl min-h-[100px]" {...register("description")} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <Label htmlFor="recommendations">Recomendações Nutricionais</Label>
            </div>
            <Textarea
              id="recommendations"
              placeholder={"Ex: Beber pelo menos 3L de água por dia.\nEvitar alimentos industrializados.\nDormir de 7 a 9 horas por noite.\nPraticar exercício físico regularmente."}
              className="rounded-xl min-h-[140px]"
              {...register("recommendations")}
            />
            <p className="text-xs text-muted-foreground">Orientações complementares de saúde, sono, hidratação e alimentos permitidos/proibidos.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-blue-500" />
              <Label htmlFor="waterGoalMl">Meta de Ingestão Hídrica (ml/dia)</Label>
            </div>
            <Input
              id="waterGoalMl"
              type="number"
              placeholder="Ex: 3000"
              min={500}
              max={10000}
              step={100}
              className="rounded-xl"
              {...register("waterGoalMl")}
            />
            <p className="text-xs text-muted-foreground">Quantidade diária de água recomendada em mililitros. Ex: 3000 = 3 litros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input id="startDate" type="date" className="rounded-xl" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final (Previsão)</Label>
              <Input id="endDate" type="date" className="rounded-xl" {...register("endDate")} />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border/50">
            <Button
              type="submit"
              className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending) ? <Loader2 className="animate-spin mr-2" /> : <Apple className="mr-2" size={18} />}
              Criar Plano e Adicionar Refeições
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
