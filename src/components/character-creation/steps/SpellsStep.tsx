// ===========================
// SPELLS STEP - COMPONENTE REFATORADO E INTEGRADO
// src/components/character-creation/steps/SpellsStep.tsx
// ===========================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Sparkles, 
  Wand2,
  Search,
  CheckCircle,
  Circle,
  Info,
  Star,
  Zap,
  Target,
  Book,
  Flame,
  Snowflake,
  Shield as ShieldIcon,
  Heart,
  Eye,
  Crown,
  Filter,
  AlertCircle,
  RotateCcw,
  Loader2
} from "lucide-react";
import { DndSpell } from "@/types/characterCreation";

// Ícones das escolas de magia
const spellSchools = {
  'Abjuration': { icon: ShieldIcon, color: 'from-blue-500 to-blue-600', name: 'Abjuração' },
  'Conjuration': { icon: Crown, color: 'from-purple-500 to-purple-600', name: 'Conjuração' },
  'Divination': { icon: Eye, color: 'from-indigo-500 to-indigo-600', name: 'Adivinhação' },
  'Enchantment': { icon: Heart, color: 'from-pink-500 to-pink-600', name: 'Encantamento' },
  'Evocation': { icon: Flame, color: 'from-red-500 to-red-600', name: 'Evocação' },
  'Illusion': { icon: Sparkles, color: 'from-violet-500 to-violet-600', name: 'Ilusão' },
  'Necromancy': { icon: Sparkles, color: 'from-gray-500 to-gray-600', name: 'Necromancia' },
  'Transmutation': { icon: Zap, color: 'from-yellow-500 to-yellow-600', name: 'Transmutação' }
};

// Componente do cartão de magia
function SpellCard({ 
  spell, 
  isSelected, 
  onToggle,
  canSelect,
  isCantrip 
}: { 
  spell: DndSpell; 
  isSelected: boolean; 
  onToggle: () => void;
  canSelect: boolean;
  isCantrip: boolean;
}) {
  const school = spellSchools[spell.school?.index || 'evocation'] || spellSchools['Evocation'];
  const SchoolIcon = school.icon;
  const isDisabled = !canSelect && !isSelected;

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25 cursor-pointer hover:scale-[1.02]'
          : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 cursor-pointer hover:scale-[1.02] hover:border-gray-500/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${school.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <SchoolIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium">{spell.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-lg text-gray-300">
                {isCantrip ? 'Cantrip' : `Nível ${spell.level}`}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 border border-purple-500/30">
                {school.name}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="w-6 h-6 text-purple-400" />
          ) : (
            <Circle className={`w-6 h-6 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`} />
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {spell.desc?.[0] || 'Descrição não disponível'}
      </p>

      {/* Detalhes da magia */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Tempo:</span>
            <span className="text-gray-300 ml-1">{spell.casting_time || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Alcance:</span>
            <span className="text-gray-300 ml-1">{spell.range || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Duração:</span>
            <span className="text-gray-300 ml-1">{spell.duration || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Componentes:</span>
            <span className="text-gray-300 ml-1">{spell.components?.join(', ') || 'N/A'}</span>
          </div>
        </div>

        {/* Tags especiais */}
        <div className="flex flex-wrap gap-1 pt-2">
          {spell.concentration && (
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
              Concentração
            </span>
          )}
          {spell.ritual && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              Ritual
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de filtros
function SpellFilters({
  searchTerm,
  onSearchChange,
  filterLevel,
  onFilterLevelChange,
  filterSchool,
  onFilterSchoolChange,
  availableSchools,
  maxLevel
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterLevel: number | 'all';
  onFilterLevelChange: (value: number | 'all') => void;
  filterSchool: string;
  onFilterSchoolChange: (value: string) => void;
  availableSchools: string[];
  maxLevel: number;
}) {
  return (
    <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar magias..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro de Nível */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nível da Magia
          </label>
          <select
            value={filterLevel}
            onChange={(e) => onFilterLevelChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todos os níveis</option>
            <option value={0}>Cantrips</option>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
              <option key={level} value={level}>Nível {level}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Escola */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Escola de Magia
          </label>
          <select
            value={filterSchool}
            onChange={(e) => onFilterSchoolChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todas as escolas</option>
            {availableSchools.map(school => {
              const schoolData = spellSchools[school] || { name: school };
              return (
                <option key={school} value={school}>
                  {schoolData.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function SpellsStep() {
  const { 
    characterData, 
    updateCharacterData,
    spells: spellsData,
    isLoadingSpells,
    spellSearchTerm,
    setSpellSearchTerm,
    spellInfo,
    isSpellcaster,
    cantripsKnown,
    spellsKnown,
    maxSpellLevel,
    validateSpellSelection
  } = useCharacterCreationContext();
  
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');

  // Obter magias disponíveis para a classe
  const classSpells = useMemo(() => {
    if (!spellsData || !characterData.selectedClass) return [];
    
    return spellsData.filter(spell => {
      // Verificar se a magia está disponível para a classe
      const isAvailableForClass = spell.classes?.some(
        cls => cls.index === characterData.selectedClass?.index
      );
      
      // Verificar se o nível da magia está dentro do limite
      const isWithinLevel = spell.level <= (maxSpellLevel || 0);
      
      return isAvailableForClass && isWithinLevel;
    });
  }, [spellsData, characterData.selectedClass, maxSpellLevel]);

  // Filtrar magias
  const filteredSpells = useMemo(() => {
    return classSpells.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(spellSearchTerm.toLowerCase()) ||
                           (spell.desc?.[0] || '').toLowerCase().includes(spellSearchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || spell.level === filterLevel;
      const matchesSchool = filterSchool === 'all' || spell.school?.index === filterSchool;
      return matchesSearch && matchesLevel && matchesSchool;
    });
  }, [classSpells, spellSearchTerm, filterLevel, filterSchool]);

  // Separar cantrips e magias de nível
  const cantrips = filteredSpells.filter(spell => spell.level === 0);
  const levelSpells = filteredSpells.filter(spell => spell.level > 0);

  // Obter escolas disponíveis
  const availableSchools = useMemo(() => {
    const schools = new Set(classSpells.map(spell => spell.school?.index).filter(Boolean));
    return Array.from(schools);
  }, [classSpells]);

  // Magias selecionadas
  const selectedSpells = characterData.selectedSpells || [];
  const selectedCantrips = selectedSpells.filter(spellId => {
    const spell = classSpells.find(s => s.index === spellId);
    return spell?.level === 0;
  });
  const selectedLevelSpells = selectedSpells.filter(spellId => {
    const spell = classSpells.find(s => s.index === spellId);
    return spell && spell.level > 0;
  });

  // Funções de seleção
  const handleSpellToggle = (spellId: string, isCantrip: boolean) => {
    const currentSelected = selectedSpells.includes(spellId);
    
    if (currentSelected) {
      // Remover magia
      const newSpells = selectedSpells.filter(id => id !== spellId);
      updateCharacterData({ selectedSpells: newSpells });
    } else {
      // Adicionar magia se há espaço
      if (isCantrip && selectedCantrips.length < (cantripsKnown || 0)) {
        updateCharacterData({ selectedSpells: [...selectedSpells, spellId] });
      } else if (!isCantrip && selectedLevelSpells.length < (spellsKnown || 0)) {
        updateCharacterData({ selectedSpells: [...selectedSpells, spellId] });
      }
    }
  };

  const resetSpells = () => {
    updateCharacterData({ selectedSpells: [] });
  };

  // Validação
  const validation = validateSpellSelection();

  // Atualizar dados do personagem quando a classe muda
  useEffect(() => {
    if (characterData.selectedClass && isSpellcaster !== undefined) {
      updateCharacterData({
        isSpellcaster: isSpellcaster,
        spellcastingAbility: spellInfo?.spellcastingAbility || null,
      });
    }
  }, [characterData.selectedClass, isSpellcaster, spellInfo, updateCharacterData]);

  // Se não é uma classe conjuradora
  if (!isSpellcaster) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wand2 className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-gray-400 font-semibold text-xl mb-3">Classe Não-Conjuradora</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          A classe selecionada ({characterData.selectedClass?.name}) não possui habilidades de conjuração no nível 1.
          Você pode pular esta etapa.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoadingSpells) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando magias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações da classe */}
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Magias de {characterData.selectedClass?.name}
            </h3>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">
                  Cantrips: {selectedCantrips.length}/{cantripsKnown || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">
                  Magias Nível 1: {selectedLevelSpells.length}/{spellsKnown || 0}
                </span>
              </div>
            </div>
          </div>
          
          {selectedSpells.length > 0 && (
            <button
              onClick={resetSpells}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg text-gray-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar</span>
            </button>
          )}
        </div>

        {/* Validação */}
        {!validation.isValid && (
          <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Seleção Inválida:</span>
            </div>
            <ul className="mt-2 text-sm text-red-300 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filtros */}
      <SpellFilters
        searchTerm={spellSearchTerm}
        onSearchChange={setSpellSearchTerm}
        filterLevel={filterLevel}
        onFilterLevelChange={setFilterLevel}
        filterSchool={filterSchool}
        onFilterSchoolChange={setFilterSchool}
        availableSchools={availableSchools}
        maxLevel={maxSpellLevel || 1}
      />

      {/* Seção de Cantrips */}
      {(cantripsKnown || 0) > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Cantrips ({selectedCantrips.length}/{cantripsKnown})
            </h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cantrips.map((spell) => (
              <SpellCard
                key={spell.index}
                spell={spell}
                isSelected={selectedSpells.includes(spell.index)}
                onToggle={() => handleSpellToggle(spell.index, true)}
                canSelect={selectedCantrips.length < (cantripsKnown || 0)}
                isCantrip={true}
              />
            ))}
          </div>
          
          {cantrips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cantrip encontrado com os filtros atuais.
            </div>
          )}
        </div>
      )}

      {/* Seção de Magias de Nível */}
      {(spellsKnown || 0) > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Magias de Nível 1 ({selectedLevelSpells.length}/{spellsKnown})
            </h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {levelSpells.map((spell) => (
              <SpellCard
                key={spell.index}
                spell={spell}
                isSelected={selectedSpells.includes(spell.index)}
                onToggle={() => handleSpellToggle(spell.index, false)}
                canSelect={selectedLevelSpells.length < (spellsKnown || 0)}
                isCantrip={false}
              />
            ))}
          </div>
          
          {levelSpells.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma magia de nível encontrada com os filtros atuais.
            </div>
          )}
        </div>
      )}

      {/* Informações adicionais */}
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Sobre Magias de Nível 1:</p>
            <ul className="space-y-1 text-blue-200/80">
              <li>• As magias selecionadas são aquelas que você conhece e pode lançar</li>
              <li>• Cantrips podem ser usados quantas vezes quiser</li>
              <li>• Magias de nível consomem espaços de magia quando lançadas</li>
              {spellInfo?.spellcastingAbility && (
                <li>• Sua habilidade de conjuração é {
                  spellInfo.spellcastingAbility === 'int' ? 'Inteligência' :
                  spellInfo.spellcastingAbility === 'wis' ? 'Sabedoria' : 'Carisma'
                }</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}