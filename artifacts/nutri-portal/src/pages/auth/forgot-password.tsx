import { Link } from "wouter";
import { motion } from "framer-motion";
import { Leaf, ArrowLeft, KeyRound, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
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
            <h1 className="text-4xl font-display font-bold text-foreground">Nutriice</h1>
          </div>

          <Card className="p-8 shadow-xl shadow-black/5 border-border/50 rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <KeyRound className="text-primary" size={20} />
              </div>
              <h2 className="text-2xl font-bold">Recuperar senha</h2>
            </div>
            <p className="text-muted-foreground mb-8">Como você quer recuperar o acesso?</p>

            <div className="space-y-4">
              <div className="border border-border/60 rounded-xl p-5 bg-secondary/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">P</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Sou paciente</p>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato com sua nutricionista e peça para ela redefinir sua senha pelo portal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border/60 rounded-xl p-5 bg-secondary/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">N</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Sou nutricionista</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Se você lembra da sua senha atual, faça login e altere nas configurações. Caso contrário, entre em contato pelo WhatsApp.
                    </p>
                    <a
                      href="https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20ajuda%20para%20recuperar%20minha%20senha%20do%20Nutriice."
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="rounded-xl gap-2 text-green-600 border-green-200 hover:bg-green-50">
                        <MessageCircle size={15} />
                        Falar com suporte
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl gap-2 text-muted-foreground">
                  <ArrowLeft size={16} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

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
