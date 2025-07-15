// ===========================
// SkillsStep.tsx - CORRIGIDO
// Componente da etapa de seleção de perícias
// ===========================

import React, { useState, useMemo } from 'react';
import { Search, Info, CheckCircle, Circle } from 'lucide-react';
import { useCharacterCreationContext } from '@/hooks/useCharacterCreation';
import { SKILLS, AbilityScores } from '@/types/characterCreation';

// ===========================
// INTERFACES
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

// ===========================
// SKILL CARD COMPONENT
// ===========================

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
  source,
}: SkillCardProps) {
  const isFromBackground = source === 'background';
  
  return (
    <div 
      className={`
        p-4 rounded-xl border transition-all duration-200 
        ${isSelected 
          ? isFromBackground
            ? 'bg-purple-500/20 border-purple-500/50 ring-1 ring-purple-500/30' // Background
            : 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'     // Classe
          : canSelect 
            ? 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-700/20 cursor-pointer'
            : 'bg-gray-800/10 border-gray-700/30 opacity-50 cursor-not-allowed'
        }
      `}
      onClick={canSelect ? onToggle : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className={`font-medium ${
              isSelected 
                ? isFromBackground 
                  ? 'text-purple-300' 
                  : 'text-blue-300' 
                : canSelect ? 'text-white' : 'text-gray-500'
            }`}>
              {skillName}
            </h4>
            
            {source && (
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                isFromBackground 
                  ? 'bg-purple-700/50 text-purple-300'
                  : 'bg-blue-700/50 text-blue-300'
              }`}>
                {source} {isFromBackground ? '(automática)' : ''}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-400 capitalize mt-1">
            {ability} {/* Mostrar a habilidade relacionada */}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Modifier */}
          <div className="text-right">
            <div className={`text-lg font-bold ${
              isSelected 
                ? isFromBackground 
                  ? 'text-purple-300' 
                  : 'text-blue-300' 
                : canSelect ? 'text-white' : 'text-gray-400'
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
              isFromBackground ? (
                <CheckCircle className="w-5 h-5 text-purple-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )
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

  // DEBUG: Log dos dados do contexto
  console.log('🚀 [SkillsStep] Context data:', {
    characterData: {
      selectedSkills: characterData.selectedSkills,
      availableSkillChoices: characterData.availableSkillChoices,
      level: characterData.level,
      selectedClass: characterData.selectedClass?.name,
      name: characterData.name
    },
    toggleSkill: typeof toggleSkill,
    calculateModifier: typeof calculateModifier
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterByAbility, setFilterByAbility] = useState<keyof AbilityScores | 'all'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // ===========================
  // COMPUTED VALUES - CORRIGIDOS COM DEBUG
  // ===========================

  // Proficiency bonus baseado no nível
  const proficiencyBonus = Math.ceil(characterData.level / 4) + 1;

  // Skills selecionadas - CORRIGIDO: Memoizado para evitar re-criação
  const selectedSkills = useMemo(() => {
    const skills = characterData.selectedSkills || [];
    console.log('🔍 [SkillsStep] selectedSkills:', {
      characterDataSkills: characterData.selectedSkills,
      computed: skills,
      length: skills.length
    });
    return skills;
  }, [characterData.selectedSkills]);

  // Skills disponíveis para escolha (da classe)
  const availableSkillChoices = characterData.availableSkillChoices || 0;
  console.log('🔍 [SkillsStep] availableSkillChoices:', availableSkillChoices);

  // CORRIGIDO: Separar perícias por fonte real (background vs escolhas da classe)
  const { backgroundSkills, classChoiceSkills, allSkillsFromClass } = useMemo(() => {
    const background: string[] = [];
    const classChoices: string[] = [];
    
    // Perícias que vêm do background (automáticas)
    // TODO: Buscar da API real do background, por enquanto hardcoded para Acolito
    const backgroundSkillsFromData = [
      'skill-insight',
      'skill-religion'
      // Adicionar outras perícias de background conforme necessário
    ];
    
    // Perícias que podem ser escolhidas da classe
    // TODO: Buscar da API real da classe
    const classSkillOptions = [
      'acrobatics', 'animal-handling', 'arcana', 'athletics', 
      'deception', 'history', 'insight', 'intimidation',
      'investigation', 'medicine', 'nature', 'perception',
      'performance', 'persuasion', 'religion', 'sleight-of-hand',
      'stealth', 'survival'
    ];
    
    selectedSkills.forEach(skill => {
      // Converter skill-* para formato padrão se necessário
      const normalizedSkill = skill.replace('skill-', '');
      
      if (backgroundSkillsFromData.includes(skill)) {
        background.push(skill);
      } else if (classSkillOptions.includes(normalizedSkill) || classSkillOptions.includes(skill)) {
        classChoices.push(skill);
      }
    });
    
    console.log('🔧 [SkillsStep] Skills separation by REAL source:', {
      selectedSkills,
      backgroundSkillsFromData,
      classSkillOptions,
      background,
      classChoices,
      backgroundCount: background.length,
      classChoiceCount: classChoices.length
    });
    
    return {
      backgroundSkills: background,
      classChoiceSkills: classChoices,
      allSkillsFromClass: classSkillOptions
    };
  }, [selectedSkills]);

  // Choices restantes - CORRIGIDO: Só contar escolhas da classe
  const remainingChoices = useMemo(() => {
    if (availableSkillChoices === 0) {
      return 0; // Não há escolhas para fazer
    }
    const remaining = Math.max(0, availableSkillChoices - classChoiceSkills.length);
    console.log('🔍 [SkillsStep] remainingChoices calculation (FINAL FIX):', {
      availableSkillChoices,
      classChoiceSkillsLength: classChoiceSkills.length,
      backgroundSkillsLength: backgroundSkills.length,
      totalSelected: selectedSkills.length,
      computed: remaining,
      message: `Ainda pode escolher ${remaining} da classe`
    });
    return remaining;
  }, [availableSkillChoices, classChoiceSkills.length, backgroundSkills.length, selectedSkills.length]);

  // Status das escolhas - CORRIGIDO: Baseado apenas em escolhas da classe
  const choiceStatus = useMemo(() => {
    let status;
    if (availableSkillChoices === 0) {
      status = 'no-choices'; // Não há escolhas para fazer
    } else if (remainingChoices === 0 && classChoiceSkills.length > 0) {
      status = 'all-used'; // Usou todas as escolhas da classe
    } else if (remainingChoices === availableSkillChoices && classChoiceSkills.length === 0) {
      status = 'none-selected'; // Nenhuma perícia da classe selecionada
    } else {
      status = 'has-remaining'; // Ainda tem escolhas da classe
    }
    console.log('🔍 [SkillsStep] choiceStatus (FINAL FIX):', {
      availableSkillChoices,
      remainingChoices,
      classChoiceSkillsLength: classChoiceSkills.length,
      backgroundSkillsLength: backgroundSkills.length,
      status,
      explanation: status === 'none-selected' ? 'Precisa escolher perícias da classe' : 
                   status === 'has-remaining' ? `Ainda pode escolher ${remainingChoices} da classe` :
                   status === 'all-used' ? 'Todas as escolhas da classe foram feitas' : 'Sem escolhas'
    });
    return status;
  }, [availableSkillChoices, remainingChoices, classChoiceSkills.length, backgroundSkills.length]);

  // Filtered skills - CORRIGIDO: selectedSkills agora é estável
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
    console.log('🔄 [SkillsStep] toggleSkill called with:', {
      skillKey,
      currentSelectedSkills: selectedSkills,
      isCurrentlySelected: selectedSkills.includes(skillKey),
      remainingChoices,
      canSelect: canSelectSkill(skillKey)
    });
    toggleSkill(skillKey);
  };

  const canSelectSkill = (skillKey: string): boolean => {
    // Se já está selecionada, sempre pode desmarcar (se for da classe)
    if (selectedSkills.includes(skillKey)) {
      // Se é do background, não pode desmarcar
      if (backgroundSkills.includes(skillKey)) return false;
      // Se é da classe, pode desmarcar
      return true;
    }
    
    // Se não tem choices restantes para perícias da classe, não pode selecionar
    if (remainingChoices <= 0) return false;
    
    console.log('🔍 [SkillsStep] canSelectSkill:', {
      skillKey,
      isSelected: selectedSkills.includes(skillKey),
      isFromBackground: backgroundSkills.includes(skillKey),
      remainingChoices,
      canSelect: true
    });
    
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

  // Determinar fonte da skill - CORRIGIDO: distinguir background das escolhas da classe
  const getSkillSource = (skillKey: string): 'class' | 'background' | 'race' | undefined => {
    if (!selectedSkills.includes(skillKey)) return undefined;
    
    // Se é uma perícia do background
    if (backgroundSkills.includes(skillKey)) {
      return 'background';
    }
    
    // Se é uma perícia de escolha da classe
    if (classChoiceSkills.includes(skillKey)) {
      return 'class';
    }
    
    return 'class'; // fallback para perícias de classe
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
              width: `${availableSkillChoices > 0 ? 
                ((selectedSkills.length / availableSkillChoices) * 100) : 0}%` 
            }}
          />
        </div>

        {/* Status Info - CORRIGIDO COM DEBUG */}
        <div className="mt-4 text-sm">
          {(() => {
            console.log('🎯 [SkillsStep] Rendering status with:', {
              choiceStatus,
              availableSkillChoices,
              selectedSkillsLength: selectedSkills.length,
              remainingChoices
            });
            
            if (choiceStatus === 'no-choices') {
              return (
                <p className="text-gray-400">
                  Sua classe/background não oferece escolhas de perícias adicionais.
                </p>
              );
            }
            
            if (choiceStatus === 'none-selected') {
              return (
                <div>
                  <p className="text-yellow-400">
                    Você precisa selecionar {availableSkillChoices} perícia{availableSkillChoices !== 1 ? 's' : ''} da sua classe.
                  </p>
                  {backgroundSkills.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Perícias do background: {backgroundSkills.length} (já incluídas)
                    </p>
                  )}
                </div>
              );
            }
            
            if (choiceStatus === 'has-remaining') {
              return (
                <div>
                  <p className="text-gray-400">
                    Selecione <span className="text-blue-400 font-medium">{remainingChoices}</span> perícia{remainingChoices !== 1 ? 's' : ''} adiciona{remainingChoices !== 1 ? 'is' : 'l'} da sua classe.
                  </p>
                  {backgroundSkills.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Background: {backgroundSkills.length} | Classe: {classChoiceSkills.length}/{availableSkillChoices}
                    </p>
                  )}
                </div>
              );
            }
            
            if (choiceStatus === 'all-used' && availableSkillChoices > 0) {
              return (
                <div>
                  <p className="text-green-400">
                    ✓ Todas as suas escolhas de perícia da classe foram utilizadas ({classChoiceSkills.length}/{availableSkillChoices}).
                  </p>
                  {backgroundSkills.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Background: {backgroundSkills.length} | Classe: {classChoiceSkills.length} | Total: {selectedSkills.length}
                    </p>
                  )}
                </div>
              );
            }
            
            // Fallback
            return (
              <p className="text-red-400">
                [DEBUG] Status desconhecido: {choiceStatus}
              </p>
            );
          })()}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar perícias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Filter by ability */}
          <select 
            value={filterByAbility}
            onChange={(e) => setFilterByAbility(e.target.value as keyof AbilityScores | 'all')}
            className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
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

          {/* Info sobre choices - CORRIGIDO */}
          {choiceStatus === 'all-used' && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">
                Todas as escolhas utilizadas
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