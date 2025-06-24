"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Users,
  Sword,
  Scroll,
  Dice6,
  Crown,
  Info,
  Plus,
  Minus,
} from "lucide-react";

import SelectionCard from "../ui/SelectionCard";
import SearchableList from "../ui/SearchableList";

export default function BasicInfoStep() {
  const {
    characterData,
    updateCharacterData,
    races,
    classes,
    backgrounds,
    isLoadingRaces,
    isLoadingClasses,
    isLoadingSubraces,
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
    getAvailableSubraces,
    getCombinedAbilityBonuses,
  } = useCharacterCreationContext();

  const generateRandomName = () => {
    const names = [
      "Aerdrie", "Baelynn", "Caelynn", "Darathra", "Enna", "Faenor",
      "Galinndan", "Halimath", "Immeral", "Jalynfein", "Kelvhan", "Lamlis",
      "Mindartis", "Nutae", "Otaehryn", "Peren", "Quarion", "Riardon",
      "Silvyr", "Thamior", "Uszala", "Vanuath", "Varis", "Wistari",
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    updateCharacterData({ name: randomName });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCharacterData({ name: e.target.value });
  };

  // Get available subraces for the selected race
  const availableSubraces = getAvailableSubraces();
  const hasSubraces = availableSubraces.length > 0;

  // Get combined ability bonuses from race and subrace
  const combinedBonuses = getCombinedAbilityBonuses();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Informações Básicas</h2>
        <p className="text-purple-200">
          Defina o nome e as características fundamentais do seu personagem
        </p>
      </div>

      {/* Top Row: Name and Level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Character Name */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/20 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-400" />
                <span>Nome do Personagem</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Input
                value={characterData.name}
                onChange={handleNameChange}
                placeholder="Digite o nome do seu herói..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70 text-lg"
              />
              <Button
                onClick={generateRandomName}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-3"
              >
                <Dice6 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Level Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-white/20 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg text-center">Nível Inicial</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center space-x-3">
              <Button
                onClick={() =>
                  updateCharacterData({
                    level: Math.max(1, characterData.level - 1),
                  })
                }
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-8 h-8 p-0"
                disabled={characterData.level <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 min-w-[60px] text-center">
                <span className="text-2xl font-bold text-white">
                  {characterData.level}
                </span>
              </div>
              <Button
                onClick={() =>
                  updateCharacterData({
                    level: Math.min(20, characterData.level + 1),
                  })
                }
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-8 h-8 p-0"
                disabled={characterData.level >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Selection Grid - 4 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Race Selection */}
        <div className="xl:col-span-1">
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Raça</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden">
              <SearchableList
                searchValue={raceSearch}
                onSearchChange={setRaceSearch}
                placeholder="Buscar raças..."
                loading={isLoadingRaces}
              />

              <div className="flex-1 space-y-2 overflow-y-auto">
                {races.map((race) => (
                  <SelectionCard
                    key={race.index}
                    title={race.name}
                    description={`${race.speed} pés • ${race.size}`}
                    details={race.ability_bonuses
                      .map(
                        (bonus) =>
                          `+${bonus.bonus} ${bonus.ability_score.name}`
                      )
                      .join(", ")}
                    selected={
                      characterData.selectedRace?.index === race.index
                    }
                    onClick={() => {
                      updateCharacterData({ selectedRace: race });
                      // Reset subrace when race changes
                      if (characterData.selectedSubrace) {
                        updateCharacterData({ selectedSubrace: null });
                      }
                    }}
                    badge={
                      race.subraces.length > 0 ? "Subraças" : undefined
                    }
                    className="text-xs"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subrace Selection - Only show if race has subraces */}
        {characterData.selectedRace && hasSubraces ? (
          <div className="xl:col-span-1">
            <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Subraça</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {isLoadingSubraces ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-amber-300 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-amber-200 text-sm">Carregando...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 h-full overflow-y-auto">
                    {availableSubraces.map((subrace) => (
                      <SelectionCard
                        key={subrace.index}
                        title={subrace.name}
                        description={subrace.desc.substring(0, 60) + "..."}
                        details={subrace.ability_bonuses
                          .map(
                            (bonus) =>
                              `+${bonus.bonus} ${bonus.ability_score.name}`
                          )
                          .join(", ")}
                        selected={
                          characterData.selectedSubrace?.index === subrace.index
                        }
                        onClick={() =>
                          updateCharacterData({ selectedSubrace: subrace })
                        }
                        className="text-xs"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Class Selection */}
        <div className={`xl:col-span-1 ${hasSubraces && characterData.selectedRace ? '' : 'xl:col-span-2'}`}>
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Sword className="w-5 h-5 text-red-400" />
                <span>Classe</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden">
              <SearchableList
                searchValue={classSearch}
                onSearchChange={setClassSearch}
                placeholder="Buscar classes..."
                loading={isLoadingClasses}
              />

              <div className="flex-1 space-y-2 overflow-y-auto">
                {classes.map((characterClass) => (
                  <SelectionCard
                    key={characterClass.index}
                    title={characterClass.name}
                    description={`Dado de Vida: d${characterClass.hit_die}`}
                    details={characterClass.saving_throws
                      .map((save) => save.name)
                      .join(", ")}
                    selected={
                      characterData.selectedClass?.index === characterClass.index
                    }
                    onClick={() =>
                      updateCharacterData({ selectedClass: characterClass })
                    }
                    badge={
                      characterClass.spellcasting ? "Conjurador" : undefined
                    }
                    className="text-xs"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Selection */}
        <div className="xl:col-span-1">
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Scroll className="w-5 h-5 text-green-400" />
                <span>Background</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-2 h-full overflow-y-auto">
                {backgrounds.map((background) => (
                  <SelectionCard
                    key={background.index}
                    title={background.name}
                    description={background.feature?.name || "Personalizado"}
                    details={
                      background.feature?.desc?.[0]?.substring(0, 60) + "..." || ""
                    }
                    selected={
                      characterData.selectedBackground?.index === background.index
                    }
                    onClick={() =>
                      updateCharacterData({ selectedBackground: background })
                    }
                    className="text-xs"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Combined Bonuses and Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Racial Bonuses Info */}
        {combinedBonuses.length > 0 && (
          <Card className="bg-green-500/10 border-green-400/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-200 text-lg flex items-center space-x-2">
                <Info className="w-5 h-5 text-green-400" />
                <span>Bônus Raciais Totais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {characterData.selectedRace && (
                  <div>
                    <p className="text-green-200 font-medium text-sm">
                      {characterData.selectedRace.name}:
                    </p>
                    <p className="text-green-100 text-sm">
                      {characterData.selectedRace.ability_bonuses
                        .map(
                          (bonus) =>
                            `+${bonus.bonus} ${bonus.ability_score.name}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}
                {characterData.selectedSubrace && (
                  <div>
                    <p className="text-green-200 font-medium text-sm">
                      {characterData.selectedSubrace.name}:
                    </p>
                    <p className="text-green-100 text-sm">
                      {characterData.selectedSubrace.ability_bonuses
                        .map(
                          (bonus) =>
                            `+${bonus.bonus} ${bonus.ability_score.name}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-green-400/20">
                <p className="text-green-200 font-medium text-sm">Total Combinado:</p>
                <p className="text-green-100 text-sm font-bold">
                  {combinedBonuses
                    .map(
                      (bonus) => `+${bonus.bonus} ${bonus.ability_score.name}`
                    )
                    .join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subrace Requirements Warning */}
        {characterData.selectedRace &&
          characterData.selectedRace.subraces.length > 0 &&
          !characterData.selectedSubrace && (
            <Card className="bg-yellow-500/10 border-yellow-400/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-200 font-semibold text-sm">
                      Subraça Necessária
                    </h4>
                    <p className="text-yellow-100 text-sm">
                      A raça {characterData.selectedRace.name} possui subraças.
                      Você deve escolher uma subraça para continuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}