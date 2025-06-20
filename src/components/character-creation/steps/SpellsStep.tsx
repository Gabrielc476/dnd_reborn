"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Star,
  Plus,
  Minus,
  CheckCircle,
  Circle,
  Zap,
  Shield,
  Flame,
  Info,
  RotateCcw,
} from "lucide-react";
import SearchableList from "../ui/SearchableList";

const SPELL_SCHOOL_ICONS: Record<string, any> = {
  abjuration: Shield,
  conjuration: Plus,
  divination: Star,
  enchantment: Sparkles,
  evocation: Flame,
  illusion: Circle,
  necromancy: Minus,
  transmutation: RotateCcw,
};

const SPELL_SCHOOL_COLORS: Record<string, string> = {
  abjuration: "text-blue-400",
  conjuration: "text-green-400",
  divination: "text-yellow-400",
  enchantment: "text-pink-400",
  evocation: "text-red-400",
  illusion: "text-purple-400",
  necromancy: "text-gray-400",
  transmutation: "text-orange-400",
};

export default function SpellsStep() {
  const {
    characterData,
    updateCharacterData,
    spells,
    isLoadingSpells,
    spellSearch,
    setSpellSearch,
    getAbilityModifier,
  } = useCharacterCreationContext();

  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  // If not a spellcaster, show a different UI
  if (!characterData.isSpellcaster) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Magias</h2>
          <p className="text-purple-200">
            Configure as magias do seu personagem
          </p>
        </div>

        <Card className="bg-blue-500/20 border-blue-400/30">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Não é um Conjurador
            </h3>
            <p className="text-blue-200">
              {characterData.selectedClass?.name || "Sua classe"} não possui
              habilidades mágicas no nível 1. Você pode prosseguir para o
              próximo passo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spellcastingAbility = characterData.spellcastingAbility;
  const spellcastingMod = spellcastingAbility
    ? getAbilityModifier(
        characterData.abilityScores[
          spellcastingAbility as keyof typeof characterData.abilityScores
        ]
      )
    : 0;
  const proficiencyBonus = Math.floor((characterData.level - 1) / 4) + 2;
  const spellAttackBonus = spellcastingMod + proficiencyBonus;
  const spellSaveDC = 8 + spellcastingMod + proficiencyBonus;

  // Filter spells
  const filteredSpells = spells.filter((spell) => {
    const levelMatch = selectedLevel === 0 || spell.level === selectedLevel;
    const schoolMatch =
      !selectedSchool || spell.school.index === selectedSchool;
    const searchMatch =
      !spellSearch ||
      spell.name.toLowerCase().includes(spellSearch.toLowerCase()) ||
      spell.desc.some((d) =>
        d.toLowerCase().includes(spellSearch.toLowerCase())
      );

    return levelMatch && schoolMatch && searchMatch;
  });

  const handleSpellToggle = (spellIndex: string) => {
    const spell = spells.find((s) => s.index === spellIndex);
    if (!spell) return;

    const isSelected = characterData.selectedSpells.some(
      (s) => s.index === spellIndex
    );

    if (isSelected) {
      updateCharacterData({
        selectedSpells: characterData.selectedSpells.filter(
          (s) => s.index !== spellIndex
        ),
      });
    } else {
      updateCharacterData({
        selectedSpells: [...characterData.selectedSpells, spell],
      });
    }
  };

  const clearAllSpells = () => {
    updateCharacterData({ selectedSpells: [] });
  };

  const getSpellSchoolIcon = (school: string) => {
    const IconComponent = SPELL_SCHOOL_ICONS[school] || Circle;
    return IconComponent;
  };

  const uniqueSchools = Array.from(new Set(spells.map((s) => s.school.index)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Magias</h2>
        <p className="text-purple-200">
          Escolha as magias que seu personagem conhece
        </p>
      </div>

      {/* Spellcasting Stats */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {spellcastingAbility?.toUpperCase() || "N/A"}
                </div>
                <div className="text-purple-200 text-sm">
                  Atributo de Conjuração
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">
                  +{spellAttackBonus}
                </div>
                <div className="text-red-200 text-sm">Bônus de Ataque</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {spellSaveDC}
                </div>
                <div className="text-blue-200 text-sm">CD de Resistência</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Spells Count */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-semibold">
                Magias Selecionadas: {characterData.selectedSpells.length}
              </Label>
              <p className="text-purple-200 text-sm">
                Escolha as magias que seu personagem conhece inicialmente
              </p>
            </div>

            {characterData.selectedSpells.length > 0 && (
              <Button
                onClick={clearAllSpells}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar Todas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6 space-y-4">
          <Label className="text-white font-semibold">Filtros</Label>

          {/* Search */}
          <SearchableList
            searchValue={spellSearch}
            onSearchChange={setSpellSearch}
            placeholder="Buscar magias..."
            loading={isLoadingSpells}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Filter */}
            <div>
              <Label className="text-white text-sm mb-2 block">Nível</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedLevel === 0 ? "default" : "outline"}
                  onClick={() => setSelectedLevel(0)}
                  className="text-xs"
                >
                  Todos
                </Button>
                {[0, 1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={selectedLevel === level ? "default" : "outline"}
                    onClick={() => setSelectedLevel(level)}
                    className="text-xs"
                  >
                    {level === 0 ? "Truque" : `Nível ${level}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* School Filter */}
            <div>
              <Label className="text-white text-sm mb-2 block">Escola</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSchool === null ? "default" : "outline"}
                  onClick={() => setSelectedSchool(null)}
                  className="text-xs"
                >
                  Todas
                </Button>
                {uniqueSchools.slice(0, 4).map((school) => (
                  <Button
                    key={school}
                    size="sm"
                    variant={selectedSchool === school ? "default" : "outline"}
                    onClick={() => setSelectedSchool(school)}
                    className="text-xs capitalize"
                  >
                    {school}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spells List */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Magias Disponíveis ({filteredSpells.length})
            </Label>

            {isLoadingSpells ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-purple-300 border-t-white rounded-full animate-spin mx-auto"></div>
                <p className="text-purple-200 mt-2">Carregando magias...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredSpells.map((spell) => {
                  const isSelected = characterData.selectedSpells.some(
                    (s) => s.index === spell.index
                  );
                  const SchoolIcon = getSpellSchoolIcon(spell.school.index);
                  const schoolColor =
                    SPELL_SCHOOL_COLORS[spell.school.index] || "text-gray-400";

                  return (
                    <div
                      key={spell.index}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? "bg-purple-500/20 border-purple-400/50"
                            : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
                        }
                      `}
                      onClick={() => handleSpellToggle(spell.index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {isSelected ? (
                              <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <h4 className="text-white font-medium text-sm truncate">
                              {spell.name}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xs px-2 py-1 bg-black/30 rounded text-gray-300">
                              {spell.level === 0
                                ? "Truque"
                                : `Nível ${spell.level}`}
                            </span>
                            <div className="flex items-center space-x-1">
                              <SchoolIcon
                                className={`w-4 h-4 ${schoolColor}`}
                              />
                              <span
                                className={`text-xs capitalize ${schoolColor}`}
                              >
                                {spell.school.name}
                              </span>
                            </div>
                          </div>

                          <p className="text-purple-200 text-xs line-clamp-2">
                            {spell.desc[0]?.substring(0, 100)}...
                          </p>

                          <div className="mt-2 text-xs text-gray-400">
                            <span>{spell.casting_time}</span> •{" "}
                            <span>{spell.range}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Starting Spells Info */}
      <Card className="bg-blue-500/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-200 font-semibold text-sm">
                Magias Iniciais
              </h4>
              <p className="text-blue-100 text-sm mt-1">
                A quantidade de magias que você conhece depende da sua classe.
                Magos começam com 6 magias de 1º nível no grimório, enquanto
                feiticeiros conhecem 4 truques e 2 magias de 1º nível. Consulte
                sua classe para detalhes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
