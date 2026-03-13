import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Apple,
  Salad
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children, role }: { children: React.ReactNode, role: "nutritionist" | "patient" }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const nutritionistLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Pacientes", icon: Users },
    { href: "/appointments", label: "Consultas", icon: Calendar },
  ];

  const patientLinks = [
    { href: "/patient/dashboard", label: "Resumo", icon: LayoutDashboard },
    { href: "/patient/diets", label: "Minhas Dietas", icon: Apple },
    { href: "/patient/appointments", label: "Agendamentos", icon: Calendar },
  ];

  const links = role === "nutritionist" ? nutritionistLinks : patientLinks;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href={role === "nutritionist" ? "/dashboard" : "/patient/dashboard"} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Salad size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">NutriPlanner</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
              `}>
                <link.icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-secondary/50 border border-border/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Sair da conta
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Salad size={20} />
          </div>
          <span className="font-display font-bold text-lg">NutriPlanner</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 bg-card z-40 p-4 border-b shadow-lg md:hidden flex flex-col"
          >
            <div className="flex-1 space-y-2">
              {links.map((link) => {
                const isActive = location.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"}
                  `}>
                    <link.icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-auto text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" /> Sair
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
