import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, ToggleLeft, ToggleRight, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAllEmpresas, updateEmpresa } from '@/lib/empresa-service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminDashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEmpresas();
      setEmpresas(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar empresas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmpresaStatus = async (empresaId, currentStatus) => {
    try {
      await updateEmpresa({ id: empresaId, ativo: !currentStatus });
      toast({
        title: "Status da empresa atualizado",
        description: `Empresa ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
      fetchEmpresas(); // Re-fetch para atualizar a lista
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleImpersonate = async (empresaId) => {
    // Esta é uma funcionalidade complexa e potencialmente insegura se não implementada corretamente.
    // Supabase não oferece "impersonation" diretamente para RLS baseada em claims customizadas de forma simples.
    // Uma abordagem seria criar um token JWT customizado com o `empresa_id` desejado.
    // Isso exigiria uma Edge Function segura para gerar esse token.
    // Por agora, vamos apenas simular com um log.
    console.warn(`Simulando impersonate da empresa ID: ${empresaId}. Implementação real necessária.`);
    toast({
      title: "Visualizar Empresa (Simulação)",
      description: `Você agora estaria visualizando os dados da empresa com ID ${empresaId}. Esta funcionalidade requer implementação backend adicional.`,
      variant: "info",
    });
    // Idealmente:
    // const { data, error } = await supabase.functions.invoke('impersonate-empresa', { body: { targetEmpresaId: empresaId } });
    // if (error) throw error;
    // await supabase.auth.setSession(data.access_token, data.refresh_token);
    // navigate('/'); // ou para um dashboard específico da empresa
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empresa.cnpj && empresa.cnpj.includes(searchTerm))
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando dados de administrador...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-6 bg-gradient-to-r from-primary/80 to-primary text-primary-foreground shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Painel do Administrador Master</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Gerenciamento de todas as empresas cadastradas no sistema.
              </CardDescription>
            </div>
            <Users size={48} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Briefcase className="mr-2 h-6 w-6 text-primary" /> Lista de Empresas
          </CardTitle>
          <CardDescription>
            Visualize e gerencie as empresas clientes. Você tem {empresas.length} empresas cadastradas.
          </CardDescription>
           <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            className="mt-2 p-2 border rounded-md w-full md:w-1/2 lg:w-1/3 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {filteredEmpresas.length === 0 ? (
             <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">Nenhuma empresa encontrada.</p>
                <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Tente refinar sua busca." : "Não há empresas cadastradas no momento."}
                </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Próx. Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{empresa.nome}</TableCell>
                    <TableCell>{empresa.cnpj || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={empresa.plano ? 'default' : 'outline'}>
                        {empresa.plano ? (empresa.plano === 'price_basic_monthly' ? 'Básico' : 'Premium') : 'Sem Plano'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          empresa.status_pagamento === 'pago' ? 'default' : 
                          empresa.status_pagamento === 'pendente' ? 'secondary' : 'destructive'
                        }
                        className={
                            empresa.status_pagamento === 'pago' ? 'bg-green-500 hover:bg-green-600' : 
                            empresa.status_pagamento === 'pendente' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                            'bg-red-500 hover:bg-red-600'
                        }
                      >
                        {empresa.status_pagamento ? empresa.status_pagamento.charAt(0).toUpperCase() + empresa.status_pagamento.slice(1) : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {empresa.proximo_vencimento 
                        ? format(new Date(empresa.proximo_vencimento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={empresa.ativo ? 'default' : 'destructive'} className={empresa.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {empresa.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleImpersonate(empresa.id)} title="Visualizar como esta empresa">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={empresa.ativo ? "destructive" : "default"} 
                        size="sm" 
                        onClick={() => toggleEmpresaStatus(empresa.id, empresa.ativo)}
                        title={empresa.ativo ? "Desativar Empresa" : "Ativar Empresa"}
                        className={empresa.ativo ? "" : "bg-green-500 hover:bg-green-600"}
                      >
                        {empresa.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}