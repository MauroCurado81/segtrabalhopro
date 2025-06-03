import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsoForm } from "@/components/asos/aso-form";
import { AsoTable } from "@/components/asos/aso-table";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { getAsos, saveAso, deleteAso, getHistoricoAsos } from "@/lib/asos-service";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { calcularDiasRestantes } from "@/lib/data-utils";

export function Asos() {
  const { toast } = useToast();
  const [asos, setAsos] = useState([]);
  const [historicoAsos, setHistoricoAsos] = useState([]);
  const [filteredAsos, setFilteredAsos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAso, setCurrentAso] = useState(null);
  const [asoToDelete, setAsoToDelete] = useState(null);

  const fetchData = async () => {
    const asosData = await getAsos();
    const historicoData = await getHistoricoAsos();
    const funcionariosData = await getFuncionarios();
    
    const mapAsoData = (asoItem) => {
      const funcionario = funcionariosData.find(f => f.id === asoItem.funcionarioId);
      return {
        ...asoItem,
        funcionarioNome: funcionario ? funcionario.nome : 'Funcionário não encontrado',
        diasRestantes: calcularDiasRestantes(asoItem.dataValidade)
      };
    };

    const activeAsos = asosData.map(mapAsoData);
    const pastAsos = historicoData.map(mapAsoData);
    
    setAsos(activeAsos);
    setHistoricoAsos(pastAsos);
    setFilteredAsos(activeAsos); 
    setFuncionarios(funcionariosData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAsos(asos);
    } else {
      const filtered = asos.filter(
        (aso) =>
          aso.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aso.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (aso.medico && aso.medico.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAsos(filtered);
    }
  }, [searchTerm, asos]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddAso = () => {
    setCurrentAso(null);
    setIsFormOpen(true);
  };

  const handleEditAso = (aso) => {
    setCurrentAso(aso);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (aso) => {
    setAsoToDelete(aso);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (asoToDelete) {
      await deleteAso(asoToDelete.id);
      await fetchData(); 
      toast({
        title: "ASO excluído",
        description: "O ASO foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setAsoToDelete(null);
    }
  };

  const handleSaveAso = async (data) => {
    await saveAso(data);
    await fetchData(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ASOs</h1>
          <p className="text-muted-foreground">
            Gerencie os Atestados de Saúde Ocupacional.
          </p>
        </div>
        <Button onClick={handleAddAso}>
          <Plus className="mr-2 h-4 w-4" />
          Novo ASO
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ASOs ativos..."
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
      >
        <h2 className="text-2xl font-semibold tracking-tight mb-4">ASOs Ativos</h2>
        <AsoTable
          asos={filteredAsos}
          onEdit={handleEditAso}
          onDelete={handleDeleteClick}
          showStatus={true}
        />
      </motion.div>
      
      {historicoAsos.length > 0 && (
         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Histórico de ASOs</h2>
           <AsoTable
            asos={historicoAsos.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao))}
            onEdit={handleEditAso} 
            onDelete={handleDeleteClick}
            showStatus={false} 
          />
        </motion.div>
      )}


      <AsoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        aso={currentAso}
        onSave={handleSaveAso}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este ASO? Esta ação não pode ser desfeita."
      />
    </div>
  );
}