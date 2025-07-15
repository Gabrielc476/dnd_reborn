// ===========================
// SPELLS STEP - ATUALIZADO PARA USAR NOVOS HOOKS
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
  Loader2,
  ChevronDown,
  X,
  Magic,
  Scroll,
  Gem
} from "lucide-react";

// ===========================
// SCHOOL CONFIGURATIONS
// ===========================

const spellSchools = {
  'abjuration': { icon: ShieldIcon, color: 'from-blue-500 to-blue-600', name: 'Abjuração' },
  'conjuration': { icon: Crown, color: 'from-purple-500 to-purple-600', name: 'Conjuração' },
  'divination': { icon: Eye, color: 'from-indigo-500 to-indigo-600', name: 'Adivinhação' },
  'enchantment': { icon: Heart, color: 'from-pink-500 to-pink-600', name: 'Encantamento' },
  'evocation': { icon: Flame, color: 'from-red-500 to-red-600', name: 'Evocação' },
  'illusion': { icon: Sparkles, color: 'from-violet-500 to-violet-600', name: 'Ilusão' },
  'necromancy': { icon: Sparkles, color: 'from-gray-500 to-gray-600', name: 'Necromancia' },
  'transmutation': { icon: Zap, color: 'from-yellow-500 to-yellow-600', name: 'Transmutação' }
};

// ===========================
// SPELL CARD COMPONENT
// ===========================

interface SpellCardProps {
  spell: any; // Mock spell type
  isSelected: boolean;
  onToggle: () => void;
  canSelect: boolean;
  isCantrip: boolean;
  spellcastingAbility?: string;
  abilityModifier?: number;
  proficiencyBonus?: number;
}

function SpellCard({ 
  spell, 
  isSelected, 
  onToggle,
  canSelect,
  isCantrip,
  spellcastingAbility,
  abilityModifier = 0,
  proficiencyBonus = 2
}: SpellCardProps) {
  const school = spellSchools[spell.school?.index?.toLowerCase() || 'evocation'] || spellSchools['evocation'];
  const SchoolIcon = school.icon;
  const isDisabled = !canSelect && !isSelected;

  // Format components
  const formatComponents = (components: string[]) => {
    return components.map(comp => {
      switch(comp.toLowerCase()) {
        case 'v': return 'Verbal';
        case 's': return 'Somático';
        case 'm': return 'Material';
        default: return comp;
      }
    }).join(', ');
  };

  // Calculate spell save DC and attack bonus
  const spellSaveDC = 8 + proficiencyBonus + abilityModifier;
  const spellAttackBonus = proficiencyBonus + abilityModifier;

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border-purple-400/50 shadow-lg cursor-pointer'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Spell Icon */}
          <div className={`p-2 rounded-lg bg-gradient-to-br ${school.color} flex-shrink-0`}>
            <SchoolIcon className="w-4 h-4 text-white" />
          </div>

          {/* Spell Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {spell.name}
                </h3>
                
                {/* Level and School */}
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    isCantrip 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {isCantrip ? 'Truque' : `Nível ${spell.level}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {school.name}
                  </span>
                </div>

                {/* Casting Info */}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
                  <div>
                    <span className="font-medium">Tempo:</span> {spell.casting_time}
                  </div>
                  <div>
                    <span className="font-medium">Alcance:</span> {spell.range}
                  </div>
                  <div>
                    <span className="font-medium">Componentes:</span> {formatComponents(spell.components)}
                  </div>
                  <div>
                    <span className="font-medium">Duração:</span> {spell.duration}
                  </div>
                </div>

                {/* Spell tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {spell.ritual && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      Ritual
                    </span>
                  )}
                  {spell.concentration && (
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      Concentração
                    </span>
                  )}
                  {spell.damage && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      Dano
                    </span>
                  )}
                </div>

                {/* Spell description (truncated) */}
                {spell.desc && spell.desc.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {spell.desc[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selection Status */}
        <div className="ml-3 flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function SpellsStep() {
  const {
    characterData,
    toggleSpell,
    calculateModifier,
    getSpellcastingAbility,
  } = useCharacterCreationContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [showOnlyRitual, setShowOnlyRitual] = useState(false);
  const [showOnlyConcentration, setShowOnlyConcentration] = useState(false);
  const [activeTab, setActiveTab] = useState<'cantrips' | 'spells'>('cantrips');

  // ===========================
  // COMPUTED VALUES
  // ===========================

  // Check if character is a spellcaster
  const isSpellcaster = useMemo(() => {
    return characterData.isSpellcaster;
  }, [characterData.isSpellcaster]);

  // Get spellcasting ability
  const spellcastingAbility = useMemo(() => {
    return characterData.spellcastingAbility;
  }, [characterData.spellcastingAbility]);

  // Calculate ability modifier
  const abilityModifier = useMemo(() => {
    if (!spellcastingAbility) return 0;
    return calculateModifier(characterData.abilityScores[spellcastingAbility]);
  }, [spellcastingAbility, characterData.abilityScores, calculateModifier]);

  // Proficiency bonus
  const proficiencyBonus = Math.ceil(characterData.level / 4) + 1;

  // Selected spells
  const selectedSpells = characterData.selectedSpells || [];

  // Mock spells data - em produção viria da API
  const mockSpells = [
    {
      index: 'fire-bolt',
      name: 'Projétil de Fogo',
      level: 0,
      school: { index: 'evocation', name: 'Evocation' },
      casting_time: '1 ação',
      range: '120 pés',
      components: ['V', 'S'],
      duration: 'Instantânea',
      ritual: false,
      concentration: false,
      damage: true,
      desc: ['Você atira um mote cintilante de fogo em uma criatura ou objeto dentro do alcance.']
    },
    {
      index: 'mage-hand',
      name: 'Mão Mágica',
      level: 0,
      school: { index: 'conjuration', name: 'Conjuration' },
      casting_time: '1 ação',
      range: '30 pés',
      components: ['V', 'S'],
      duration: '1 minuto',
      ritual: false,
      concentration: false,
      damage: false,
      desc: ['Uma mão espectral flutuante aparece em um ponto que você escolha dentro do alcance.']
    },
    {
      index: 'magic-missile',
      name: 'Míssil Mágico',
      level: 1,
      school: { index: 'evocation', name: 'Evocation' },
      casting_time: '1 ação',
      range: '120 pés',
      components: ['V', 'S'],
      duration: 'Instantânea',
      ritual: false,
      concentration: false,
      damage: true,
      desc: ['Você cria três dardos brilhantes de força mágica.']
    },
    {
      index: 'shield',
      name: 'Escudo',
      level: 1,
      school: { index: 'abjuration', name: 'Abjuration' },
      casting_time: '1 reação',
      range: 'Pessoal',
      components: ['V', 'S'],
      duration: '1 rodada',
      ritual: false,
      concentration: false,
      damage: false,
      desc: ['Uma barreira invisível de força mágica aparece e o protege.']
    }
  ];

  // Filter spells
  const filteredSpells = useMemo(() => {
    let filtered = mockSpells;

    // Filter by tab (cantrips vs spells)
    if (activeTab === 'cantrips') {
      filtered = filtered.filter(spell => spell.level === 0);
    } else {
      filtered = filtered.filter(spell => spell.level > 0);
    }

    // Filter by search
    if (searchTerm.trim()) {
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by school
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(spell => 
        spell.school.index === selectedSchool
      );
    }

    // Filter by level (for spells tab)
    if (selectedLevel !== 'all' && activeTab === 'spells') {
      filtered = filtered.filter(spell => spell.level === selectedLevel);
    }

    // Filter by ritual
    if (showOnlyRitual) {
      filtered = filtered.filter(spell => spell.ritual);
    }

    // Filter by concentration
    if (showOnlyConcentration) {
      filtered = filtered.filter(spell => spell.concentration);
    }

    return filtered;
  }, [mockSpells, activeTab, searchTerm, selectedSchool, selectedLevel, showOnlyRitual, showOnlyConcentration]);

  // Spell counts
  const cantripsSelected = selectedSpells.filter(spellIndex => 
    mockSpells.find(s => s.index === spellIndex)?.level === 0
  ).length;
  
  const spellsSelected = selectedSpells.filter(spellIndex => 
    mockSpells.find(s => s.index === spellIndex)?.level > 0
  ).length;

  // Mock spell limits - em produção viria dos hooks
  const cantripsKnown = characterData.knownSpells || 2;
  const spellsKnown = characterData.knownSpells || 1;

  // ===========================
  // HANDLERS
  // ===========================

  const handleToggleSpell = (spellIndex: string) => {
    toggleSpell(spellIndex);
  };

  const canSelectSpell = (spell: any): boolean => {
    // Se já está selecionada, sempre pode desmarcar
    if (selectedSpells.includes(spell.index)) return true;
    
    // Check limits
    if (spell.level === 0) {
      return cantripsSelected < cantripsKnown;
    } else {
      return spellsSelected < spellsKnown;
    }
  };

  // ===========================
  // RENDER NÃO-CONJURADOR
  // ===========================

  if (!isSpellcaster) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Não é um Conjurador
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Sua classe não possui habilidades de conjuração. Você pode pular esta etapa.
        </p>
      </div>
    );
  }

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-6">
      {/* Spellcasting Info */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Informações de Conjuração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Habilidade:</span>
                <span className="text-white ml-2 font-medium">
                  {spellcastingAbility ? spellcastingAbility.charAt(0).toUpperCase() + spellcastingAbility.slice(1) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">CD de Resistência:</span>
                <span className="text-white ml-2 font-medium">
                  {8 + proficiencyBonus + abilityModifier}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bônus de Ataque:</span>
                <span className="text-white ml-2 font-medium">
                  +{proficiencyBonus + abilityModifier}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Spell Selection Tabs */}
      <div className="flex space-x-1 bg-gray-800/30 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('cantrips')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all ${
            activeTab === 'cantrips'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Truques</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {cantripsSelected}/{cantripsKnown}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('spells')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all ${
            activeTab === 'spells'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Scroll className="w-4 h-4" />
            <span>Magias</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {spellsSelected}/{spellsKnown}
            </span>
          </div>
        </button>
      </div>

      {/* Spell Status */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {activeTab === 'cantrips' ? 'Truques' : 'Magias'} Selecionadas:
            </span>
            <span className={`font-medium ${
              activeTab === 'cantrips' 
                ? cantripsSelected === cantripsKnown ? 'text-green-400' : 'text-blue-400'
                : spellsSelected === spellsKnown ? 'text-purple-400' : 'text-blue-400'
            }`}>
              {activeTab === 'cantrips' ? cantripsSelected : spellsSelected} / {activeTab === 'cantrips' ? cantripsKnown : spellsKnown}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Restantes:</span>
            <span className="font-medium text-yellow-400">
              {activeTab === 'cantrips' ? cantripsKnown - cantripsSelected : spellsKnown - spellsSelected}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              activeTab === 'cantrips' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-600'
            }`}
            style={{ 
              width: `${activeTab === 'cantrips' 
                ? (cantripsSelected / cantripsKnown) * 100
                : (spellsSelected / spellsKnown) * 100
              }%` 
            }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar magias..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Todas as escolas</option>
            {Object.entries(spellSchools).map(([key, school]) => (
              <option key={key} value={key}>{school.name}</option>
            ))}
          </select>

          {activeTab === 'spells' && (
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">Todos os níveis</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <option key={level} value={level}>Nível {level}</option>
              ))}
            </select>
          )}

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyRitual}
              onChange={(e) => setShowOnlyRitual(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/50"
            />
            <span className="text-sm text-gray-300">Apenas rituais</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyConcentration}
              onChange={(e) => setShowOnlyConcentration(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/50"
            />
            <span className="text-sm text-gray-300">Apenas concentração</span>
          </label>
        </div>
      </div>

      {/* Spells List */}
      <div className="space-y-3">
        {filteredSpells.map((spell) => (
          <SpellCard
            key={spell.index}
            spell={spell}
            isSelected={selectedSpells.includes(spell.index)}
            onToggle={() => handleToggleSpell(spell.index)}
            canSelect={canSelectSpell(spell)}
            isCantrip={spell.level === 0}
            spellcastingAbility={spellcastingAbility}
            abilityModifier={abilityModifier}
            proficiencyBonus={proficiencyBonus}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSpells.length === 0 && (
        <div className="text-center py-12">
          <Magic className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhuma magia encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Selected Spells Summary */}
      {selectedSpells.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Magias Selecionadas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cantrips */}
            {selectedSpells.filter(spellIndex => 
              mockSpells.find(s => s.index === spellIndex)?.level === 0
            ).map(spellIndex => {
              const spell = mockSpells.find(s => s.index === spellIndex);
              if (!spell) return null;
              
              return (
                <div key={spellIndex} className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">{spell.name}</span>
                  </div>
                  <span className="text-xs text-green-400">Truque</span>
                </div>
              );
            })}

            {/* Spells */}
            {selectedSpells.filter(spellIndex => 
              mockSpells.find(s => s.index === spellIndex)?.level > 0
            ).map(spellIndex => {
              const spell = mockSpells.find(s => s.index === spellIndex);
              if (!spell) return null;
              
              return (
                <div key={spellIndex} className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <Scroll className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">{spell.name}</span>
                  </div>
                  <span className="text-xs text-purple-400">Nível {spell.level}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}