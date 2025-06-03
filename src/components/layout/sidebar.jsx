import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, FileText, Shield, HardHat, BarChart3, Bell, Settings, Building, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const navItemsRegular = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/funcionarios", label: "Funcionários", icon: Users },
  { href: "/asos", label: "ASOs", icon: FileText },
  { href: "/nrs", label: "NRs", icon: Shield },
  { href: "/epis", label: "EPIs", icon: HardHat },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/subscription", label: "Meu Plano", icon: Settings },
];

const navItemsAdminMaster = [
    { href: "/admin/dashboard", label: "Painel Admin", icon: UserCog },
    // Adicionar outras rotas específicas do admin master aqui
];


export function Sidebar({ isMasterAdmin }) {
  const location = useLocation();
  const navItems = isMasterAdmin ? navItemsAdminMaster : navItemsRegular;

  return (
    <motion.aside 
      className="hidden md:flex flex-col w-64 bg-background border-r sticky top-0 h-screen"
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center h-16 border-b">
        <Link to="/" className="flex items-center gap-2">
          <motion.img 
            src="/safety-icon.svg" 
            alt="SegTrabalho Pro Logo" 
            className="h-8 w-8" 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity, repeatDelay: 5 }}
          />
          <span className="text-xl font-bold text-primary">SegTrabalho Pro</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
              location.pathname === item.href && "bg-primary/10 text-primary font-medium shadow-sm"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
         <p className="text-xs text-muted-foreground text-center">
            {isMasterAdmin ? "Modo Administrador Master" : "Gerenciamento de Segurança do Trabalho"}
        </p>
      </div>
    </motion.aside>
  );
}