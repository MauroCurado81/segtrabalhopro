import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getFuncionarios, saveFuncionario, deleteFuncionario } from "@/lib/funcionarios-service";

export function Funcionarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFuncionario, setCurrentFuncionario] = useState(null);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState(null);

  useEffect(() => {
    const carregarFuncionarios = async () => {
      const data = await getFuncionarios();
      setFuncionarios(data);
      setFilteredFuncionarios(data);
    };
    
    carregarFuncionarios();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFuncionarios(funcionarios);
    } else {
      const filtered = funcionarios.filter(
        (funcionario) =>
          funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          funcionario.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          funcionario.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFuncionarios(filtered);
    }
  }, [searchTerm, funcionarios]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddFuncionario = () => {
    setCurrentFuncionario(null);
    setIsFormOpen(true);
  };

  const handleEditFuncionario = (funcionario) => {
    setCurrentFuncionario(funcionario);
    setIsFormOpen(true);
  };

  const handleViewFuncionario = (id) => {
    navigate(`/funcionarios/${id}`);
  };

  const handleDeleteClick = (funcionario) => {
    setFuncionarioToDelete(funcionario);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (funcionarioToDelete) {
      await deleteFuncionario(funcionarioToDelete.id);
      
      const updatedFuncionarios = funcionarios.filter(
        (f) => f.id !== funcionarioToDelete.id
      );
      setFuncionarios(updatedFuncionarios);
      
      toast({
        title: "Funcionário excluído",
        description: "O funcionário foi excluído com sucesso.",
      });
      
      setIsDeleteDialogOpen(false);
      setFuncionarioToDelete(null);
    }
  };

  const handleSaveFuncionario = async (data) => {
    const savedFuncionario = await saveFuncionario(data);
    
    if (data.id) {
      setFuncionarios(
        funcionarios.map((f) => (f.id === data.id ? savedFuncionario : f))
      );
    } else {
      setFuncionarios([...funcionarios, savedFuncionario]);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie os funcionários da empresa.
          </p>
        </div>
        <Button onClick={handleAddFuncionario}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar funcionários..."
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
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFuncionarios.length > 0 ? (
              filteredFuncionarios.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell className="font-medium">{funcionario.nome}</TableCell>
                  <TableCell>{funcionario.cargo}</TableCell>
                  <TableCell>{funcionario.setor}</TableCell>
                  <TableCell>{funcionario.matricula}</TableCell>
                  <TableCell>{getStatusBadge(funcionario.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewFuncionario(funcionario.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFuncionario(funcionario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(funcionario)}
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
                    ? "Nenhum funcionário encontrado com os critérios de busca."
                    : "Nenhum funcionário cadastrado. Clique em 'Novo Funcionário' para adicionar."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <FuncionarioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        funcionario={currentFuncionario}
        onSave={handleSaveFuncionario}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o funcionário{" "}
              <span className="font-semibold">
                {funcionarioToDelete?.nome}
              </span>
              ? Esta ação não pode ser desfeita.
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