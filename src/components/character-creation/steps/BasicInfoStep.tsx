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
  Zap,
  Shield,
} from "lucide-react";

import SelectionCard from "../ui/SelectionCard";
import SearchableList from "../ui/SearchableList";
import { canHaveSubclass, getSubclassLevel } from "@/types/characterCreation";

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
    isLoadingSubclasses,
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
    getAvailableSubraces,
    getAvailableSubclasses,
    getCombinedAbilityBonuses,
    getSubclassFeatures,
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

  const handleLevelChange = (increment: boolean) => {
    const newLevel = increment
      ? Math.min(characterData.level + 1, 20)
      : Math.max(characterData.level - 1, 1);
    
    // Reset subclass if new level doesn't support it
    let updatedData: any = { level: newLevel };
    
    if (characterData.selectedClass && 
        characterData.selectedSubclass && 
        !canHaveSubclass(characterData.selectedClass.index, newLevel)) {
      updatedData.selectedSubclass = null;
    }
    
    updateCharacterData(updatedData);
  };

  // Get available subraces for the selected race
  const availableSubraces = getAvailableSubraces();
  const hasSubraces = availableSubraces.length > 0;

  // Get available subclasses for the selected class
  const availableSubclasses = getAvailableSubclasses();
  const hasSubclasses = availableSubclasses.length > 0;
  const canSelectSubclass = characterData.selectedClass && 
    canHaveSubclass(characterData.selectedClass.index, characterData.level);
  const requiredLevel = characterData.selectedClass ? 
    getSubclassLevel(characterData.selectedClass.index) : 3;

  // Get combined ability bonuses from race and subrace
  const combinedBonuses = getCombinedAbilityBonuses();

  // Get subclass features for current level
  const subclassFeatures = getSubclassFeatures();

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
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Nível</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => handleLevelChange(false)}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-10 h-10 p-0"
                disabled={characterData.level <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-white text-2xl font-bold min-w-[2rem] text-center">
                {characterData.level}
              </span>
              <Button
                onClick={() => handleLevelChange(true)}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-10 h-10 p-0"
                disabled={characterData.level >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Selection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Race Selection */}
        <div className={`xl:col-span-1 ${hasSubraces && characterData.selectedRace ? '' : ''}`}>
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <span>Raça</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isLoadingRaces ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-green-300 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-green-200 text-sm">Carregando...</p>
                  </div>
                </div>
              ) : (
                <SearchableList
                  items={races}
                  searchTerm={raceSearch}
                  onSearchChange={setRaceSearch}
                  selectedItem={characterData.selectedRace}
                  onItemSelect={(race) => {
                    updateCharacterData({ 
                      selectedRace: race,
                      selectedSubrace: null // Reset subrace when changing race
                    });
                  }}
                  renderItem={(race) => (
                    <SelectionCard
                      key={race.index}
                      title={race.name}
                      description={`Velocidade: ${race.speed} pés`}
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
                        updateCharacterData({ 
                          selectedRace: race,
                          selectedSubrace: null
                        });
                      }}
                      className="text-sm"
                    />
                  )}
                  placeholder="Buscar raças..."
                  emptyMessage="Nenhuma raça encontrada"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subrace Selection - Only show if race has subraces */}
        {hasSubraces && characterData.selectedRace ? (
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
        <div className={`xl:col-span-1 ${hasSubraces && characterData.selectedRace ? '' : ''}`}>
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Sword className="w-5 h-5 text-red-400" />
                <span>Classe</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isLoadingClasses ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-red-300 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-red-200 text-sm">Carregando...</p>
                  </div>
                </div>
              ) : (
                <SearchableList
                  items={classes}
                  searchTerm={classSearch}
                  onSearchChange={setClassSearch}
                  selectedItem={characterData.selectedClass}
                  onItemSelect={(selectedClass) => {
                    updateCharacterData({ 
                      selectedClass,
                      selectedSubclass: null // Reset subclass when changing class
                    });
                  }}
                  renderItem={(classItem) => (
                    <SelectionCard
                      key={classItem.index}
                      title={classItem.name}
                      description={`Dado de Vida: d${classItem.hit_die}`}
                      details={classItem.saving_throws
                        .map((save) => save.name)
                        .join(", ")}
                      selected={
                        characterData.selectedClass?.index === classItem.index
                      }
                      onClick={() => {
                        updateCharacterData({ 
                          selectedClass: classItem,
                          selectedSubclass: null
                        });
                      }}
                      className="text-sm"
                    />
                  )}
                  placeholder="Buscar classes..."
                  emptyMessage="Nenhuma classe encontrada"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subclass Selection - Only show if class is selected and level allows */}
        {characterData.selectedClass && (
          <div className="xl:col-span-1">
            <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Subclasse</span>
                  {!canSelectSubclass && (
                    <span className="text-xs text-purple-300 ml-2">
                      (Nível {requiredLevel}+)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {!canSelectSubclass ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Info className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                      <p className="text-purple-200 text-sm text-center">
                        Subclasses estão disponíveis a partir do nível {requiredLevel}
                      </p>
                      <p className="text-purple-300 text-xs mt-1">
                        Nível atual: {characterData.level}
                      </p>
                    </div>
                  </div>
                ) : isLoadingSubclasses ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-purple-300 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-purple-200 text-sm">Carregando...</p>
                    </div>
                  </div>
                ) : hasSubclasses ? (
                  <div className="space-y-2 h-full overflow-y-auto">
                    {availableSubclasses.map((subclass) => (
                      <SelectionCard
                        key={subclass.index}
                        title={subclass.name}
                        description={subclass.subclass_flavor}
                        details={subclass.desc[0]?.substring(0, 80) + "..."}
                        selected={
                          characterData.selectedSubclass?.index === subclass.index
                        }
                        onClick={() =>
                          updateCharacterData({ selectedSubclass: subclass })
                        }
                        className="text-xs"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Info className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                      <p className="text-purple-200 text-sm">
                        Nenhuma subclasse disponível para esta classe
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Background Selection */}
        <div className={`xl:col-span-1 ${
          !characterData.selectedClass ? 'xl:col-start-4' : ''
        }`}>
          <Card className="bg-white/5 border-white/20 h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Scroll className="w-5 h-5 text-blue-400" />
                <span>Antecedente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-2 h-full overflow-y-auto">
                {backgrounds.map((background) => (
                  <SelectionCard
                    key={background.index}
                    title={background.name}
                    description={background.feature?.name || ""}
                    details={background.feature?.desc?.[0]?.substring(0, 60) + "..."}
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

      {/* Selection Summary */}
      {(characterData.selectedRace ||
        characterData.selectedClass ||
        characterData.selectedBackground) && (
        <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-400" />
              <span>Resumo da Seleção</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {/* Character Info */}
              <div>
                <h4 className="text-purple-200 font-semibold mb-2">Personagem</h4>
                <p className="text-white">
                  <strong>Nome:</strong> {characterData.name || "Não definido"}
                </p>
                <p className="text-white">
                  <strong>Nível:</strong> {characterData.level}
                </p>
              </div>

              {/* Race Info */}
              {characterData.selectedRace && (
                <div>
                  <h4 className="text-green-200 font-semibold mb-2">Raça</h4>
                  <p className="text-white">
                    <strong>Raça:</strong> {characterData.selectedRace.name}
                  </p>
                  {characterData.selectedSubrace && (
                    <p className="text-white">
                      <strong>Subraça:</strong> {characterData.selectedSubrace.name}
                    </p>
                  )}
                  {combinedBonuses.length > 0 && (
                    <p className="text-green-300 text-xs">
                      <strong>Bônus:</strong>{" "}
                      {combinedBonuses
                        .map(
                          (bonus) =>
                            `+${bonus.bonus} ${bonus.ability_score.name}`
                        )
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Class Info */}
              {characterData.selectedClass && (
                <div>
                  <h4 className="text-red-200 font-semibold mb-2">Classe</h4>
                  <p className="text-white">
                    <strong>Classe:</strong> {characterData.selectedClass.name}
                  </p>
                  {characterData.selectedSubclass && (
                    <p className="text-white">
                      <strong>Subclasse:</strong> {characterData.selectedSubclass.name}
                    </p>
                  )}
                  {subclassFeatures.length > 0 && (
                    <p className="text-purple-300 text-xs">
                      <strong>Features:</strong> {subclassFeatures.length} habilidades
                    </p>
                  )}
                  <p className="text-red-300 text-xs">
                    <strong>Dado de Vida:</strong> d{characterData.selectedClass.hit_die}
                  </p>
                </div>
              )}

              {/* Background Info */}
              {characterData.selectedBackground && (
                <div>
                  <h4 className="text-blue-200 font-semibold mb-2">Antecedente</h4>
                  <p className="text-white">
                    <strong>Antecedente:</strong> {characterData.selectedBackground.name}
                  </p>
                  <p className="text-blue-300 text-xs">
                    <strong>Feature:</strong> {characterData.selectedBackground.feature?.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}