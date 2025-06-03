import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { getEmpresaAtual, updateEmpresa } from '@/lib/empresa-service';

const plansMap = {
  'price_YOUR_BASIC_MONTHLY_PRICE_ID': 'price_basic_monthly', 
  'price_YOUR_PREMIUM_MONTHLY_PRICE_ID': 'price_premium_monthly',
};


export function PaymentStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('Processando seu pagamento...');
  const [empresa, setEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchEmpresa = async () => {
      setIsLoading(true);
      const empresaData = await getEmpresaAtual();
      setEmpresa(empresaData);
      setIsLoading(false);
      return empresaData;
    };
    fetchEmpresa();
  }, []);

  useEffect(() => {
    if (!empresa || isLoading) return;

    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const paymentStatusParam = params.get('status'); 
    const planIdFromQuery = params.get('plan'); 

    const verifyAndUpdatePayment = async () => {
      setIsLoading(true);
      if (!sessionId) {
        setStatus('error');
        setMessage('ID da sessão de pagamento não encontrado.');
        setIsLoading(false);
        return;
      }

      if (sessionId === 'simulated_session_id' && paymentStatusParam === 'success') {
         if (empresa && planIdFromQuery) {
            try {
                await updateEmpresa({ 
                    id: empresa.id, 
                    plano: planIdFromQuery, 
                    status_pagamento: 'pago', 
                    data_ultimo_pagamento: new Date().toISOString().split('T')[0],
                    proximo_vencimento: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                });
                setStatus('success');
                setMessage('Pagamento confirmado e assinatura ativada com sucesso! (Simulado)');
                toast({ title: "Sucesso!", description: "Sua assinatura foi ativada. (Simulado)" });
            } catch (error) {
                setStatus('error');
                setMessage(`Erro ao atualizar assinatura (simulado): ${error.message}`);
                toast({ title: "Erro", description: `Falha ao atualizar assinatura (simulado): ${error.message}`, variant: "destructive" });
            }
        } else {
            setStatus('error');
            setMessage('Dados da empresa ou plano não encontrados para simulação.');
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId: sessionId, empresaId: empresa.id }
        });
        

        if (error) throw error;

        if (data.paymentStatus === 'paid' || data.subscriptionStatus === 'active') {
          setStatus('success');
          setMessage('Pagamento confirmado e assinatura ativada com sucesso!');
          toast({ title: "Sucesso!", description: "Sua assinatura foi ativada." });
          
          await updateEmpresa({
            id: empresa.id,
            plano: data.planId || plansMap[data.stripePriceId] || planIdFromQuery, 
            status_pagamento: 'pago',
            stripe_customer_id: data.customerId,
            stripe_subscription_id: data.subscriptionId,
            data_ultimo_pagamento: new Date().toISOString().split('T')[0],
            proximo_vencimento: data.nextBillingDate ? new Date(data.nextBillingDate * 1000).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
          });

        } else if (data.paymentStatus === 'pending' || data.paymentStatus === 'requires_action') {
          setStatus('pending');
          setMessage('Seu pagamento está pendente ou requer ação adicional. Verifique seu método de pagamento.');
          toast({ title: "Pagamento Pendente", description: "Seu pagamento ainda está sendo processado.", variant: "default" });
        } else {
          setStatus('failed');
          setMessage(`Falha no pagamento. Status: ${data.paymentStatus || data.subscriptionStatus || 'desconhecido'}. Por favor, tente novamente ou contate o suporte.`);
          toast({ title: "Falha no Pagamento", description: "Não foi possível confirmar seu pagamento.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        setStatus('error');
        setMessage(`Erro ao verificar status do pagamento: ${error.message}. Se o problema persistir, contate o suporte.`);
        toast({ title: "Erro", description: "Ocorreu um erro ao verificar seu pagamento.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndUpdatePayment();

  }, [location.search, toast, empresa, isLoading, navigate]);

  const renderIcon = () => {
    if (status === 'loading' || isLoading) return <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />;
    if (status === 'success') return <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />;
    if (status === 'pending') return <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />;
    if (status === 'failed' || status === 'error') return <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />;
    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-lg shadow-2xl text-center">
        <CardHeader>
          {renderIcon()}
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Processando Pagamento...'}
            {status === 'success' && 'Pagamento Bem-Sucedido!'}
            {status === 'pending' && 'Pagamento Pendente'}
            {status === 'failed' && 'Falha no Pagamento'}
            {status === 'error' && 'Erro no Processamento'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <Button asChild className="w-full">
              <Link to="/">Ir para o Dashboard</Link>
            </Button>
          )}
          {(status === 'failed' || status === 'error' || status === 'pending') && (
            <div className="space-y-4">
                <Button asChild className="w-full">
                    <Link to="/subscription">Tentar Novamente ou Escolher Outro Plano</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                    <Link to="/">Voltar para o Início</Link>
                </Button>
                 <p className="text-sm text-muted-foreground">Se o problema persistir, entre em contato com o <a href="mailto:suporte@segtrabalhopro.com" className="text-primary hover:underline">suporte</a>.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}