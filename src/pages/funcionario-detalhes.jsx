import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";
import { AsoForm } from "@/components/asos/aso-form";
import { NrForm } from "@/components/nrs/nr-form";
import { EpiForm } from "@/components/epis/epi-form";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { AsoList } from "@/components/funcionarios/detalhes/aso-list";
import { NrList } from "@/components/funcionarios/detalhes/nr-list";
import { EpiList } from "@/components/funcionarios/detalhes/epi-list";
import { useToast } from "@/components/ui/use-toast";
import { getFuncionarioById, saveFuncionario } from "@/lib/funcionarios-service";
import { getAsosByFuncionarioId, saveAso, deleteAso, getHistoricoAsosByFuncionarioId } from "@/lib/asos-service";
import { getNrsByFuncionarioId, saveNr, deleteNr } from "@/lib/nrs-service";
import { getEpisByFuncionarioId, saveEpi, deleteEpi } from "@/lib/epis-service";
import { formatDate, calcularDiasRestantes } from "@/lib/data-utils";

export function FuncionarioDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [funcionario, setFuncionario] = useState(null);
  const [asos, setAsos] = useState([]);
  const [historicoAsos, setHistoricoAsos] = useState([]);
  const [nrs, setNrs] = useState([]);
  const [epis, setEpis] = useState([]);
  
  const [isEditFuncionarioOpen, setIsEditFuncionarioOpen] = useState(false);
  const [isAsoFormOpen, setIsAsoFormOpen] = useState(false);
  const [isNrFormOpen, setIsNrFormOpen] = useState(false);
  const [isEpiFormOpen, setIsEpiFormOpen] = useState(false);
  
  const [currentAso, setCurrentAso] = useState(null);
  const [currentNr, setCurrentNr] = useState(null);
  const [currentEpi, setCurrentEpi] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const fetchData = async () => {
    const funcionarioData = await getFuncionarioById(id);
    if (!funcionarioData) {
      toast({
        title: "Erro",
        description: "Funcionário não encontrado.",
        variant: "destructive",
      });
      navigate("/funcionarios");
      return;
    }
    setFuncionario(funcionarioData);
    
    const asosData = await getAsosByFuncionarioId(id);
    setAsos(asosData.map(a => ({...a, diasRestantes: calcularDiasRestantes(a.dataValidade)})));

    const historicoAsosData = await getHistoricoAsosByFuncionarioId(id);
    setHistoricoAsos(historicoAsosData.map(a => ({...a, diasRestantes: calcularDiasRestantes(a.dataValidade)})));
    
    const nrsData = await getNrsByFuncionarioId(id);
    setNrs(nrsData.map(n => ({...n, diasRestantes: calcularDiasRestantes(n.dataValidade)})));
    
    const episData = await getEpisByFuncionarioId(id);
    setEpis(episData.map(e => ({...e, diasRestantes: calcularDiasRestantes(e.dataValidade)})));
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate, toast]);

  const handleEditFuncionario = () => {
    setIsEditFuncionarioOpen(true);
  };

  const handleSaveFuncionario = async (data) => {
    const updatedFuncionario = await saveFuncionario(data);
    setFuncionario(updatedFuncionario);
  };

  const handleAddAso = () => {
    setCurrentAso(null);
    setIsAsoFormOpen(true);
  };

  const handleEditAso = (aso) => {
    setCurrentAso(aso);
    setIsAsoFormOpen(true);
  };

  const handleSaveAso = async (data) => {
    data.funcionarioId = id;
    await saveAso(data);
    fetchData();
  };

  const handleDeleteAso = (aso) => {
    setItemToDelete(aso);
    setDeleteType("aso");
    setDeleteDialogOpen(true);
  };

  const handleAddNr = () => {
    setCurrentNr(null);
    setIsNrFormOpen(true);
  };

  const handleEditNr = (nr) => {
    setCurrentNr(nr);
    setIsNrFormOpen(true);
  };

  const handleSaveNr = async (data) => {
    data.funcionarioId = id;
    await saveNr(data);
    fetchData();
  };

  const handleDeleteNr = (nr) => {
    setItemToDelete(nr);
    setDeleteType("nr");
    setDeleteDialogOpen(true);
  };

  const handleAddEpi = () => {
    setCurrentEpi(null);
    setIsEpiFormOpen(true);
  };

  const handleEditEpi = (epi) => {
    setCurrentEpi(epi);
    setIsEpiFormOpen(true);
  };

  const handleSaveEpi = async (data) => {
    data.funcionarioId = id;
    await saveEpi(data);
    fetchData();
  };

  const handleDeleteEpi = (epi) => {
    setItemToDelete(epi);
    setDeleteType("epi");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (deleteType === "aso") {
        await deleteAso(itemToDelete.id);
      } else if (deleteType === "nr") {
        await deleteNr(itemToDelete.id);
      } else if (deleteType === "epi") {
        await deleteEpi(itemToDelete.id);
      }
      fetchData();
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item.",
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>;
      case "inativo":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inativo</Badge>;
      case "afastado":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Afastado</Badge>;
      case "ferias":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Férias</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!funcionario) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/funcionarios")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{funcionario.nome}</h1>
          <p className="text-muted-foreground">
            {funcionario.cargo} - {funcionario.setor}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Informações</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleEditFuncionario}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <span>{getStatusBadge(funcionario.status)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Matrícula:</span>
                    <span>{funcionario.matricula || "—"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Data de Admissão:</span>
                    <span>{formatDate(funcionario.dataAdmissao) || "—"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">ASOs Ativos:</span>
                    <span>{asos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">ASOs Histórico:</span>
                    <span>{historicoAsos.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Treinamentos NR:</span>
                    <span>{nrs.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">EPIs:</span>
                    <span>{epis.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Tabs defaultValue="asos">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="asos">ASOs</TabsTrigger>
              <TabsTrigger value="nrs">NRs</TabsTrigger>
              <TabsTrigger value="epis">EPIs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="asos" className="space-y-4">
              <AsoList
                asos={asos}
                historicoAsos={historicoAsos.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao))}
                onAdd={handleAddAso}
                onEdit={handleEditAso}
                onDelete={handleDeleteAso}
              />
            </TabsContent>
            
            <TabsContent value="nrs" className="space-y-4">
              <NrList
                nrs={nrs}
                onAdd={handleAddNr}
                onEdit={handleEditNr}
                onDelete={handleDeleteNr}
              />
            </TabsContent>
            
            <TabsContent value="epis" className="space-y-4">
              <EpiList
                epis={epis}
                onAdd={handleAddEpi}
                onEdit={handleEditEpi}
                onDelete={handleDeleteEpi}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <FuncionarioForm
        isOpen={isEditFuncionarioOpen}
        onClose={() => setIsEditFuncionarioOpen(false)}
        funcionario={funcionario}
        onSave={handleSaveFuncionario}
      />

      <AsoForm
        isOpen={isAsoFormOpen}
        onClose={() => setIsAsoFormOpen(false)}
        aso={currentAso}
        onSave={handleSaveAso}
        funcionarioIdProp={id}
      />

      <NrForm
        isOpen={isNrFormOpen}
        onClose={() => setIsNrFormOpen(false)}
        nr={currentNr}
        onSave={handleSaveNr}
        funcionarioIdProp={id}
      />

      <EpiForm
        isOpen={isEpiFormOpen}
        onClose={() => setIsEpiFormOpen(false)}
        epi={currentEpi}
        onSave={handleSaveEpi}
        funcionarioIdProp={id}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      />
    </div>
  );
}