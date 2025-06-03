import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/layout';
import { Dashboard } from '@/pages/dashboard';
import { Funcionarios } from '@/pages/funcionarios';
import { FuncionarioDetalhes } from '@/pages/funcionario-detalhes';
import { Asos } from '@/pages/asos';
import { Nrs } from '@/pages/nrs';
import { Epis } from '@/pages/epis';
import { Relatorios } from '@/pages/relatorios';
import { NotFound } from '@/pages/not-found';
import { Notificacoes } from '@/pages/notificacoes';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { SubscriptionPage } from '@/pages/subscription';
import { PaymentStatusPage } from '@/pages/payment-status';
import { ThemeProvider } from '@/components/theme-provider';
import { supabase } from '@/lib/supabaseClient';
import { getEmpresaAtual } from '@/lib/empresa-service'; 
import { AdminDashboard } from '@/pages/admin/admin-dashboard';


const ProtectedRoute = ({ session, empresaInfo, children }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // Se a empresa não tem plano ou pagamento não está ok, redireciona para a página de assinatura
  // Exceto se for um admin master (a lógica de admin master será adicionada depois)
  if (session && empresaInfo && (!empresaInfo.plano || empresaInfo.status_pagamento !== 'pago') && !session.user.user_metadata?.is_master_admin) {
     // Permite acesso à página de subscription e payment-status mesmo sem plano pago
    const allowedPathsWithoutSubscription = ['/subscription', '/payment-status'];
    if (!allowedPathsWithoutSubscription.includes(window.location.pathname)) {
      return <Navigate to="/subscription" replace />;
    }
  }
  return children;
};

const AdminRoute = ({session, children}) => {
  if (!session || !session.user.user_metadata?.is_master_admin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const empresaData = await getEmpresaAtual();
        setEmpresaInfo(empresaData);
         if (empresaData && (!empresaData.plano || empresaData.status_pagamento !== 'pago') && !currentSession.user.user_metadata?.is_master_admin) {
            const allowedPaths = ['/subscription', '/payment-status', '/login', '/signup'];
            if (!allowedPaths.includes(window.location.pathname)) {
                 navigate('/subscription');
            }
        }
      }
      setIsLoading(false);
    };

    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          const empresaData = await getEmpresaAtual();
          setEmpresaInfo(empresaData);
          if (empresaData && (!empresaData.plano || empresaData.status_pagamento !== 'pago') && !newSession.user.user_metadata?.is_master_admin) {
            const allowedPaths = ['/subscription', '/payment-status', '/login', '/signup'];
            if (!allowedPaths.includes(window.location.pathname)) {
                 navigate('/subscription');
            }
          } else if (newSession.user.user_metadata?.is_master_admin) {
             if(window.location.pathname !== '/admin/dashboard') navigate('/admin/dashboard');
          } else {
            if(window.location.pathname === '/login' || window.location.pathname === '/signup') navigate('/');
          }
        } else {
          setEmpresaInfo(null);
          if(_event !== 'SIGNED_OUT') navigate('/login');
        }
        // Se acabou de fazer SIGN_IN e não tem plano, e não é admin master, vai para subscription
        if (_event === "SIGNED_IN" && newSession && empresaInfo && (!empresaInfo.plano || empresaInfo.status_pagamento !== 'pago') && !newSession.user.user_metadata?.is_master_admin) {
            navigate('/subscription');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEmpresaInfo(null);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-8 text-lg font-semibold text-primary">Carregando...</div>
      </div>
    );
  }
  
  const isMasterAdmin = session?.user?.user_metadata?.is_master_admin;

  return (
    <ThemeProvider defaultTheme="light">
      {session ? (
        <Layout onLogout={handleLogout} session={session} isMasterAdmin={isMasterAdmin}>
          <Routes>
            {isMasterAdmin ? (
              <>
                <Route path="/admin/dashboard" element={<AdminRoute session={session}><AdminDashboard /></AdminRoute>} />
                <Route path="/*" element={<Navigate to="/admin/dashboard" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Dashboard /></ProtectedRoute>} />
                <Route path="/funcionarios" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Funcionarios /></ProtectedRoute>} />
                <Route path="/funcionarios/:id" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><FuncionarioDetalhes /></ProtectedRoute>} />
                <Route path="/asos" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Asos /></ProtectedRoute>} />
                <Route path="/nrs" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Nrs /></ProtectedRoute>} />
                <Route path="/epis" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Epis /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Relatorios /></ProtectedRoute>} />
                <Route path="/notificacoes" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><Notificacoes /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><SubscriptionPage /></ProtectedRoute>} />
                <Route path="/payment-status" element={<ProtectedRoute session={session} empresaInfo={empresaInfo}><PaymentStatusPage /></ProtectedRoute>} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/signup" element={<Navigate to="/" />} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
      <Toaster />
    </ThemeProvider>
  );
}

export default App;