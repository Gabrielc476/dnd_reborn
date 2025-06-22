"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  User,
  Users,
  Sword,
  Scroll,
  ChevronDown,
  ChevronUp,
  Dice6,
  Crown,
  Info,
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

  const [expandedSections, setExpandedSections] = useState({
    race: true,
    subrace: true,
    class: true,
    background: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCharacterData({ name: e.target.value });
  };

  const generateRandomName = () => {
    const names = [
      "Aerdrie",
      "Baelynn",
      "Caelynn",
      "Darathra",
      "Enna",
      "Faenor",
      "Galinndan",
      "Halimath",
      "Immeral",
      "Jalynfein",
      "Kelvhan",
      "Lamlis",
      "Mindartis",
      "Nutae",
      "Otaehryn",
      "Peren",
      "Quarion",
      "Riardon",
      "Silvyr",
      "Thamior",
      "Uszala",
      "Vanuath",
      "Varis",
      "Wistari",
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    updateCharacterData({ name: randomName });
  };

  // Get available subraces for the selected race
  const availableSubraces = getAvailableSubraces();
  const hasSubraces = availableSubraces.length > 0;

  // Get combined ability bonuses from race and subrace
  const combinedBonuses = getCombinedAbilityBonuses();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Informações Básicas</h2>
        <p className="text-purple-200">
          Defina o nome e as características fundamentais do seu personagem
        </p>
      </div>

      {/* Character Name */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Nome do Personagem
            </Label>
            <div className="flex space-x-2">
              <Input
                value={characterData.name}
                onChange={handleNameChange}
                placeholder="Digite o nome do seu herói..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70"
              />
              <Button
                onClick={generateRandomName}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Dice6 className="w-4 h-4 mr-2" />
                Aleatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("race")}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <Label className="text-white text-lg font-semibold">Raça</Label>
              </div>
              {expandedSections.race ? (
                <ChevronUp className="w-5 h-5 text-purple-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-purple-400" />
              )}
            </div>

            {expandedSections.race && (
              <div className="space-y-4">
                <SearchableList
                  searchValue={raceSearch}
                  onSearchChange={setRaceSearch}
                  placeholder="Buscar raças..."
                  loading={isLoadingRaces}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {races.map((race) => (
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
                        updateCharacterData({ selectedRace: race });
                        // Reset subrace when race changes
                        if (characterData.selectedSubrace) {
                          updateCharacterData({ selectedSubrace: null });
                        }
                      }}
                      badge={
                        race.subraces.length > 0 ? "Com Subraças" : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subrace Selection - Only show if race has subraces */}
      {characterData.selectedRace && hasSubraces && (
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("subrace")}
              >
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <Label className="text-white text-lg font-semibold">
                    Subraça de {characterData.selectedRace.name}
                  </Label>
                </div>
                {expandedSections.subrace ? (
                  <ChevronUp className="w-5 h-5 text-amber-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-400" />
                )}
              </div>

              {expandedSections.subrace && (
                <div className="space-y-4">
                  {isLoadingSubraces ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-amber-300 border-t-white rounded-full animate-spin mx-auto"></div>
                      <p className="text-amber-200 text-sm mt-2">
                        Carregando subraças...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableSubraces.map((subrace) => (
                        <SelectionCard
                          key={subrace.index}
                          title={subrace.name}
                          description={subrace.desc.substring(0, 100) + "..."}
                          details={subrace.ability_bonuses
                            .map(
                              (bonus) =>
                                `+${bonus.bonus} ${bonus.ability_score.name}`
                            )
                            .join(", ")}
                          selected={
                            characterData.selectedSubrace?.index ===
                            subrace.index
                          }
                          onClick={() =>
                            updateCharacterData({ selectedSubrace: subrace })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combined Racial Bonuses Info */}
      {combinedBonuses.length > 0 && (
        <Card className="bg-green-500/10 border-green-400/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-green-200 font-semibold text-sm">
                  Bônus Raciais Totais
                </h4>
                <p className="text-green-100 text-sm">
                  {combinedBonuses
                    .map(
                      (bonus) => `+${bonus.bonus} ${bonus.ability_score.name}`
                    )
                    .join(", ")}
                </p>
                {characterData.selectedSubrace && (
                  <p className="text-green-100 text-xs mt-1">
                    Inclui bônus de {characterData.selectedRace?.name} e{" "}
                    {characterData.selectedSubrace.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("class")}
            >
              <div className="flex items-center space-x-2">
                <Sword className="w-5 h-5 text-red-400" />
                <Label className="text-white text-lg font-semibold">
                  Classe
                </Label>
              </div>
              {expandedSections.class ? (
                <ChevronUp className="w-5 h-5 text-red-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-red-400" />
              )}
            </div>

            {expandedSections.class && (
              <div className="space-y-4">
                <SearchableList
                  searchValue={classSearch}
                  onSearchChange={setClassSearch}
                  placeholder="Buscar classes..."
                  loading={isLoadingClasses}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {classes.map((characterClass) => (
                    <SelectionCard
                      key={characterClass.index}
                      title={characterClass.name}
                      description={`Dado de Vida: d${characterClass.hit_die}`}
                      details={characterClass.saving_throws
                        .map((save) => save.name)
                        .join(", ")}
                      selected={
                        characterData.selectedClass?.index ===
                        characterClass.index
                      }
                      onClick={() =>
                        updateCharacterData({ selectedClass: characterClass })
                      }
                      badge={
                        characterClass.spellcasting ? "Conjurador" : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Background Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("background")}
            >
              <div className="flex items-center space-x-2">
                <Scroll className="w-5 h-5 text-green-400" />
                <Label className="text-white text-lg font-semibold">
                  Background
                </Label>
              </div>
              {expandedSections.background ? (
                <ChevronUp className="w-5 h-5 text-green-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-green-400" />
              )}
            </div>

            {expandedSections.background && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {backgrounds.map((background) => (
                  <SelectionCard
                    key={background.index}
                    title={background.name}
                    description={
                      background.feature?.name || "Background personalizado"
                    }
                    details={
                      background.feature?.desc?.[0]?.substring(0, 100) +
                        "..." || ""
                    }
                    selected={
                      characterData.selectedBackground?.index ===
                      background.index
                    }
                    onClick={() =>
                      updateCharacterData({ selectedBackground: background })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Nível Inicial
            </Label>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() =>
                  updateCharacterData({
                    level: Math.max(1, characterData.level - 1),
                  })
                }
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={characterData.level <= 1}
              >
                -
              </Button>
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2">
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
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={characterData.level >= 20}
              >
                +
              </Button>
            </div>
            <p className="text-purple-200 text-sm">
              Recomendamos começar no nível 1 para campanhas novas
            </p>
          </div>
        </CardContent>
      </Card>

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
  );
}
