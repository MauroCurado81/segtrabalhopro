import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";

export function Layout({ children, onLogout, session, isMasterAdmin }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMasterAdmin={isMasterAdmin} />
      <div className="flex flex-col flex-1">
        <Header onLogout={onLogout} session={session} />
        <motion.main 
          className="flex-1 p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SegTrabalho Pro. Todos os direitos reservados.</span>
        </footer>
      </div>
    </div>
  );
}