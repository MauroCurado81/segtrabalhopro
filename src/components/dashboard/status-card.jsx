import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatusCard({ title, value, icon, className, trend }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="mt-2 text-3xl font-bold">{value}</h3>
              {trend && (
                <p className={cn(
                  "mt-1 text-xs font-medium",
                  trend.type === "up" ? "text-green-600" : "text-red-600"
                )}>
                  {trend.value}
                </p>
              )}
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}