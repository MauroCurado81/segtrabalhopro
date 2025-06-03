import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getFuncionarios, getItensExpirando } from "@/lib/data";
import { NotificacaoForm } from "@/components/notificacoes/notificacao-form";
import { ItensExpirandoLista } from "@/components/notificacoes/itens-expirando-lista";

export function Notificacoes() {
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [itensExpirando, setItensExpirando] = useState({ asos: [], nrs: [], epis: [] });
  
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [tipoNotificacao, setTipoNotificacao] = useState("email");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const carregarDados = async () => {
      const funcData = await getFuncionarios();
      setFuncionarios(funcData);
      
      const itensData = await getItensExpirando();
      setItensExpirando(itensData);
    };
    carregarDados();
  }, []);

  const getFuncionarioById = (id) => funcionarios.find(f => f.id === id);

  const handleFuncionarioChange = (funcionarioId) => {
    setSelectedFuncionarioId(funcionarioId);
    setSelectedItem(null); 
    setMensagem("");
  };

  const handleItemChange = (itemId, tipoItem) => {
    let itemEncontrado = null;
    if (tipoItem === "aso") itemEncontrado = itensExpirando.asos.find(i => i.id === itemId);
    else if (tipoItem === "nr") itemEncontrado = itensExpirando.nrs.find(i => i.id === itemId);
    else if (tipoItem === "epi") itemEncontrado = itensExpirando.epis.find(i => i.id === itemId);

    setSelectedItem({ ...itemEncontrado, tipoItem });
    gerarMensagemPadrao({ ...itemEncontrado, tipoItem });
  };
  
  const gerarMensagemPadrao = (item) => {
    if (!item || !selectedFuncionarioId) {
      setMensagem("");
      return;
    }

    const funcionario = getFuncionarioById(selectedFuncionarioId);
    if (!funcionario) return;

    let tipoDescricao = "";
    let itemDescricaoDetalhada = ""; 
    if (item.tipoItem === "aso") {
      tipoDescricao = "ASO";
      itemDescricaoDetalhada = `do tipo ${item.tipo}`;
    } else if (item.tipoItem === "nr") {
      tipoDescricao = "Treinamento NR";
      itemDescricaoDetalhada = `${item.descricao}`;
    } else if (item.tipoItem === "epi") {
      tipoDescricao = "EPI";
      itemDescricaoDetalhada = `${item.descricao}`;
    }
    
    const textoBase = `Prezado(a) ${funcionario.nome},\n\nLembramos que seu ${tipoDescricao} ${itemDescricaoDetalhada} está próximo do vencimento ou já venceu em ${item.validade}.\n\nPor favor, regularize sua situação o mais breve possível.\n\nAtenciosamente,\nDepartamento de Segurança do Trabalho`;
    setMensagem(textoBase);
  };

  const handleEnviarNotificacao = () => {
    if (!selectedFuncionarioId || !selectedItem || !mensagem) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um funcionário, um item e escreva uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    const funcionario = getFuncionarioById(selectedFuncionarioId);
    
    toast({
      title: "Notificação Simulada Enviada!",
      description: `Uma notificação por ${tipoNotificacao} foi simulada para ${funcionario.nome} sobre ${selectedItem.tipo || selectedItem.descricao}.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => console.log("Visualizar notificação simulada")}>
          Ver Detalhes
        </Button>
      ),
    });
  };

  const getItensDoFuncionarioSelecionado = () => {
    if (!selectedFuncionarioId) return [];
    
    const funcionario = getFuncionarioById(selectedFuncionarioId);
    if (!funcionario) return [];

    const todosItens = [
      ...itensExpirando.asos.filter(i => i.funcionario === funcionario.nome).map(i => ({ ...i, tipoItem: "aso"})),
      ...itensExpirando.nrs.filter(i => i.funcionario === funcionario.nome).map(i => ({ ...i, tipoItem: "nr"})),
      ...itensExpirando.epis.filter(i => i.funcionario === funcionario.nome).map(i => ({ ...i, tipoItem: "epi"}))
    ];
    return todosItens.sort((a,b) => a.diasRestantes - b.diasRestantes);
  };
  
  const itensFiltradosParaSelect = getItensDoFuncionarioSelecionado();

  const todosItensExpirando = [
    ...itensExpirando.asos.map(i => ({ ...i, tipoItem: "aso"})),
    ...itensExpirando.nrs.map(i => ({ ...i, tipoItem: "nr"})),
    ...itensExpirando.epis.map(i => ({ ...i, tipoItem: "epi"}))
  ].sort((a,b) => a.diasRestantes - b.diasRestantes);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Enviar Notificações</h1>
        <p className="text-muted-foreground">
          Envie lembretes de vencimento para os funcionários (simulação).
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NotificacaoForm
          funcionarios={funcionarios.filter(f => 
            itensExpirando.asos.some(i => i.funcionario === f.nome) ||
            itensExpirando.nrs.some(i => i.funcionario === f.nome) ||
            itensExpirando.epis.some(i => i.funcionario === f.nome)
          )}
          selectedFuncionarioId={selectedFuncionarioId}
          onFuncionarioChange={handleFuncionarioChange}
          itensParaNotificar={itensFiltradosParaSelect}
          selectedItem={selectedItem}
          onItemChange={handleItemChange}
          tipoNotificacao={tipoNotificacao}
          onTipoNotificacaoChange={setTipoNotificacao}
          mensagem={mensagem}
          onMensagemChange={setMensagem}
          onEnviarNotificacao={handleEnviarNotificacao}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Itens Próximos do Vencimento</CardTitle>
            <CardDescription>Lista de ASOs, NRs e EPIs que precisam de atenção.</CardDescription>
          </CardHeader>
          <CardContent>
             { todosItensExpirando.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4 text-lg font-medium text-muted-foreground">
                    Nenhum item próximo do vencimento ou expirado no momento!
                  </p>
                </div>
             ) : (
              <ItensExpirandoLista itens={todosItensExpirando} />
             )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}