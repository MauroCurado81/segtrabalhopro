import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getFuncionarios } from "@/lib/funcionarios-service";
import { formatDateForInput } from "@/lib/date-formatters";

export function EpiForm({ isOpen, onClose, epi, onSave, funcionarioIdProp }) {
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState(
    epi || {
      funcionarioId: funcionarioIdProp || "",
      nome: "",
      ca: "",
      dataEntrega: "",
      dataValidade: "",
      quantidade: "1",
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
    if (epi) {
      setFormData({
        ...epi,
        dataEntrega: epi.dataEntrega ? formatDateForInput(epi.dataEntrega) : "",
        dataValidade: epi.dataValidade ? formatDateForInput(epi.dataValidade) : "",
      });
    } else {
      setFormData({
        funcionarioId: funcionarioIdProp || "",
        nome: "",
        ca: "",
        dataEntrega: "",
        dataValidade: "",
        quantidade: "1",
        observacoes: ""
      });
    }
  }, [epi, funcionarioIdProp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.funcionarioId || !formData.nome || !formData.dataEntrega) {
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
      description: epi 
        ? "EPI atualizado com sucesso." 
        : "EPI cadastrado com sucesso.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {epi ? "Editar EPI" : "Novo EPI"}
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
              <Label htmlFor="nome">Nome do EPI*</Label>
              <Select 
                value={formData.nome} 
                onValueChange={(value) => handleSelectChange("nome", value)}
              >
                <SelectTrigger id="nome">
                  <SelectValue placeholder="Selecione o EPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Capacete de Segurança">Capacete de Segurança</SelectItem>
                  <SelectItem value="Óculos de Proteção">Óculos de Proteção</SelectItem>
                  <SelectItem value="Protetor Auricular">Protetor Auricular</SelectItem>
                  <SelectItem value="Máscara Respiratória">Máscara Respiratória</SelectItem>
                  <SelectItem value="Luvas de Proteção">Luvas de Proteção</SelectItem>
                  <SelectItem value="Calçado de Segurança">Calçado de Segurança</SelectItem>
                  <SelectItem value="Cinto de Segurança">Cinto de Segurança</SelectItem>
                  <SelectItem value="Vestimenta de Proteção">Vestimenta de Proteção</SelectItem>
                  <SelectItem value="Protetor Facial">Protetor Facial</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ca">Certificado de Aprovação (CA)</Label>
                <Input
                  id="ca"
                  name="ca"
                  value={formData.ca}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataEntrega">Data de Entrega*</Label>
                <Input
                  id="dataEntrega"
                  name="dataEntrega"
                  type="date"
                  value={formData.dataEntrega}
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
              {epi ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}