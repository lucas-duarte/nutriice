import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterNutritionist } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Leaf, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  crn: z.string().min(4, "CRN inválido"),
  phone: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  
  const registerMutation = useRegisterNutritionist();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setErrorMsg("");
    try {
      const res = await registerMutation.mutateAsync({ data });
      login(res.token);
      setLocation("/dashboard");
    } catch (err: any) {
      setErrorMsg("Erro ao criar conta. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side image */}
      <div className="hidden lg:flex flex-1 relative bg-primary/10 items-center justify-center overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract health" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
        />
        <div className="relative z-10 p-12 text-foreground text-center max-w-lg">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Leaf className="text-primary" size={40} />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Gerencie sua clínica de forma inteligente</h2>
          <p className="text-lg text-muted-foreground font-medium">Dietas, pacientes e consultas em um só lugar. Feito para nutricionistas que buscam excelência.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-xl shadow-black/5 border-border/50 rounded-2xl">
            <h2 className="text-3xl font-display font-bold mb-2 text-foreground">Crie sua conta</h2>
            <p className="text-muted-foreground mb-8">Junte-se à NutriPlanner como nutricionista.</p>

            {errorMsg && (
              <Alert variant="destructive" className="mb-6 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Dr. Nome Sobrenome" className="rounded-xl" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crn">CRN</Label>
                  <Input id="crn" placeholder="12345/UF" className="rounded-xl" {...register("crn")} />
                  {errors.crn && <p className="text-sm text-destructive">{errors.crn.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" className="rounded-xl" {...register("phone")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" className="rounded-xl" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" className="rounded-xl" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-md font-semibold mt-6 shadow-lg shadow-primary/20"
                disabled={isSubmitting || registerMutation.isPending}
              >
                {(isSubmitting || registerMutation.isPending) ? <Loader2 className="animate-spin mr-2" /> : null}
                Criar Conta
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Faça login
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
