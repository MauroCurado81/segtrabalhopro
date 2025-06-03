import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, MessageSquare } from "lucide-react";

export function NotificacaoForm({
  funcionarios,
  selectedFuncionarioId,
  onFuncionarioChange,
  itensParaNotificar,
  selectedItem,
  onItemChange,
  tipoNotificacao,
  onTipoNotificacaoChange,
  mensagem,
  onMensagemChange,
  onEnviarNotificacao
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Notificação</CardTitle>
        <CardDescription>Selecione o funcionário, o item e o canal de notificação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário</Label>
            <Select value={selectedFuncionarioId} onValueChange={onFuncionarioChange}>
              <SelectTrigger id="funcionario">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </SelectItem>
                ))}
                {funcionarios.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Nenhum funcionário com itens expirando.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item a Notificar</Label>
            <Select 
              value={selectedItem ? `${selectedItem.id}-${selectedItem.tipoItem}` : ""} 
              onValueChange={(value) => {
                const [id, tipo] = value.split('-');
                onItemChange(id, tipo);
              }}
              disabled={!selectedFuncionarioId || itensParaNotificar.length === 0}
            >
              <SelectTrigger id="item">
                <SelectValue placeholder={!selectedFuncionarioId ? "Selecione um funcionário primeiro" : (itensParaNotificar.length === 0 ? "Nenhum item para notificar" : "Selecione um item")} />
              </SelectTrigger>
              <SelectContent>
                {itensParaNotificar.map((item) => (
                  <SelectItem key={`${item.id}-${item.tipoItem}`} value={`${item.id}-${item.tipoItem}`}>
                    {item.tipoItem === 'aso' ? `ASO: ${item.tipo}` : item.descricao} (Vence em: {item.validade})
                    {item.diasRestantes < 0 && <span className="text-red-500 ml-2">(Expirado)</span>}
                    {item.diasRestantes >= 0 && item.diasRestantes < 30 && <span className="text-yellow-500 ml-2">(Expira em breve)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={tipoNotificacao} onValueChange={onTipoNotificacaoChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" /> E-mail</TabsTrigger>
            <TabsTrigger value="whatsapp"><MessageSquare className="mr-2 h-4 w-4" /> WhatsApp</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-4">
             <Label htmlFor="mensagem-email">Mensagem do E-mail</Label>
             <Textarea
                id="mensagem-email"
                placeholder="Escreva a mensagem do e-mail aqui..."
                value={mensagem}
                onChange={(e) => onMensagemChange(e.target.value)}
                rows={6}
                disabled={!selectedItem}
              />
          </TabsContent>
          <TabsContent value="whatsapp" className="mt-4">
            <Label htmlFor="mensagem-whatsapp">Mensagem do WhatsApp</Label>
            <Textarea
              id="mensagem-whatsapp"
              placeholder="Escreva a mensagem do WhatsApp aqui..."
              value={mensagem}
              onChange={(e) => onMensagemChange(e.target.value)}
              rows={6}
              disabled={!selectedItem}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={onEnviarNotificacao} disabled={!selectedItem || !mensagem}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Notificação (Simulação)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}