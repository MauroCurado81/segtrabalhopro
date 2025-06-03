
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, Users, Shield, HardHat, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAsos } from "@/lib/asos-service";
import { getNrs } from "@/lib/nrs-service";
import { getEpis } from "@/lib/epis-service";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { formatDate, calcularDiasRestantes } from "@/lib/data-utils";
import { useToast } from "@/components/ui/use-toast";

const RelatorioFiltros = ({ funcionarios, onFiltroChange, onExport }) => {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroFuncionario, setFiltroFuncionario] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    onFiltroChange({
      status: filtroStatus,
      funcionarioId: filtroFuncionario,
      periodo: { dataInicio, dataFim }
    });
  }, [filtroStatus, filtroFuncionario, dataInicio, dataFim, onFiltroChange]);

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filtros do Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="filtro-status">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger id="filtro-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="valido">Válido</SelectItem>
              <SelectItem value="expirando">Expira em Breve</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filtro-funcionario">Funcionário</Label>
          <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
            <SelectTrigger id="filtro-funcionario">
              <SelectValue placeholder="Funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Funcionários</SelectItem>
              {funcionarios.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:col-span-2 lg:col-span-1 justify-start text-left font-normal mt-auto">
              <Calendar className="mr-2 h-4 w-4" />
              {dataInicio && dataFim ? `${formatDate(dataInicio)} - ${formatDate(dataFim)}` : <span>Período de Validade</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 space-y-2">
            <div>
              <Label htmlFor="data-inicio">Data de Início</Label>
              <Input id="data-inicio" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="data-fim">Data de Fim</Label>
              <Input id="data-fim" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
            </div>
          </PopoverContent>
        </Popover>
        {onExport && (
           <Button onClick={onExport} className="w-full md:col-span-2 lg:col-span-1 mt-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório Atual
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const RelatorioTabela = ({ dados, tipo, funcionariosMap }) => {
  const colunasConfig = {
    asos: [
      { header: "Funcionário", accessor: "funcionarioId" },
      { header: "Tipo ASO", accessor: "tipo" },
      { header: "Data Emissão", accessor: "dataEmissao", isDate: true },
      { header: "Data Validade", accessor: "dataValidade", isDate: true },
      { header: "Status", accessor: "status" },
    ],
    nrs: [
      { header: "Funcionário", accessor: "funcionarioId" },
      { header: "NR", accessor: "numero" },
      { header: "Descrição", accessor: "descricao" },
      { header: "Data Realização", accessor: "dataRealizacao", isDate: true },
      { header: "Data Validade", accessor: "dataValidade", isDate: true },
      { header: "Status", accessor: "status" },
    ],
    epis: [
      { header: "Funcionário", accessor: "funcionarioId" },
      { header: "Nome EPI", accessor: "nome" },
      { header: "CA", accessor: "ca" },
      { header: "Data Entrega", accessor: "dataEntrega", isDate: true },
      { header: "Data Validade", accessor: "dataValidade", isDate: true },
      { header: "Status", accessor: "status" },
    ],
  };

  const colunas = colunasConfig[tipo] || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case "expirado": return <Badge variant="destructive">Expirado</Badge>;
      case "expirando": return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">Expira em Breve</Badge>;
      case "valido": return <Badge variant="default" className="bg-green-500 text-white">Válido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {colunas.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colunas.length} className="h-24 text-center text-muted-foreground">
                Nenhum dado encontrado para os filtros aplicados.
              </TableCell>
            </TableRow>
          ) : (
            dados.map(item => (
              <TableRow key={item.id}>
                {colunas.map(col => (
                  <TableCell key={`${item.id}-${col.accessor}`}>
                    {col.accessor === "funcionarioId"
                      ? (funcionariosMap.get(item.funcionarioId)?.nome || 'N/A')
                      : col.isDate
                      ? formatDate(item[col.accessor])
                      : col.accessor === "status"
                      ? getStatusBadge(item[col.accessor])
                      : item[col.accessor] || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};


export function Relatorios() {
  const [asos, setAsos] = useState([]);
  const [nrs, setNrs] = useState([]);
  const [epis, setEpis] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  
  const [filtros, setFiltros] = useState({
    status: "todos",
    funcionarioId: "todos",
    periodo: { dataInicio: "", dataFim: "" }
  });
  const [activeTab, setActiveTab] = useState("asos");
  const { toast } = useToast();

  const funcionariosMap = useMemo(() => new Map(funcionarios.map(f => [f.id, f])), [funcionarios]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [funcionariosData, asosData, nrsData, episData] = await Promise.all([
          getFuncionarios(),
          getAsos(),
          getNrs(),
          getEpis(),
        ]);
        setFuncionarios(funcionariosData);

        const processarItens = (items) => items.map(item => {
          const diasRestantes = calcularDiasRestantes(item.dataValidade);
          return {
            ...item,
            diasRestantes,
            status: getStatusFromDias(diasRestantes)
          };
        });
        
        setAsos(processarItens(asosData));
        setNrs(processarItens(nrsData));
        setEpis(processarItens(episData));
      } catch (error) {
         toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
      }
    };
    carregarDadosIniciais();
  }, [toast]);

  const getStatusFromDias = (diasRestantes) => {
    if (diasRestantes === null || diasRestantes === undefined) return "valido"; // Considera válido se não há data de validade
    if (diasRestantes < 0) return "expirado";
    if (diasRestantes < 30) return "expirando";
    return "valido";
  };

  const dadosFiltrados = useMemo(() => {
    const filterItems = (items) => {
      let tempItems = [...items];
      if (filtros.status !== "todos") {
        tempItems = tempItems.filter(item => item.status === filtros.status);
      }
      if (filtros.funcionarioId !== "todos") {
        tempItems = tempItems.filter(item => String(item.funcionarioId) === String(filtros.funcionarioId));
      }
      if (filtros.periodo.dataInicio && filtros.periodo.dataFim) {
        const dataInicio = new Date(filtros.periodo.dataInicio + "T00:00:00");
        const dataFim = new Date(filtros.periodo.dataFim + "T23:59:59");
        tempItems = tempItems.filter(item => {
          if (!item.dataValidade) return false;
          const dataValidade = new Date(item.dataValidade);
          return dataValidade >= dataInicio && dataValidade <= dataFim;
        });
      }
      return tempItems;
    };
    return {
      asos: filterItems(asos),
      nrs: filterItems(nrs),
      epis: filterItems(epis),
    };
  }, [filtros, asos, nrs, epis]);

  const handleExportarRelatorio = () => {
    let dados;
    let nomeArquivo;
    let cabecalhosCSV;
    let formatarLinha;
    
    const getStatusText = (status) => {
        switch (status) {
            case "expirado": return "Expirado";
            case "expirando": return "Expira em breve";
            case "valido": return "Válido";
            default: return status;
        }
    };

    const getFuncionarioNome = (id) => funcionariosMap.get(id)?.nome || 'N/A';

    switch (activeTab) {
      case "asos":
        dados = dadosFiltrados.asos;
        nomeArquivo = "relatorio_asos.csv";
        cabecalhosCSV = "Funcionário,Tipo ASO,Data Emissão,Data Validade,Status,Dias Restantes,Médico,CRM,Observações\n";
        formatarLinha = item => `"${getFuncionarioNome(item.funcionarioId)}","${item.tipo}","${formatDate(item.dataEmissao)}","${formatDate(item.dataValidade)}","${getStatusText(item.status)}","${item.diasRestantes}","${item.medico || ''}","${item.crm || ''}","${(item.observacoes || '').replace(/"/g, '""')}"\n`;
        break;
      case "nrs":
        dados = dadosFiltrados.nrs;
        nomeArquivo = "relatorio_nrs.csv";
        cabecalhosCSV = "Funcionário,NR,Descrição,Data Realização,Data Validade,Status,Dias Restantes,Instituição,Carga Horária,Observações\n";
        formatarLinha = item => `"${getFuncionarioNome(item.funcionarioId)}","${item.numero}","${item.descricao || ''}","${formatDate(item.dataRealizacao)}","${formatDate(item.dataValidade)}","${getStatusText(item.status)}","${item.diasRestantes}","${item.instituicao || ''}","${item.cargaHoraria || ''}","${(item.observacoes || '').replace(/"/g, '""')}"\n`;
        break;
      case "epis":
        dados = dadosFiltrados.epis;
        nomeArquivo = "relatorio_epis.csv";
        cabecalhosCSV = "Funcionário,Nome EPI,CA,Data Entrega,Data Validade,Status,Dias Restantes,Quantidade,Observações\n";
        formatarLinha = item => `"${getFuncionarioNome(item.funcionarioId)}","${item.nome}","${item.ca || ''}","${formatDate(item.dataEntrega)}","${formatDate(item.dataValidade)}","${getStatusText(item.status)}","${item.diasRestantes}","${item.quantidade || '1'}","${(item.observacoes || '').replace(/"/g, '""')}"\n`;
        break;
      default:
        toast({ title: "Erro ao exportar", description: "Tipo de relatório desconhecido.", variant: "destructive" });
        return;
    }
    
    if (!dados || dados.length === 0) {
        toast({ title: "Nada para exportar", description: "Não há dados para o relatório atual.", variant: "default" });
        return;
    }

    let csv = cabecalhosCSV;
    dados.forEach(item => csv += formatarLinha(item));
    
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Adiciona BOM para UTF-8
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Relatório Exportado", description: `${nomeArquivo} foi baixado com sucesso.`});
  };


  const getTabIcon = (tabName) => {
    switch(tabName) {
      case 'asos': return <Briefcase className="mr-2 h-5 w-5" />;
      case 'nrs': return <Shield className="mr-2 h-5 w-5" />;
      case 'epis': return <HardHat className="mr-2 h-5 w-5" />;
      default: return <FileText className="mr-2 h-5 w-5" />;
    }
  };


  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          Relatórios Detalhados
        </h1>
        <p className="text-muted-foreground">
          Analise e exporte dados sobre ASOs, NRs e EPIs.
        </p>
      </div>

      <RelatorioFiltros 
        funcionarios={funcionarios} 
        onFiltroChange={setFiltros}
        onExport={handleExportarRelatorio}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
          {['asos', 'nrs', 'epis'].map(tab => (
            <TabsTrigger key={tab} value={tab} className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              {getTabIcon(tab)}
              {tab === 'asos' ? 'ASOs' : tab === 'nrs' ? 'NRs' : 'EPIs'} ({dadosFiltrados[tab].length})
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="asos" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Briefcase className="mr-2 h-5 w-5 text-primary" /> Relatório de ASOs
              </CardTitle>
              <CardDescription>Lista de Atestados de Saúde Ocupacional.</CardDescription>
            </CardHeader>
            <CardContent>
              <RelatorioTabela dados={dadosFiltrados.asos} tipo="asos" funcionariosMap={funcionariosMap} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nrs" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Shield className="mr-2 h-5 w-5 text-primary" /> Relatório de NRs
              </CardTitle>
              <CardDescription>Lista de Normas Regulamentadoras.</CardDescription>
            </CardHeader>
            <CardContent>
              <RelatorioTabela dados={dadosFiltrados.nrs} tipo="nrs" funcionariosMap={funcionariosMap} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="epis" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HardHat className="mr-2 h-5 w-5 text-primary" /> Relatório de EPIs
              </CardTitle>
              <CardDescription>Lista de Equipamentos de Proteção Individual.</CardDescription>
            </CardHeader>
            <CardContent>
              <RelatorioTabela dados={dadosFiltrados.epis} tipo="epis" funcionariosMap={funcionariosMap} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
