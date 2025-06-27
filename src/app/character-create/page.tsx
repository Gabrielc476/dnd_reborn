// ===========================
// CHARACTER CREATION PAGE - COMPONENTE REFATORADO
// src/app/character-create/page.tsx
// ===========================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuth";
import { CharacterCreationProvider } from "@/hooks/useCharacterCreation";
import { Wand2, AlertTriangle } from "lucide-react";

// Character Creation Components
import CharacterCreationWizard from "@/components/character-creation/CharacterCreationWizard";

export default function CharacterCreatePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Verificando Acesso</h2>
              <p className="text-gray-400 text-lg">Preparando a experiência de criação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/25">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Acesso Necessário</h2>
            <p className="text-gray-400 text-lg">
              Você precisa estar logado para criar personagens
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handler para quando o personagem for criado com sucesso
  const handleCharacterComplete = (characterData: any) => {
    console.log("✅ Personagem criado com sucesso:", characterData);
    
    // Pode redirecionar para a página de personagens ou mostrar sucesso
    router.push("/characters");
  };

  // Handler para cancelar a criação
  const handleCancel = () => {
    router.push("/characters");
  };

  return (
    <CharacterCreationProvider>
      <CharacterCreationWizard 
        onComplete={handleCharacterComplete}
        onCancel={handleCancel}
      />
    </CharacterCreationProvider>
  );
}