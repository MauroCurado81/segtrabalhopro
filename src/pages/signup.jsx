import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password || !confirmPassword || !fullName || !empresaNome || !empresaCnpj) {
      toast({
        title: "Erro de cadastro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro de cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          empresa_nome: empresaNome,
          empresa_cnpj: empresaCnpj,
        }
      }
    });

    if (error) {
      toast({
        title: "Falha no cadastro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
       toast({
        title: "Usuário já existe",
        description: "Um usuário com este e-mail já está cadastrado. Tente fazer login.",
        variant: "destructive",
      });
    }
     else if (data.user) {
      toast({
        title: "Cadastro quase concluído!",
        description: "Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada.",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      });
      navigate('/login');
    } else {
       toast({
        title: "Falha no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck size={32} />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">
              Criar Conta SegTrabalho Pro
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Comece a gerenciar a segurança do trabalho da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Nome Completo do Responsável</Label>
                  <Input id="fullName" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail de Acesso</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                 <h3 className="text-lg font-medium text-primary">Dados da Empresa</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="empresaNome">Nome da Empresa</Label>
                  <Input id="empresaNome" placeholder="Nome da sua empresa" value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="empresaCnpj">CNPJ</Label>
                  <Input id="empresaCnpj" placeholder="00.000.000/0000-00" value={empresaCnpj} onChange={(e) => setEmpresaCnpj(e.target.value)} required />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11 text-md mt-6" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" /> Criar Conta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}