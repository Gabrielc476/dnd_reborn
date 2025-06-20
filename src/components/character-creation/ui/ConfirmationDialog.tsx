"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message = "Você tem certeza que deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconColor: "text-red-400",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          borderColor: "border-red-400/30",
        };
      case "warning":
        return {
          iconColor: "text-yellow-400",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          borderColor: "border-yellow-400/30",
        };
      case "info":
        return {
          iconColor: "text-blue-400",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          borderColor: "border-blue-400/30",
        };
      default:
        return {
          iconColor: "text-yellow-400",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          borderColor: "border-yellow-400/30",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card
        className={`bg-white/10 backdrop-blur-lg border ${styles.borderColor} shadow-2xl max-w-md w-full`}
      >
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${styles.iconColor}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg">{title}</h3>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Message */}
            <div>
              <p className="text-purple-200 leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                {cancelText}
              </Button>

              <Button onClick={onConfirm} className={styles.confirmButton}>
                {confirmText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
