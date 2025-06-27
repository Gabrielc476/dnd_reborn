// ===========================
// SKILLS STEP - COMPONENTE REFATORADO
// src/components/character-creation/steps/SkillsStep.tsx
// ===========================

"use client";

import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Shield, 
  CheckCircle, 
  Circle, 
  Info, 
  RotateCcw,
  Target,
  Search,
  Star,
  Zap
} from "lucide-react";
import { SKILLS, AbilityScores } from "@/types/characterCreation";
import { useState } from "react";

interface SkillCardProps {
  skillKey: string;
  skillName: string;
  ability: keyof AbilityScores;
  isSelected: boolean;
  modifier: number;
  baseModifier: number;
  proficiencyBonus: number;
  onToggle: () => void;
  canSelect: boolean;
}

function SkillCard({
  skillKey,
  skillName,
  ability,
  isSelected,
  modifier,
  baseModifier,
  proficiencyBonus,
  onToggle,
  canSelect
}: SkillCardProps) {
  const abilityColors = {
    strength: 'from-red-500 to-red-600',
    dexterity: 'from-green-500 to-green-600', 
    constitution: 'from-orange-500 to-orange-600',
    intelligence: 'from-blue-500 to-blue-600',
    wisdom: 'from-purple-500 to-purple-600',
    charisma: 'from-pink-500 to-pink-600'
  };

  const abilityAbbreviations = {
    strength: 'FOR',
    dexterity: 'DES',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'SAB',
    charisma: 'CAR'
  };

  const isDisabled = !canSelect && !isSelected;

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25 cursor-pointer hover:scale-[1.02]'
          : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 cursor-pointer hover:scale-[1.02] hover:border-gray-500/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${abilityColors[ability]} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{skillName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-lg text-gray-300 font-mono">
                  {abilityAbbreviations[ability]}
                </span>
                {isSelected && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 rounded-lg text-green-400 border border-green-500/30">
                    Proficiente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modifiers */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Modificador base:</span>
              <span className={`font-mono font-medium ${
                baseModifier >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {baseModifier >= 0 ? '+' : ''}{baseModifier}
              </span>
            </div>
            
            {isSelected && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Bônus proficiência:</span>
                <span className="text-blue-400 font-mono font-medium">
                  +{proficiencyBonus}
                </span>
              </div>
            )}
            
            <div className="border-t border-gray-600/50 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total:</span>
                <span className={`text-xl font-bold font-mono ${
                  modifier >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {modifier >= 0 ? '+' : ''}{modifier}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        <div className="ml-4 flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <Circle className={`w-6 h-6 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkillsStep() {
  const { 
    characterData, 
    updateCharacterData, 
    getAbilityModifier 
  } = useCharacterCreationContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterByAbility, setFilterByAbility] = useState<keyof AbilityScores | "all">("all");

  const handleSkillToggle = (skillKey: string) => {
    const newSelectedSkills = characterData.selectedSkills.includes(skillKey)
      ? characterData.selectedSkills.filter((s) => s !== skillKey)
      : [...characterData.selectedSkills, skillKey];

    // Respect the skill choice limit
    if (newSelectedSkills.length <= characterData.availableSkillChoices) {
      updateCharacterData({ selectedSkills: newSelectedSkills });
    }
  };

  const clearAllSkills = () => {
    updateCharacterData({ selectedSkills: [] });
  };

  const getSkillModifier = (
    ability: keyof AbilityScores,
    isSelected: boolean
  ): number => {
    const abilityMod = getAbilityModifier(characterData.abilityScores[ability]);
    const proficiencyBonus = Math.floor((characterData.level - 1) / 4) + 2;

    return abilityMod + (isSelected ? proficiencyBonus : 0);
  };

  const proficiencyBonus = Math.floor((characterData.level - 1) / 4) + 2;
  const remainingChoices = characterData.availableSkillChoices - characterData.selectedSkills.length;

  // Filter skills
  const filteredSkills = Object.entries(SKILLS).filter(([key, skill]) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAbility = filterByAbility === "all" || skill.ability === filterByAbility;
    return matchesSearch && matchesAbility;
  });

  // Group skills by ability
  const skillsByAbility = filteredSkills.reduce((acc, [key, skill]) => {
    if (!acc[skill.ability]) {
      acc[skill.ability] = [];
    }
    acc[skill.ability].push([key, skill]);
    return acc;
  }, {} as Record<keyof AbilityScores, Array<[string, any]>>);

  const abilityNames = {
    strength: 'Força',
    dexterity: 'Destreza',
    constitution: 'Constituição',
    intelligence: 'Inteligência',
    wisdom: 'Sabedoria',
    charisma: 'Carisma'
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Seleção de Perícias</h3>
              <p className="text-blue-200 text-sm mt-1">
                Escolha suas áreas de especialização
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{remainingChoices}</div>
            <div className="text-blue-400 text-sm">Restantes</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-blue-200">
            <strong>Bônus de Proficiência:</strong> +{proficiencyBonus}
          </div>
          <div className="text-sm text-blue-200">
            <strong>Selecionadas:</strong> {characterData.selectedSkills.length} / {characterData.availableSkillChoices}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar perícias..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Ability Filter */}
          <select
            value={filterByAbility}
            onChange={(e) => setFilterByAbility(e.target.value as keyof AbilityScores | "all")}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">Todos os Atributos</option>
            {Object.entries(abilityNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={clearAllSkills}
            disabled={characterData.selectedSkills.length === 0}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              characterData.selectedSkills.length === 0
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpar Seleção</span>
          </button>

          <div className="text-sm text-gray-400 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            {remainingChoices > 0 ? (
              <span>Você ainda pode escolher {remainingChoices} perícia{remainingChoices !== 1 ? 's' : ''}</span>
            ) : (
              <span>Todas as perícias foram selecionadas</span>
            )}
          </div>
        </div>
      </div>

      {/* Skills by Ability */}
      <div className="space-y-6">
        {Object.entries(skillsByAbility).map(([ability, skills]) => {
          const abilityName = abilityNames[ability as keyof AbilityScores];
          const abilityMod = getAbilityModifier(characterData.abilityScores[ability as keyof AbilityScores]);
          
          return (
            <div key={ability} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{abilityName}</h4>
                  <p className="text-gray-400 text-sm">
                    Modificador: {abilityMod >= 0 ? '+' : ''}{abilityMod}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {skills.map(([skillKey, skill]) => {
                  const isSelected = characterData.selectedSkills.includes(skillKey);
                  const canSelect = remainingChoices > 0;
                  const baseModifier = getAbilityModifier(characterData.abilityScores[skill.ability]);
                  const totalModifier = getSkillModifier(skill.ability, isSelected);

                  return (
                    <SkillCard
                      key={skillKey}
                      skillKey={skillKey}
                      skillName={skill.name}
                      ability={skill.ability}
                      isSelected={isSelected}
                      modifier={totalModifier}
                      baseModifier={baseModifier}
                      proficiencyBonus={proficiencyBonus}
                      onToggle={() => handleSkillToggle(skillKey)}
                      canSelect={canSelect}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Skills Summary */}
      {characterData.selectedSkills.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-semibold">Perícias Selecionadas</h4>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {characterData.selectedSkills.map((skillKey) => {
              const skill = SKILLS[skillKey];
              if (!skill) return null;
              
              const modifier = getSkillModifier(skill.ability, true);
              
              return (
                <div key={skillKey} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-green-300 font-medium">{skill.name}</span>
                  <span className="text-green-400 font-mono font-bold">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}