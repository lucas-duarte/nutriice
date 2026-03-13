import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDietPlan, useGetPatient } from "@workspace/api-client-react";
import { getAuthOptions, extractApiError } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Apple } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const dietSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  description: z.string().optional(),
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

  const { data: patient } = useGetPatient(patientId, getAuthOptions());
  const createMutation = useCreateDietPlan(getAuthOptions());

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(dietSchema),
    defaultValues: { isActive: true }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        data: {
          ...data,
          patientId
        }
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/diets`] });
      toast({ title: "Sucesso", description: "Plano alimentar criado. Agora adicione as refeições." });
      setLocation(`/diets/${res.id}`); // redirect to diet detail to add meals
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

      <Card className="p-8 rounded-2xl shadow-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano *</Label>
            <Input id="name" placeholder="Ex: Hipertrofia Fase 1" className="rounded-xl" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Orientações Gerais</Label>
            <Textarea id="description" placeholder="Instruções para seguir esta dieta..." className="rounded-xl min-h-[120px]" {...register("description")} />
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
