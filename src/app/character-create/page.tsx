"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuth";
import { CharacterCreationProvider, useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dice6, ArrowLeft, Save, Sparkles, CheckCircle, Circle, AlertTriangle, User, Zap, Target, Sword, Heart } from "lucide-react";

// Character Creation Components - usando os existentes
import CharacterCreationWizard from "@/components/character-creation/CharacterCreationWizard";

const STEP_ICONS = [User, Zap, Target, Sword, Sparkles, Heart];

function ImprovedCharacterCreationPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  
  const {
    currentStep,
    steps,
    goToStep,
    characterData,
    loading,
    error,
    canProceed,
    nextStep,
    previousStep,
    createCharacter,
    getCombinedAbilityBonuses,
  } = useCharacterCreationContext();

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

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const combinedBonuses = getCombinedAbilityBonuses();

  const getStepStatusIcon = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (stepIndex === currentStep) {
      return <Circle className="w-4 h-4 text-purple-400 fill-current" />;
    } else if (!step.isValid && stepIndex < currentStep) {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    } else {
      return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      createCharacter();
    } else {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Compact Header */}
      <div className="bg-black/20 border-b border-white/10 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation + Title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-white/10 transition-colors"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              
              <div className="h-6 w-px bg-white/20"></div>
              
              <div className="flex items-center space-x-3">
                <Dice6 className="w-6 h-6 text-purple-400" />
                <div>
                  <h1 className="text-lg font-bold text-white">Criar Personagem</h1>
                  <p className="text-purple-200 text-xs">{steps[currentStep]?.title}</p>
                </div>
              </div>
            </div>

            {/* Center: Horizontal Progress */}
            <div className="hidden lg:flex items-center space-x-2">
              {steps.map((step, index) => {
                const StepIcon = STEP_ICONS[index];
                const isActive = index === currentStep;
                const isCompleted = step.isCompleted;
                const canClick = index <= currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => canClick && goToStep(index)}
                      disabled={!canClick}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-purple-500/30 border border-purple-400/50 text-white' 
                          : isCompleted 
                          ? 'bg-green-500/20 border border-green-400/30 text-green-200 hover:bg-green-500/30' 
                          : canClick
                          ? 'bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10'
                          : 'bg-gray-800/20 border border-gray-600/20 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <StepIcon className="w-4 h-4" />
                      <span className="text-xs font-medium hidden xl:block">{step.title}</span>
                      {getStepStatusIcon(index)}
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-white/20 mx-1"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={previousStep}
                  size="sm"
                  className="bg-white/5 hover:bg-white/10 border-white/20 text-white"
                >
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : isLastStep ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <span>Próximo</span>
                )}
                {loading ? "Criando..." : isLastStep ? "Criar" : `(${currentStep + 2}/${steps.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-4">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Step Content */}
            <CharacterCreationWizard />
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Mobile Progress (only on mobile) */}
            <div className="lg:hidden">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Progresso</span>
                    <span className="text-white font-medium">
                      {currentStep + 1} de {steps.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Character Summary */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Resumo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-200 uppercase tracking-wide">Nome</p>
                    <p className="text-white font-medium">
                      {characterData.name || "Sem nome"}
                    </p>
                  </div>

                  {characterData.selectedRace && (
                    <div>
                      <p className="text-xs text-purple-200 uppercase tracking-wide">Raça</p>
                      <div className="space-y-1">
                        <p className="text-white font-medium">
                          {characterData.selectedRace.name}
                        </p>
                        {characterData.selectedSubrace && (
                          <p className="text-amber-200 text-sm">
                            {characterData.selectedSubrace.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {characterData.selectedClass && (
                    <div>
                      <p className="text-xs text-purple-200 uppercase tracking-wide">Classe</p>
                      <p className="text-white font-medium">
                        {characterData.selectedClass.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-purple-200 uppercase tracking-wide">Nível</p>
                    <p className="text-white font-medium">{characterData.level}</p>
                  </div>
                </div>

                {/* Stats */}
                {(characterData.hitPoints > 0 || characterData.armorClass > 10) && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      {characterData.hitPoints > 0 && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-red-400">
                            {characterData.hitPoints}
                          </div>
                          <div className="text-xs text-red-200">HP</div>
                        </div>
                      )}
                      
                      {characterData.armorClass > 10 && (
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-blue-400">
                            {characterData.armorClass}
                          </div>
                          <div className="text-xs text-blue-200">CA</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Racial Bonuses */}
                {combinedBonuses.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-purple-200 uppercase tracking-wide mb-2">Bônus Raciais</p>
                    <div className="space-y-1">
                      {combinedBonuses.map((bonus, index) => (
                        <div key={index} className="text-xs text-green-300">
                          +{bonus.bonus} {bonus.ability_score.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spellcaster Info */}
                {characterData.isSpellcaster && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 text-center">
                      <p className="text-purple-200 text-xs">Conjurador</p>
                      <p className="text-white font-medium">
                        {characterData.selectedSpells.length} magias
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-blue-500/10 border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Dica</p>
                    <p className="text-blue-100 text-xs">
                      {currentStep === 0 && "Escolha uma combinação de raça e classe que combine bem. Considere os bônus raciais!"}
                      {currentStep === 1 && "Distribua os atributos pensando na sua classe. Priorize o atributo principal!"}
                      {currentStep === 2 && "Escolha perícias que complementem seu estilo de jogo e background."}
                      {currentStep === 3 && "Os PV e CA são calculados automaticamente, mas você pode ajustar conforme necessário."}
                      {currentStep === 4 && "Escolha magias que sejam úteis tanto em combate quanto fora dele."}
                      {currentStep === 5 && "Adicione personalidade ao seu personagem. Isso facilita a interpretação!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateCharacterPage() {
  return (
    <CharacterCreationProvider>
      <ImprovedCharacterCreationPage />
    </CharacterCreationProvider>
  );
}