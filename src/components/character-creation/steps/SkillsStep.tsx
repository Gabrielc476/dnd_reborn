// ===========================
// SKILLS STEP - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/steps/SkillsStep.tsx
// ===========================

"use client";

import { useState, useMemo } from "react";
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
  Zap,
  User,
  Eye,
  Heart,
  Brain,
  Users,
  Feather,
  Sword,
  Book
} from "lucide-react";
import { SKILLS, AbilityScores } from "@/types/characterCreation";

// ===========================
// SKILL ICONS MAPPING
// ===========================

const SKILL_ICONS = {
  'acrobatics': Target,
  'animal-handling': Feather,
  'arcana': Star,
  'athletics': Zap,
  'deception': User,
  'history': Book,
  'insight': Eye,
  'intimidation': Sword,
  'investigation': Search,
  'medicine': Heart,
  'nature': Feather,
  'perception': Eye,
  'performance': Heart,
  'persuasion': Users,
  'religion': Star,
  'sleight-of-hand': Target,
  'stealth': User,
  'survival': Feather
};

// ===========================
// SKILL CARD COMPONENT
// ===========================

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
  source?: 'class' | 'background' | 'race';
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
  canSelect,
  source
}: SkillCardProps) {
  // Mapeamento de cores por habilidade
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

  const sourceColors = {
    class: 'from-purple-500/20 to-purple-600/20 border-purple-400/50',
    background: 'from-green-500/20 to-green-600/20 border-green-400/50',
    race: 'from-blue-500/20 to-blue-600/20 border-blue-400/50'
  };

  const isDisabled = !canSelect && !isSelected;
  const SkillIcon = SKILL_ICONS[skillKey as keyof typeof SKILL_ICONS] || Shield;

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? source 
            ? `bg-gradient-to-br ${sourceColors[source]} shadow-lg cursor-pointer`
            : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-400/50 shadow-lg cursor-pointer'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Skill Info */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Skill Icon */}
          <div className={`p-2 rounded-lg bg-gradient-to-br ${abilityColors[ability]}`}>
            <SkillIcon className="w-4 h-4 text-white" />
          </div>

          {/* Skill Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium transition-colors ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}>
                {skillName}
              </h3>
              
              {source && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  source === 'class' ? 'bg-purple-500/20 text-purple-300' :
                  source === 'background' ? 'bg-green-500/20 text-green-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {source === 'class' ? 'Classe' : 
                   source === 'background' ? 'Background' : 'Raça'}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${
                isSelected ? 'bg-white/10 text-gray-300' : 'bg-gray-700/50 text-gray-400'
              }`}>
                {abilityAbbreviations[ability]}
              </span>
              
              {isSelected && (
                <span className="text-xs text-gray-400">
                  Prof. +{proficiencyBonus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modifier & Status */}
        <div className="flex items-center space-x-3">
          {/* Modifier Display */}
          <div className="text-right">
            <div className={`text-lg font-bold ${
              isSelected ? 'text-white' : 'text-gray-400'
            }`}>
              {modifier >= 0 ? '+' : ''}{modifier}
            </div>
            {isSelected && baseModifier !== modifier && (
              <div className="text-xs text-gray-500">
                {baseModifier >= 0 ? '+' : ''}{baseModifier} base
              </div>
            )}
          </div>

          {/* Selection Status */}
          <div>
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function SkillsStep() {
  const {
    // Character data via context
    characterData,
    toggleSkill,
    calculateModifier,
    
    // Skills específicos (através do contexto compatível)
    // Nota: O contexto mapeia os dados dos hooks para a interface antiga
  } = useCharacterCreationContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterByAbility, setFilterByAbility] = useState<keyof AbilityScores | 'all'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  // Proficiency bonus baseado no nível
  const proficiencyBonus = Math.ceil(characterData.level / 4) + 1;

  // Skills selecionadas
  const selectedSkills = characterData.selectedSkills || [];

  // Skills disponíveis para escolha (da classe)
  const availableSkillChoices = characterData.availableSkillChoices || 0;

  // Choices restantes
  const remainingChoices = availableSkillChoices - selectedSkills.length;

  // Filtered skills
  const filteredSkills = useMemo(() => {
    let filtered = SKILLS;

    // Filtrar por busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por habilidade
    if (filterByAbility !== 'all') {
      filtered = filtered.filter(skill => skill.ability === filterByAbility);
    }

    // Filtrar apenas disponíveis
    if (showOnlyAvailable) {
      filtered = filtered.filter(skill => 
        selectedSkills.includes(skill.key) || remainingChoices > 0
      );
    }

    return filtered;
  }, [searchTerm, filterByAbility, showOnlyAvailable, selectedSkills, remainingChoices]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleToggleSkill = (skillKey: string) => {
    toggleSkill(skillKey);
  };

  const canSelectSkill = (skillKey: string): boolean => {
    // Se já está selecionada, sempre pode desmarcar
    if (selectedSkills.includes(skillKey)) return true;
    
    // Se não tem choices restantes, não pode selecionar
    if (remainingChoices <= 0) return false;
    
    return true;
  };

  const getSkillModifier = (skill: typeof SKILLS[0]): number => {
    const abilityScore = characterData.abilityScores[skill.ability];
    const baseModifier = calculateModifier(abilityScore);
    
    // Se tem proficiência, adiciona bonus
    if (selectedSkills.includes(skill.key)) {
      return baseModifier + proficiencyBonus;
    }
    
    return baseModifier;
  };

  const getBaseModifier = (skill: typeof SKILLS[0]): number => {
    const abilityScore = characterData.abilityScores[skill.ability];
    return calculateModifier(abilityScore);
  };

  // Determinar fonte da skill (se aplicável)
  const getSkillSource = (skillKey: string): 'class' | 'background' | 'race' | undefined => {
    // Aqui você pode implementar lógica para determinar a fonte
    // Por enquanto, vamos assumir que todas são da classe
    return selectedSkills.includes(skillKey) ? 'class' : undefined;
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-6">
      {/* Header com informações */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Perícias e Proficiências</h3>
            <p className="text-sm text-gray-400 mt-1">
              Escolha as perícias nas quais seu personagem é proficiente
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {remainingChoices}
            </div>
            <div className="text-sm text-gray-500">restantes</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${availableSkillChoices > 0 ? ((availableSkillChoices - remainingChoices) / availableSkillChoices) * 100 : 0}%` 
            }}
          />
        </div>

        {/* Info adicional */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Proficiências da Classe:</span>
            <span className="text-white">{availableSkillChoices}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bônus de Proficiência:</span>
            <span className="text-white">+{proficiencyBonus}</span>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar perícias..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro por habilidade */}
          <select
            value={filterByAbility}
            onChange={(e) => setFilterByAbility(e.target.value as keyof AbilityScores | 'all')}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Todas as habilidades</option>
            <option value="strength">Força</option>
            <option value="dexterity">Destreza</option>
            <option value="constitution">Constituição</option>
            <option value="intelligence">Inteligência</option>
            <option value="wisdom">Sabedoria</option>
            <option value="charisma">Carisma</option>
          </select>

          {/* Toggle apenas disponíveis */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
            />
            <span className="text-sm text-gray-300">Apenas disponíveis</span>
          </label>

          {/* Info sobre choices */}
          {remainingChoices <= 0 && availableSkillChoices > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <Info className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">
                Você usou todas as suas escolhas de perícia
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Skills */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.key);
          const modifier = getSkillModifier(skill);
          const baseModifier = getBaseModifier(skill);
          const source = getSkillSource(skill.key);
          
          return (
            <SkillCard
              key={skill.key}
              skillKey={skill.key}
              skillName={skill.name}
              ability={skill.ability}
              isSelected={isSelected}
              modifier={modifier}
              baseModifier={baseModifier}
              proficiencyBonus={proficiencyBonus}
              onToggle={() => handleToggleSkill(skill.key)}
              canSelect={canSelectSkill(skill.key)}
              source={source}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhuma perícia encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterByAbility('all');
              setShowOnlyAvailable(false);
            }}
            className="mt-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Summary */}
      {selectedSkills.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Resumo das Perícias Selecionadas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedSkills.map(skillKey => {
              const skill = SKILLS.find(s => s.key === skillKey);
              if (!skill) return null;
              
              const modifier = getSkillModifier(skill);
              
              return (
                <div key={skillKey} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">{skill.name}</span>
                  <span className="text-white font-medium">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Skills */}
          <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between">
            <span className="text-gray-400">Total de perícias proficientes:</span>
            <span className="text-blue-400 font-semibold">{selectedSkills.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}