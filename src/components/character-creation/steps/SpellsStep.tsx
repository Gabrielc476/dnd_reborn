// ===========================
// SPELLS STEP - COMPONENTE COMPLETO CORRIGIDO
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
  X
} from "lucide-react";
import { DndSpell } from "@/types/characterCreation";

// ===========================
// CONFIGURAÇÕES DAS ESCOLAS DE MAGIA
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
// COMPONENTE DO CARTÃO DE MAGIA
// ===========================

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
  const school = spellSchools[spell.school?.index?.toLowerCase() || 'evocation'] || spellSchools['evocation'];
  const SchoolIcon = school.icon;
  const isDisabled = !canSelect && !isSelected;

  // Formatear componentes da magia
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

  // Formatear duração
  const formatDuration = (duration: string) => {
    return duration.replace(/(\d+)\s+(\w+)/, '$1 $2');
  };

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
              <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-lg text-gray-300">
                {school.name}
              </span>
              {spell.ritual && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400">
                  Ritual
                </span>
              )}
              {spell.concentration && (
                <span className="text-xs px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-400">
                  Concentração
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'bg-purple-500 border-purple-500'
            : 'border-gray-500'
        }`}>
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Informações da magia */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-400">
          <span><strong>Tempo:</strong> {spell.casting_time}</span>
          <span><strong>Alcance:</strong> {spell.range}</span>
        </div>
        
        <div className="flex items-center justify-between text-gray-400">
          <span><strong>Componentes:</strong> {formatComponents(spell.components)}</span>
          <span><strong>Duração:</strong> {formatDuration(spell.duration)}</span>
        </div>

        {spell.material && (
          <div className="text-gray-400">
            <strong>Material:</strong> {spell.material}
          </div>
        )}

        {/* Descrição da magia */}
        <div className="mt-3 text-gray-300 text-sm leading-relaxed">
          {Array.isArray(spell.desc) ? spell.desc[0] : spell.desc}
          {(Array.isArray(spell.desc) ? spell.desc.length > 1 : false) && (
            <span className="text-gray-500"> [...]</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// COMPONENTE DE FILTROS
// ===========================

function SpellFilters({ 
  filterLevel, 
  setFilterLevel, 
  filterSchool, 
  setFilterSchool, 
  availableSchools,
  maxLevel,
  onReset
}: {
  filterLevel: number | 'all';
  setFilterLevel: (level: number | 'all') => void;
  filterSchool: string;
  setFilterSchool: (school: string) => void;
  availableSchools: string[];
  maxLevel: number;
  onReset: () => void;
}) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Filtros</h3>
        </div>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Filtro de Nível */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nível da Magia
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
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
            onChange={(e) => setFilterSchool(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">Todas as escolas</option>
            {availableSchools.map(school => {
              const schoolData = spellSchools[school?.toLowerCase()] || { name: school };
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

// ===========================
// COMPONENTE PRINCIPAL - SPELLS STEP
// ===========================

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
    // ✅ CORREÇÃO: Extrair as funções corretas do contexto
    validateSpellSelection, // Sem parâmetros, usa dados atuais
    toggleSpell, // Função para toggle de magias
  } = useCharacterCreationContext();
  
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');

  // ===========================
  // VERIFICAÇÃO DE CLASSE CONJURADORA
  // ===========================

  // Se não é uma classe conjuradora, mostrar mensagem
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

  // ===========================
  // LOADING STATE
  // ===========================

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

  // ===========================
  // PROCESSAMENTO DAS MAGIAS
  // ===========================

  // Magias disponíveis para a classe
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

  // Filtrar magias baseado nos filtros e busca
  const filteredSpells = useMemo(() => {
    return classSpells.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(spellSearchTerm.toLowerCase()) ||
                           (Array.isArray(spell.desc) ? spell.desc.join(' ') : spell.desc || '')
                           .toLowerCase().includes(spellSearchTerm.toLowerCase());
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

  // ===========================
  // VALIDAÇÃO DE MAGIAS
  // ===========================

  // ✅ CORREÇÃO: Usar a função correta sem parâmetros
  const validation = validateSpellSelection();

  // Verificar se pode selecionar mais magias
  const canSelectMoreCantrips = validation.cantripsCount < validation.maxCantrips;
  const canSelectMoreSpells = validation.spellsCount < validation.maxSpells;

  // ===========================
  // HANDLERS DE AÇÕES
  // ===========================

  const handleSpellToggle = (spellIndex: string) => {
    toggleSpell(spellIndex);
  };

  const resetFilters = () => {
    setFilterLevel('all');
    setFilterSchool('all');
    setSpellSearchTerm('');
  };

  const resetSpells = () => {
    updateCharacterData({ selectedSpells: [] });
  };

  // ===========================
  // ATUALIZAR DADOS DO PERSONAGEM QUANDO A CLASSE MUDA
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass && isSpellcaster !== undefined) {
      updateCharacterData({
        isSpellcaster: isSpellcaster,
        spellcastingAbility: spellInfo?.spellcastingAbility || null,
      });
    }
  }, [characterData.selectedClass, isSpellcaster, spellInfo, updateCharacterData]);

  // ===========================
  // RENDER DO COMPONENTE
  // ===========================

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
                  Cantrips: <span className={validation.cantripsCount > validation.maxCantrips ? 'text-red-400' : 'text-green-400'}>
                    {validation.cantripsCount}/{validation.maxCantrips}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">
                  Magias Nível 1: <span className={validation.spellsCount > validation.maxSpells ? 'text-red-400' : 'text-green-400'}>
                    {validation.spellsCount}/{validation.maxSpells}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetSpells}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Limpar Seleção</span>
          </button>
        </div>
      </div>

      {/* Mensagens de validação */}
      {validation.errors.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-red-400 font-medium">Erros na Seleção de Magias</h4>
          </div>
          <ul className="text-red-300 text-sm space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-400" />
            <h4 className="text-yellow-400 font-medium">Sugestões</h4>
          </div>
          <ul className="text-yellow-300 text-sm space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Busca de magias */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={spellSearchTerm}
          onChange={(e) => setSpellSearchTerm(e.target.value)}
          placeholder="Buscar magias..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      {/* Filtros */}
      <SpellFilters
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filterSchool={filterSchool}
        setFilterSchool={setFilterSchool}
        availableSchools={availableSchools}
        maxLevel={maxSpellLevel || 1}
        onReset={resetFilters}
      />

      {/* Lista de Cantrips */}
      {cantrips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Cantrips ({cantrips.length} disponíveis)
            </h3>
          </div>
          
          <div className="grid gap-4">
            {cantrips.map((spell) => {
              const isSelected = characterData.selectedSpells?.includes(spell.index) || false;
              const canSelect = canSelectMoreCantrips || isSelected;
              
              return (
                <SpellCard
                  key={spell.index}
                  spell={spell}
                  isSelected={isSelected}
                  onToggle={() => handleSpellToggle(spell.index)}
                  canSelect={canSelect}
                  isCantrip={true}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Magias de Nível */}
      {levelSpells.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Magias de Nível 1 ({levelSpells.length} disponíveis)
            </h3>
          </div>
          
          <div className="grid gap-4">
            {levelSpells.map((spell) => {
              const isSelected = characterData.selectedSpells?.includes(spell.index) || false;
              const canSelect = canSelectMoreSpells || isSelected;
              
              return (
                <SpellCard
                  key={spell.index}
                  spell={spell}
                  isSelected={isSelected}
                  onToggle={() => handleSpellToggle(spell.index)}
                  canSelect={canSelect}
                  isCantrip={false}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Mensagem quando não há magias */}
      {filteredSpells.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Book className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-gray-400 font-semibold text-xl mb-3">
            Nenhuma magia encontrada
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            Tente ajustar os filtros ou termos de busca para encontrar as magias que você procura.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Informações úteis */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-200 text-sm">
            <p className="font-medium mb-1">Informações sobre Magias:</p>
            <ul className="space-y-1 text-blue-200/80">
              <li>• <strong>Cantrips</strong> podem ser usados quantas vezes quiser</li>
              <li>• <strong>Magias de nível</strong> consomem slots de magia</li>
              <li>• <strong>Ritual</strong> pode ser conjurada sem gastar slot (demora +10 min)</li>
              <li>• <strong>Concentração</strong> requer foco contínuo para manter o efeito</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}