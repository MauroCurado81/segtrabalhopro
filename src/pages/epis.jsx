import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EpiForm } from "@/components/epis/epi-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getEpis, saveEpi, deleteEpi } from "@/lib/epis-service";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { formatDate, calcularDiasRestantes } from "@/lib/data-utils";

export function Epis() {
  const { toast } = useToast();
  const [epis, setEpis] = useState([]);
  const [filteredEpis, setFilteredEpis] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEpi, setCurrentEpi] = useState(null);
  const [epiToDelete, setEpiToDelete] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      const episData = await getEpis();
      const funcionariosData = await getFuncionarios();
      
      const episComFuncionario = episData.map(epi => {
        const funcionario = funcionariosData.find(f => f.id === epi.funcionarioId);
        return {
          ...epi,
          funcionarioNome: funcionario ? funcionario.nome : 'Funcionário não encontrado',
          diasRestantes: calcularDiasRestantes(epi.dataValidade)
        };
      });
      
      setEpis(episComFuncionario);
      setFilteredEpis(episComFuncionario);
      setFuncionarios(funcionariosData);
    };
    
    carregarDados();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEpis(epis);
    } else {
      const filtered = epis.filter(
        (epi) =>
          epi.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          epi.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (epi.ca && epi.ca.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEpis(filtered);
    }
  }, [searchTerm, epis]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEpi = () => {
    setCurrentEpi(null);
    setIsFormOpen(true);
  };

  const handleEditEpi = (epi) => {
    setCurrentEpi(epi);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (epi) => {
    setEpiToDelete(epi);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (epiToDelete) {
      await deleteEpi(epiToDelete.id);
      
      const updatedEpis = epis.filter(
        (e) => e.id !== epiToDelete.id
      );
      setEpis(updatedEpis);
      
      toast({
        title: "EPI excluído",
        description: "O EPI foi excluído com sucesso.",
      });
      
      setIsDeleteDialogOpen(false);
      setEpiToDelete(null);
    }
  };

  const handleSaveEpi = async (data) => {
    const savedEpi = await saveEpi(data);
    
    const funcionario = funcionarios.find(f => f.id === savedEpi.funcionarioId);
    const epiComFuncionario = {
      ...savedEpi,
      funcionarioNome: funcionario ? funcionario.nome : 'Funcionário não encontrado',
      diasRestantes: calcularDiasRestantes(savedEpi.dataValidade)
    };
    
    if (data.id) {
      setEpis(
        epis.map((e) => (e.id === data.id ? epiComFuncionario : e))
      );
    } else {
      setEpis([...epis, epiComFuncionario]);
    }
  };

  const getStatusBadge = (diasRestantes) => {
    if (diasRestantes === null) return null;
    
    if (diasRestantes < 0) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expirado</Badge>;
    } else if (diasRestantes < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Expira em breve</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Válido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EPIs</h1>
          <p className="text-muted-foreground">
            Gerencie os Equipamentos de Proteção Individual.
          </p>
        </div>
        <Button onClick={handleAddEpi}>
          <Plus className="mr-2 h-4 w-4" />
          Novo EPI
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar EPIs..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-md border"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>EPI</TableHead>
              <TableHead>CA</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpis.length > 0 ? (
              filteredEpis.map((epi) => (
                <TableRow key={epi.id}>
                  <TableCell className="font-medium">{epi.funcionarioNome}</TableCell>
                  <TableCell>{epi.nome}</TableCell>
                  <TableCell>{epi.ca || "—"}</TableCell>
                  <TableCell>{formatDate(epi.dataEntrega)}</TableCell>
                  <TableCell>
                    {formatDate(epi.dataValidade)}
                    {epi.dataValidade && (
                      <div className="mt-1">
                        {getStatusBadge(epi.diasRestantes)}
                        {epi.diasRestantes !== null && epi.diasRestantes < 0 && (
                          <div className="flex items-center mt-1 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span>Expirado há {Math.abs(epi.diasRestantes)} dias</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEpi(epi)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(epi)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm
                    ? "Nenhum EPI encontrado com os critérios de busca."
                    : "Nenhum EPI cadastrado. Clique em 'Novo EPI' para adicionar."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <EpiForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        epi={currentEpi}
        onSave={handleSaveEpi}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este EPI? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}