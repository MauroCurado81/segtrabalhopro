import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExpiringItems({ title, items, type }) {
  const getStatusClass = (daysLeft) => {
    if (daysLeft < 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (daysLeft < 30) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  const getStatusText = (daysLeft) => {
    if (daysLeft < 0) return "Expirado";
    if (daysLeft < 30) return "Expira em breve";
    return "Válido";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>{type === "aso" ? "Tipo" : "Descrição"}</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.funcionario}</TableCell>
                    <TableCell>{item.tipo || item.descricao}</TableCell>
                    <TableCell>{item.validade}</TableCell>
                    <TableCell>
                      <Badge className={cn("px-2 py-1", getStatusClass(item.diasRestantes))}>
                        {getStatusText(item.diasRestantes)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum item para exibir
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}