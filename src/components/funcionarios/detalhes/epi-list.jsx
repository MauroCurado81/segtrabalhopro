import React from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/data-utils";

export function EpiList({ epis, onAdd, onEdit, onDelete }) {
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
        <h3 className="text-lg font-semibold">Equipamentos de Proteção Individual</h3>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo EPI
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>EPI</TableHead>
              <TableHead>CA</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {epis.length > 0 ? (
              epis.map((epi) => (
                <TableRow key={epi.id}>
                  <TableCell className="font-medium">{epi.nome}</TableCell>
                  <TableCell>{epi.ca || "—"}</TableCell>
                  <TableCell>{formatDate(epi.dataEntrega)}</TableCell>
                  <TableCell>{formatDate(epi.dataValidade)}</TableCell>
                  <TableCell>
                    {epi.dataValidade && getValidadeBadge(epi.diasRestantes)}
                    {epi.dataValidade && epi.diasRestantes !== null && epi.diasRestantes < 0 && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>Expirado há {Math.abs(epi.diasRestantes)} dias</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(epi)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(epi)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum EPI cadastrado para este funcionário.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}