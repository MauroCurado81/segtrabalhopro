import React from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/data-utils";

export function NrList({ nrs, onAdd, onEdit, onDelete }) {
  const getValidadeBadge = (diasRestantes) => {
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
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Treinamentos de Normas Regulamentadoras</h3>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NR</TableHead>
              <TableHead>Realização</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nrs.length > 0 ? (
              nrs.map((nr) => (
                <TableRow key={nr.id}>
                  <TableCell className="font-medium">{nr.numero}</TableCell>
                  <TableCell>{formatDate(nr.dataRealizacao)}</TableCell>
                  <TableCell>{formatDate(nr.dataValidade)}</TableCell>
                  <TableCell>
                    {getValidadeBadge(nr.diasRestantes)}
                    {nr.diasRestantes !== null && nr.diasRestantes < 0 && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>Expirado há {Math.abs(nr.diasRestantes)} dias</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(nr)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(nr)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum treinamento NR cadastrado para este funcionário.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}