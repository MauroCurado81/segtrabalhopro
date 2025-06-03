import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { calcularValidadeAso, formatDate } from "@/lib/data-utils";

export function AsoForm({ isOpen, onClose, aso, onSave, funcionarioIdProp }) {
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState({
    funcionarioId: funcionarioIdProp || "",
    tipo: "periodico",
    dataEmissao: "",
    dataValidade: "",
    medico: "",
    crm: "",
    observacoes: ""
  });

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
    if (aso) {
      setFormData({
        ...aso,
        dataEmissao: aso.dataEmissao ? formatDateForInput(aso.dataEmissao) : "",
        dataValidade: aso.dataValidade ? formatDateForInput(aso.dataValidade) : "",
      });
    } else {
      setFormData({
        funcionarioId: funcionarioIdProp || "",
        tipo: "periodico",
        dataEmissao: "",
        dataValidade: "",
        medico: "",
        crm: "",
        observacoes: ""
      });
    }
  }, [aso, funcionarioIdProp]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "dataEmissao" && value) {
      newFormData.dataValidade = calcularValidadeAso(value);
    }
    setFormData(newFormData);
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.funcionarioId || !formData.tipo || !formData.dataEmissao) {
      toast({
        title: "Erro de validação",
        description: "Funcionário, Tipo e Data de Emissão são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const dataToSave = {
      ...formData,
      dataValidade: formData.dataValidade || calcularValidadeAso(formData.dataEmissao)
    };

    onSave(dataToSave);
    
    toast({
      title: "Sucesso!",
      description: aso 
        ? "ASO atualizado com sucesso." 
        : "ASO cadastrado com sucesso.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {aso ? "Editar ASO" : "Novo ASO"}
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
            
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de ASO*</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => handleSelectChange("tipo", value)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admissional">Admissional</SelectItem>
                  <SelectItem value="periodico">Periódico</SelectItem>
                  <SelectItem value="retorno">Retorno ao Trabalho</SelectItem>
                  <SelectItem value="mudanca">Mudança de Função</SelectItem>
                  <SelectItem value="demissional">Demissional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataEmissao">Data de Emissão*</Label>
                <Input
                  id="dataEmissao"
                  name="dataEmissao"
                  type="date"
                  value={formData.dataEmissao}
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
                  readOnly
                  className="bg-muted/50"
                />
                 <p className="text-xs text-muted-foreground">Calculada automaticamente (1 ano após emissão).</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="medico">Médico Responsável</Label>
                <Input
                  id="medico"
                  name="medico"
                  value={formData.medico}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  name="crm"
                  value={formData.crm}
                  onChange={handleChange}
                />
              </div>
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
              {aso ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}