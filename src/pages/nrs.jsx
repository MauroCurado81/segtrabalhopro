import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NrForm } from "@/components/nrs/nr-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getNrs, saveNr, deleteNr } from "@/lib/nrs-service";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { formatDate, calcularDiasRestantes } from "@/lib/data-utils";

export function Nrs() {
  const { toast } = useToast();
  const [nrs, setNrs] = useState([]);
  const [filteredNrs, setFilteredNrs] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNr, setCurrentNr] = useState(null);
  const [nrToDelete, setNrToDelete] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      const nrsData = await getNrs();
      const funcionariosData = await getFuncionarios();
      
      const nrsComFuncionario = nrsData.map(nr => {
        const funcionario = funcionariosData.find(f => f.id === nr.funcionarioId);
        return {
          ...nr,
          funcionarioNome: funcionario ? funcionario.nome : 'Funcionário não encontrado',
          diasRestantes: calcularDiasRestantes(nr.dataValidade)
        };
      });
      
      setNrs(nrsComFuncionario);
      setFilteredNrs(nrsComFuncionario);
      setFuncionarios(funcionariosData);
    };
    
    carregarDados();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNrs(nrs);
    } else {
      const filtered = nrs.filter(
        (nr) =>
          nr.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nr.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nr.descricao && nr.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (nr.instituicao && nr.instituicao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNrs(filtered);
    }
  }, [searchTerm, nrs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNr = () => {
    setCurrentNr(null);
    setIsFormOpen(true);
  };

  const handleEditNr = (nr) => {
    setCurrentNr(nr);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (nr) => {
    setNrToDelete(nr);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (nrToDelete) {
      await deleteNr(nrToDelete.id);
      
      const updatedNrs = nrs.filter(
        (n) => n.id !== nrToDelete.id
      );
      setNrs(updatedNrs);
      
      toast({
        title: "Treinamento excluído",
        description: "O treinamento NR foi excluído com sucesso.",
      });
      
      setIsDeleteDialogOpen(false);
      setNrToDelete(null);
    }
  };

  const handleSaveNr = async (data) => {
    const savedNr = await saveNr(data);
    
    const funcionario = funcionarios.find(f => f.id === savedNr.funcionarioId);
    const nrComFuncionario = {
      ...savedNr,
      funcionarioNome: funcionario ? funcionario.nome : 'Funcionário não encontrado',
      diasRestantes: calcularDiasRestantes(savedNr.dataValidade)
    };
    
    if (data.id) {
      setNrs(
        nrs.map((n) => (n.id === data.id ? nrComFuncionario : n))
      );
    } else {
      setNrs([...nrs, nrComFuncionario]);
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
          <h1 className="text-3xl font-bold tracking-tight">Treinamentos NR</h1>
          <p className="text-muted-foreground">
            Gerencie os treinamentos de Normas Regulamentadoras.
          </p>
        </div>
        <Button onClick={handleAddNr}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar treinamentos..."
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
              <TableHead>NR</TableHead>
              <TableHead>Realização</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNrs.length > 0 ? (
              filteredNrs.map((nr) => (
                <TableRow key={nr.id}>
                  <TableCell className="font-medium">{nr.funcionarioNome}</TableCell>
                  <TableCell>{nr.numero}</TableCell>
                  <TableCell>{formatDate(nr.dataRealizacao)}</TableCell>
                  <TableCell>{formatDate(nr.dataValidade)}</TableCell>
                  <TableCell>
                    {getStatusBadge(nr.diasRestantes)}
                    {nr.diasRestantes !== null && nr.diasRestantes < 0 && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>Expirado há {Math.abs(nr.diasRestantes)} dias</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditNr(nr)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(nr)}
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
                    ? "Nenhum treinamento encontrado com os critérios de busca."
                    : "Nenhum treinamento cadastrado. Clique em 'Novo Treinamento' para adicionar."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <NrForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        nr={currentNr}
        onSave={handleSaveNr}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este treinamento? Esta ação não pode ser desfeita.
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