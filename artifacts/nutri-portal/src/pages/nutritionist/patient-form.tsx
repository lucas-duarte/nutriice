import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePatient } from "@workspace/api-client-react";
import { getAuthOptions } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const patientSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha inicial de 6 caracteres mín."),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  objective: z.string().optional(),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreatePatient(getAuthOptions());

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Sucesso", description: "Paciente cadastrado com sucesso!" });
      setLocation("/patients");
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao cadastrar paciente.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/patients">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Novo Paciente</h1>
          <p className="text-muted-foreground">Preencha os dados para cadastrar um novo paciente.</p>
        </div>
      </div>

      <Card className="p-8 rounded-2xl shadow-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" className="rounded-xl" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" className="rounded-xl" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha Inicial * (Para acesso do paciente)</Label>
                <Input id="password" type="password" className="rounded-xl" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" className="rounded-xl" {...register("phone")} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados Físicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" className="rounded-xl" {...register("birthDate")} />
              </div>
              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select onValueChange={(val) => setValue("gender", val as any)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input id="height" type="number" placeholder="Ex: 175" className="rounded-xl" {...register("height")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso Atual (kg)</Label>
                <Input id="weight" type="number" step="0.1" placeholder="Ex: 70.5" className="rounded-xl" {...register("weight")} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Clínica</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo Principal</Label>
                <Input id="objective" placeholder="Ex: Hipertrofia, Emagrecimento..." className="rounded-xl" {...register("objective")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations">Observações Clínicas (Alergias, patologias)</Label>
                <Textarea id="observations" className="rounded-xl min-h-[100px]" {...register("observations")} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending) ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
              Salvar Paciente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
