import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setErrorMsg("");
    try {
      const res = await loginMutation.mutateAsync({ data });
      login(res.token);
      if (res.user.role === "nutritionist") {
        setLocation("/dashboard");
      } else {
        setLocation("/patient/dashboard");
      }
    } catch (err: any) {
      setErrorMsg("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Leaf className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">NutriPlanner</h1>
          </div>

          <Card className="p-8 shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo(a) de volta!</h2>
            <p className="text-muted-foreground mb-8">Faça login para acessar seu painel.</p>

            {errorMsg && (
              <Alert variant="destructive" className="mb-6 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="rounded-xl h-12"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="rounded-xl h-12"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-md font-semibold mt-4 bg-gradient-to-r from-primary to-emerald-500 hover:to-emerald-600 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {(isSubmitting || loginMutation.isPending) ? <Loader2 className="animate-spin mr-2" /> : null}
                Entrar
                {!(isSubmitting || loginMutation.isPending) && <ArrowRight className="ml-2" size={18} />}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              É nutricionista e não tem conta?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Right side image */}
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-side.png`} 
          alt="Healthy food" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 p-12 text-white mt-auto w-full text-center">
          <h2 className="text-4xl font-display font-bold mb-4 drop-shadow-lg">Transformando vidas através da nutrição</h2>
          <p className="text-lg text-white/90 font-medium drop-shadow-md">A plataforma completa para nutricionistas e pacientes alcançarem seus objetivos juntos.</p>
        </div>
      </div>
    </div>
  );
}
