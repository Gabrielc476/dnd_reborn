"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuth";
import { CharacterCreationProvider } from "@/hooks/useCharacterCreation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dice6, ArrowLeft, Save, Sparkles } from "lucide-react";

// Character Creation Components
import CharacterCreationWizard from "@/components/character-creation/CharacterCreationWizard";
import CharacterCreationProgress from "@/components/character-creation/CharacterCreationProgress";

export default function CreateCharacterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-purple-200">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CharacterCreationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        {/* Header */}
        <div className="bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Button>

                <div className="h-8 w-px bg-white/20"></div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <Dice6 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Criar Novo Personagem
                    </h1>
                    <p className="text-purple-200 text-sm">
                      Configure seu herói para novas aventuras épicas
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-purple-300 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Criação Guiada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-8">
                <CharacterCreationProgress />
              </div>
            </div>

            {/* Creation Wizard */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <CharacterCreationWizard />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between text-sm">
              <p className="text-purple-300">
                💡 Dica: Você pode voltar aos passos anteriores a qualquer
                momento para fazer ajustes
              </p>
              <div className="flex items-center space-x-4 text-purple-400">
                <span>✨ D&D Manager</span>
                <span>•</span>
                <span>Criação de Personagens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CharacterCreationProvider>
  );
}
