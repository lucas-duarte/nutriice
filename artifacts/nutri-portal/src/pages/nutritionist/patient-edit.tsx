import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetPatient, useUpdatePatient } from "@workspace/api-client-react";
import { getAuthOptions, getAuthReq, extractApiError } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, KeyRound, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const editSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  objective: z.string().optional(),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof editSchema>;

const GENDER_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Feminino",
  other: "Outro",
};

export default function PatientEdit() {
  const [, params] = useRoute("/patients/:id/edit");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { data: patient, isLoading } = useGetPatient(id, getAuthOptions());
  const updateMutation = useUpdatePatient(getAuthOptions());

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        phone: patient.phone ?? "",
        birthDate: patient.birthDate ?? "",
        gender: (patient.gender as "male" | "female" | "other") ?? undefined,
        height: patient.height ?? undefined,
        weight: patient.weight ?? undefined,
        objective: patient.objective ?? "",
        observations: patient.observations ?? "",
      });
    }
  }, [patient, reset]);

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Senha inválida", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch(`${BASE}/api/patients/${id}/reset-password`, {
        method: "PUT",
        ...getAuthReq(),
        headers: { ...(getAuthReq().headers as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Senha redefinida!", description: "A nova senha do paciente foi salva." });
      setNewPassword("");
    } catch {
      toast({ title: "Erro", description: "Falha ao redefinir senha.", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: data.name,
          phone: data.phone || undefined,
          birthDate: data.birthDate || undefined,
          gender: data.gender,
          height: data.height || undefined,
          weight: data.weight || undefined,
          objective: data.objective || undefined,
          observations: data.observations || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${id}`] });
      toast({ title: "Atualizado", description: "Dados do paciente salvos com sucesso!" });
      setLocation(`/patients/${id}`);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: extractApiError(error, "Falha ao atualizar paciente."), variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin text-primary" size={20} /> Carregando...</div>;
  }

  if (!patient) {
    return <div className="p-12 text-center text-destructive">Paciente não encontrado.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/patients/${id}`}>
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Editar Paciente</h1>
          <p className="text-muted-foreground">Atualize os dados de <span className="font-semibold text-foreground">{patient.name}</span></p>
        </div>
      </div>

      <Card className="p-8 rounded-2xl shadow-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" className="rounded-xl" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-xl bg-muted cursor-not-allowed"
                  value={patient.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" className="rounded-xl" placeholder="Ex: 11999999999" {...register("phone")} />
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
                <Select
                  defaultValue={patient.gender ?? undefined}
                  onValueChange={(val) => setValue("gender", val as "male" | "female" | "other")}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={patient.gender ? GENDER_LABEL[patient.gender] : "Selecione"} />
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

          <Card className="rounded-xl border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <KeyRound size={15} />
                Redefinir senha do paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-amber-700 mb-3">
                Use isto se o paciente esqueceu a senha. Defina uma nova senha e informe ao paciente.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    className="rounded-xl pr-10 h-10 text-sm"
                    placeholder="Nova senha (mín. 6 caracteres)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl h-10 px-4 border-amber-300 text-amber-800 hover:bg-amber-100"
                  disabled={isResetting || !newPassword}
                  onClick={handleResetPassword}
                >
                  {isResetting ? <Loader2 size={14} className="animate-spin" /> : "Redefinir"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Link href={`/patients/${id}`}>
              <Button type="button" variant="outline" className="rounded-xl h-12 px-6">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
