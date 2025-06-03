import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Shield, HardHat, AlertTriangle, CheckCircle } from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { ExpiringItems } from "@/components/dashboard/expiring-items";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEstatisticas, getItensExpirando } from "@/lib/dashboard-service";

export function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({
    funcionariosAtivos: 0,
    totalAsos: 0,
    totalNrs: 0,
    totalEpis: 0,
    asosExpirados: 0,
    nrsExpirados: 0,
    episExpirados: 0,
    totalExpirando: 0,
    totalExpirados: 0
  });
  
  const [itensExpirando, setItensExpirando] = useState({
    asos: [],
    nrs: [],
    epis: []
  });

  useEffect(() => {
    const carregarDados = async () => {
      const stats = await getEstatisticas();
      setEstatisticas(stats);
      
      const itens = await getItensExpirando();
      setItensExpirando(itens);
    };
    
    carregarDados();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de segurança do trabalho.
        </p>
      </div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <StatusCard
            title="Funcionários Ativos"
            value={estatisticas.funcionariosAtivos}
            icon={<Users className="h-6 w-6" />}
            trend={{ type: "up", value: "Total de funcionários cadastrados" }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatusCard
            title="ASOs"
            value={estatisticas.totalAsos}
            icon={<FileText className="h-6 w-6" />}
            trend={{ 
              type: estatisticas.asosExpirados > 0 ? "down" : "up", 
              value: estatisticas.asosExpirados > 0 
                ? `${estatisticas.asosExpirados} expirados` 
                : "Todos válidos" 
            }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatusCard
            title="Treinamentos NRs"
            value={estatisticas.totalNrs}
            icon={<Shield className="h-6 w-6" />}
            trend={{ 
              type: estatisticas.nrsExpirados > 0 ? "down" : "up", 
              value: estatisticas.nrsExpirados > 0 
                ? `${estatisticas.nrsExpirados} expirados` 
                : "Todos válidos" 
            }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatusCard
            title="EPIs Entregues"
            value={estatisticas.totalEpis}
            icon={<HardHat className="h-6 w-6" />}
            trend={{ 
              type: estatisticas.episExpirados > 0 ? "down" : "up", 
              value: estatisticas.episExpirados > 0 
                ? `${estatisticas.episExpirados} expirados` 
                : "Todos válidos" 
            }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatusCard
            title="Itens Expirando"
            value={estatisticas.totalExpirando}
            icon={<AlertTriangle className="h-6 w-6" />}
            className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
            trend={{ 
              type: "down", 
              value: "Nos próximos 30 dias" 
            }}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatusCard
            title="Itens Expirados"
            value={estatisticas.totalExpirados}
            icon={<CheckCircle className="h-6 w-6" />}
            className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
            trend={{ 
              type: "down", 
              value: "Necessitam renovação" 
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Tabs defaultValue="asos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="asos">ASOs</TabsTrigger>
            <TabsTrigger value="nrs">NRs</TabsTrigger>
            <TabsTrigger value="epis">EPIs</TabsTrigger>
          </TabsList>
          <TabsContent value="asos">
            <ExpiringItems 
              title="ASOs Expirando ou Expirados" 
              items={itensExpirando.asos}
              type="aso"
            />
          </TabsContent>
          <TabsContent value="nrs">
            <ExpiringItems 
              title="Treinamentos NRs Expirando ou Expirados" 
              items={itensExpirando.nrs}
              type="nr"
            />
          </TabsContent>
          <TabsContent value="epis">
            <ExpiringItems 
              title="EPIs Expirando ou Expirados" 
              items={itensExpirando.epis}
              type="epi"
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}