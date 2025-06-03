import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { formatDateForInput } from "@/lib/date-formatters";

export function NrForm({ isOpen, onClose, nr, onSave, funcionarioIdProp }) {
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState(
    nr || {
      funcionarioId: funcionarioIdProp || "",
      numero: "",
      descricao: "",
      dataRealizacao: "",
      dataValidade: "",
      instituicao: "",
      cargaHoraria: "",
      observacoes: ""
    }
  );

  useEffect(() => {
    const loadFuncionarios = async () => {
      const data = await getFuncionarios();
      setFuncionarios(data);
    };
    
    if (!funcionarioIdProp) {
      loadFuncionarios();
    } else {
       getFuncionarios().then(data => {
        const func = data.find(f => f.id === funcionarioIdProp);
        if (func) setFuncionarios([func]);
      });
    }
  }, [funcionarioIdProp]);

  useEffect(() => {
    if (nr) {
      setFormData({
        ...nr,
        dataRealizacao: nr.dataRealizacao ? formatDateForInput(nr.dataRealizacao) : "",
        dataValidade: nr.dataValidade ? formatDateForInput(nr.dataValidade) : "",
      });
    } else {
      setFormData({
        funcionarioId: funcionarioIdProp || "",
        numero: "",
        descricao: "",
        dataRealizacao: "",
        dataValidade: "",
        instituicao: "",
        cargaHoraria: "",
        observacoes: ""
      });
    }
  }, [nr, funcionarioIdProp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.funcionarioId || !formData.numero || !formData.dataRealizacao) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    
    toast({
      title: "Sucesso!",
      description: nr 
        ? "Treinamento NR atualizado com sucesso." 
        : "Treinamento NR cadastrado com sucesso.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {nr ? "Editar Treinamento NR" : "Novo Treinamento NR"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="funcionarioId">Funcionário*</Label>
              <Select 
                value={formData.funcionarioId} 
                onValueChange={(value) => handleSelectChange("funcionarioId", value)}
                disabled={!!funcionarioIdProp}
              >
                <SelectTrigger id="funcionarioId">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarios.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero">Número da NR*</Label>
                <Select 
                  value={formData.numero} 
                  onValueChange={(value) => handleSelectChange("numero", value)}
                >
                  <SelectTrigger id="numero">
                    <SelectValue placeholder="Selecione a NR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NR-01">NR-01</SelectItem>
                    <SelectItem value="NR-05">NR-05</SelectItem>
                    <SelectItem value="NR-06">NR-06</SelectItem>
                    <SelectItem value="NR-10">NR-10</SelectItem>
                    <SelectItem value="NR-11">NR-11</SelectItem>
                    <SelectItem value="NR-12">NR-12</SelectItem>
                    <SelectItem value="NR-13">NR-13</SelectItem>
                    <SelectItem value="NR-17">NR-17</SelectItem>
                    <SelectItem value="NR-18">NR-18</SelectItem>
                    <SelectItem value="NR-20">NR-20</SelectItem>
                    <SelectItem value="NR-23">NR-23</SelectItem>
                    <SelectItem value="NR-33">NR-33</SelectItem>
                    <SelectItem value="NR-35">NR-35</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cargaHoraria">Carga Horária (h)</Label>
                <Input
                  id="cargaHoraria"
                  name="cargaHoraria"
                  type="number"
                  value={formData.cargaHoraria}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataRealizacao">Data de Realização*</Label>
                <Input
                  id="dataRealizacao"
                  name="dataRealizacao"
                  type="date"
                  value={formData.dataRealizacao}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <Input
                  id="dataValidade"
                  name="dataValidade"
                  type="date"
                  value={formData.dataValidade}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instituicao">Instituição</Label>
              <Input
                id="instituicao"
                name="instituicao"
                value={formData.instituicao}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {nr ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}