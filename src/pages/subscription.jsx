
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { getEmpresaAtual, updateEmpresa } from '@/lib/empresa-service';
import { motion } from 'framer-motion';

const plans = [
  { id: 'price_basic_monthly', name: 'Plano Básico Mensal', price: 'R$ 49,90', interval: 'mês', features: ['Até 50 funcionários', 'Suporte por e-mail', 'Funcionalidades essenciais'] , stripePriceId: 'price_YOUR_BASIC_MONTHLY_PRICE_ID' },
  { id: 'price_premium_monthly', name: 'Plano Premium Mensal', price: 'R$ 99,90', interval: 'mês', features: ['Funcionários ilimitados', 'Suporte prioritário', 'Todas as funcionalidades', 'Relatórios avançados'], stripePriceId: 'price_YOUR_PREMIUM_MONTHLY_PRICE_ID' },
];

export function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [currentPlanDetails, setCurrentPlanDetails] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      setIsLoading(true);
      const empresaData = await getEmpresaAtual();
      setEmpresa(empresaData);
      if (empresaData && empresaData.plano && empresaData.status_pagamento === 'pago') {
        const plan = plans.find(p => p.id === empresaData.plano || p.stripePriceId === empresaData.plano);
        setCurrentPlanDetails(plan);
      }
      setIsLoading(false);
    };
    fetchEmpresaData();
  }, []);

  const handleChoosePlan = async (planStripePriceId) => {
    setIsLoading(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        toast({ title: "Erro", description: "Você precisa estar logado para escolher um plano.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    const user = sessionData.session.user;

    if (!empresa) {
        toast({ title: "Erro", description: "Dados da empresa não carregados. Tente novamente.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: { 
          priceId: planStripePriceId, 
          customerId: empresa?.stripe_customer_id, 
          userEmail: user.email,
          empresaId: empresa?.id,
          // Adicionar return_url para garantir que o usuário volte para a página correta
          // success_url: `${window.location.origin}/payment-status?session_id={CHECKOUT_SESSION_ID}&status=success`,
          // cancel_url: `${window.location.origin}/subscription?status=cancelled`,
        }
      });

      if (error) throw error;

      if (data.sessionId) {        
        const selectedPlan = plans.find(p => p.stripePriceId === planStripePriceId);
        // Simulação de atualização ANTES de redirecionar, caso não haja webhook ou para UI imediata
        if (empresa && selectedPlan) {
            await updateEmpresa({ 
                id: empresa.id, 
                plano: selectedPlan.id, 
                status_pagamento: 'pendente', 
                proximo_vencimento: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
            });
        }
        
        toast({ title: "Redirecionando para pagamento...", description: "Você será redirecionado para finalizar o pagamento." });
        // O ideal é usar a URL da sessão retornada pelo Stripe para redirecionar
        // if (data.url) { // Se o Stripe retornar a URL de checkout completa
        //    window.location.href = data.url;
        // } else { // Senão, simular ou redirecionar para página de status
             setTimeout(() => navigate(`/payment-status?session_id=${data.sessionId || 'simulated_session_id'}&status=success&plan=${selectedPlan?.id}`), 2000);
        // }
      } else {
        throw new Error("Session ID não recebido do Stripe.");
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      toast({
        title: "Erro ao processar plano",
        description: error.message || "Não foi possível iniciar o processo de pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !empresa) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando dados da empresa...</p></div>;
  }

  if (!empresa) {
    return (
         <div className="container mx-auto p-4 py-8 md:py-12 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro ao carregar dados da empresa</h1>
            <p className="text-muted-foreground mb-6">Não foi possível carregar as informações da sua empresa. Por favor, tente recarregar a página ou contate o suporte.</p>
            <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
        </div>
    );
  }
  
  if (currentPlanDetails) {
    return (
      <div className="container mx-auto p-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-2xl mx-auto shadow-lg border-2 border-green-500">
            <CardHeader className="text-center bg-green-500/10">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <CardTitle className="text-3xl font-bold text-green-600">Você já tem um Plano Ativo!</CardTitle>
              <CardDescription className="text-lg">
                Empresa: {empresa.nome}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-xl font-semibold mb-2">Plano Atual: {currentPlanDetails.name}</p>
              <p className="text-muted-foreground mb-1">Valor: {currentPlanDetails.price} / {currentPlanDetails.interval}</p>
              {empresa.proximo_vencimento && 
                <p className="text-muted-foreground mb-4">
                  Próximo vencimento: {new Date(empresa.proximo_vencimento + 'T00:00:00').toLocaleDateString()}
                </p>
              }
              <ul className="list-disc list-inside text-left mx-auto max-w-xs mb-6">
                {currentPlanDetails.features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
               <Button onClick={() => navigate('/')} className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white">
                Voltar ao Dashboard
              </Button>
            </CardContent>
             <CardFooter className="text-center text-sm text-muted-foreground p-4 bg-gray-50 dark:bg-gray-800">
                Para alterar seu plano ou informações de pagamento, entre em contato com o suporte.
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">Escolha seu Plano</h1>
        <p className="text-lg text-muted-foreground text-center mb-8 md:mb-12">
          Selecione o plano que melhor se adapta às necessidades da sua empresa: {empresa.nome}.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <motion.div key={plan.id} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full ${plan.id === 'price_premium_monthly' ? 'border-primary border-2' : ''}`}>
                <CardHeader className={plan.id === 'price_premium_monthly' ? 'bg-primary/10' : ''}>
                  <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-primary">{plan.price} <span className="text-sm font-normal text-muted-foreground">/ {plan.interval}</span></CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800 mt-auto">
                  <Button 
                    onClick={() => handleChoosePlan(plan.stripePriceId)} 
                    className={`w-full text-lg py-3 ${plan.id === 'price_premium_monthly' ? '' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processando...' : 'Escolher Plano'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
         <p className="text-center mt-12 text-sm text-muted-foreground">
            Dúvidas? <a href="mailto:suporte@segtrabalhopro.com" className="text-primary hover:underline">Entre em contato com nosso suporte</a>.
        </p>
      </motion.div>
    </div>
  );
}
