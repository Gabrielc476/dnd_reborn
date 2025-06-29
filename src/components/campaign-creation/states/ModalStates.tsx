// src/components/campaign-creation/states/ModalStates.tsx
"use client";
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasUnsavedChanges: boolean;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  hasUnsavedChanges 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md mx-auto border border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-400" />
          </div>
          
          <h3 className="text-white text-xl font-bold mb-2">
            {hasUnsavedChanges ? 'Descartar Alterações?' : 'Cancelar Criação?'}
          </h3>
          
          <p className="text-gray-400 mb-6">
            {hasUnsavedChanges 
              ? 'Você tem alterações não salvas. Tem certeza que quer sair?'
              : 'Tem certeza que quer cancelar a criação da campanha?'
            }
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Continuar Editando
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {hasUnsavedChanges ? 'Descartar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
