import React from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/data-utils";

export function AsoList({ asos, historicoAsos, onAdd, onEdit, onDelete }) {
  const getValidadeBadge = (diasRestantes, statusProp) => {
    if (statusProp === 'substituido') {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Substituído</Badge>;
    }
    if (diasRestantes === null) return null;
    
    if (diasRestantes < 0) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expirado</Badge>;
    } else if (diasRestantes < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Expira em breve</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Válido</Badge>;
    }
  };

  const getTipoAso = (tipo) => {
    switch (tipo) {
      case "admissional": return "Admissional";
      case "periodico": return "Periódico";
      case "retorno": return "Retorno ao Trabalho";
      case "mudanca": return "Mudança de Função";
      case "demissional": return "Demissional";
      default: return tipo;
    }
  };

  const renderAsoTable = (items, isHistorico = false) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Emissão</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((aso) => (
              <TableRow key={aso.id}>
                <TableCell className="font-medium">{getTipoAso(aso.tipo)}</TableCell>
                <TableCell>{formatDate(aso.dataEmissao)}</TableCell>
                <TableCell>{formatDate(aso.dataValidade)}</TableCell>
                <TableCell>
                  {getValidadeBadge(aso.diasRestantes, aso.status)}
                  {!isHistorico && aso.diasRestantes !== null && aso.diasRestantes < 0 && (
                    <div className="flex items-center mt-1 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Expirado há {Math.abs(aso.diasRestantes)} dias</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(aso)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(aso)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {isHistorico ? "Nenhum ASO no histórico." : "Nenhum ASO ativo cadastrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ASO Ativo</h3>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo ASO
        </Button>
      </div>
      {renderAsoTable(asos)}

      {historicoAsos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Histórico de ASOs</h3>
          {renderAsoTable(historicoAsos, true)}
        </div>
      )}
    </>
  );
}