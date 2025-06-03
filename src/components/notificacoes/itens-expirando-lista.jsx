import React from 'react';
import { Badge } from "@/components/ui/badge";

export function ItensExpirandoLista({ itens }) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {itens.map(item => (
        <div key={`${item.tipoItem}-${item.id}`} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
          <div>
            <p className="font-semibold">{item.funcionario} - {item.tipoItem.toUpperCase()}: {item.tipo || item.descricao}</p>
            <p className="text-sm text-muted-foreground">Validade: {item.validade}</p>
          </div>
          <Badge className={item.diasRestantes < 0 ? "status-expired" : (item.diasRestantes < 30 ? "status-warning" : "status-active")}>
            {item.diasRestantes < 0 ? `Expirado há ${Math.abs(item.diasRestantes)} dias` : `Vence em ${item.diasRestantes} dias`}
          </Badge>
        </div>
      ))}
    </div>
  );
}