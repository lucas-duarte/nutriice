import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAppointment, useListPatients } from "@workspace/api-client-react";
import { getAuthOptions, extractApiError } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const appointmentSchema = z.object({
  patientId: z.coerce.number().min(1, "Selecione o paciente"),
  scheduledAtDate: z.string().min(1, "Data obrigatória"),
  scheduledAtTime: z.string().min(1, "Horário obrigatório"),
  durationMinutes: z.coerce.number().default(60),
  type: z.enum(["initial", "followup", "online", "inperson"]),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentForm() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Quick hack to parse query string for initial patientId
  const searchParams = new URLSearchParams(window.location.search);
  const initialPatientId = searchParams.get("patientId");

  const { data: patients } = useListPatients(getAuthOptions());
  const createMutation = useCreateAppointment(getAuthOptions());

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: initialPatientId ? parseInt(initialPatientId) : 0,
      durationMinutes: 60,
      type: "initial"
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const scheduledAt = new Date(`${data.scheduledAtDate}T${data.scheduledAtTime}:00`).toISOString();
      
      await createMutation.mutateAsync({ 
        data: {
          patientId: data.patientId,
          scheduledAt,
          durationMinutes: data.durationMinutes,
          type: data.type,
          notes: data.notes
        } 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Agendado", description: "Consulta agendada com sucesso!" });
      setLocation("/appointments");
    } catch (error) {
      toast({ title: "Erro ao agendar", description: extractApiError(error, "Falha ao agendar consulta."), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/appointments">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Nova Consulta</h1>
          <p className="text-muted-foreground">Agende um horário para seu paciente.</p>
        </div>
      </div>

      <Card className="p-8 rounded-2xl shadow-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select 
              onValueChange={(val) => setValue("patientId", parseInt(val))} 
              defaultValue={initialPatientId || ""}
            >
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Selecione o paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients?.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && <p className="text-sm text-destructive">{errors.patientId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" className="rounded-xl h-12" {...register("scheduledAtDate")} />
              {errors.scheduledAtDate && <p className="text-sm text-destructive">{errors.scheduledAtDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Input type="time" className="rounded-xl h-12" {...register("scheduledAtTime")} />
              {errors.scheduledAtTime && <p className="text-sm text-destructive">{errors.scheduledAtTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo de Consulta *</Label>
              <Select defaultValue="initial" onValueChange={(val) => setValue("type", val as any)}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Primeira Consulta (Presencial)</SelectItem>
                  <SelectItem value="followup">Retorno (Presencial)</SelectItem>
                  <SelectItem value="inperson">Presencial (Geral)</SelectItem>
                  <SelectItem value="online">Online (Telemedicina)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração Estimada (min)</Label>
              <Input type="number" className="rounded-xl h-12" {...register("durationMinutes")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas/Link para reunião</Label>
            <Textarea placeholder="Link do Zoom, observações pré-consulta..." className="rounded-xl min-h-[100px]" {...register("notes")} />
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button 
              type="submit" 
              className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending) ? <Loader2 className="animate-spin mr-2" /> : <CalendarIcon className="mr-2" size={18} />}
              Agendar Consulta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
