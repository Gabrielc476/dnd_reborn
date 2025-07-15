// ===========================
// SPELLS STEP - VERSÃO COMPLETA COM DEBUGGING E CORREÇÕES
// src/components/character-creation/steps/SpellsStep.tsx
// ===========================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import useCharacterSpells from "@/hooks/character-creation/useCharacterSpells";
import { useCharacterAPI } from "@/hooks/character-creation/useCharacterAPI";
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
  Wand2 as MagicIcon,
  Scroll,
  Gem,
  Bug
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
// DEBUGGING PANEL COMPONENT
// ===========================

interface DebugPanelProps {
  characterData: any;
  spellsHook: any;
  currentClassIndex?: string;
  spellsFromAPI: any[];
  isLoadingSpells: boolean;
  hasSpellcasterBug?: boolean;
  hasDataPropagationBug?: boolean;
}

function DebugPanel({ characterData, spellsHook, currentClassIndex, spellsFromAPI, isLoadingSpells, hasSpellcasterBug, hasDataPropagationBug }: DebugPanelProps) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-50"
        title="Mostrar debug"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-gray-900 border border-red-500 rounded-lg p-4 text-xs font-mono text-white shadow-2xl z-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-red-400 font-bold">🐛 SPELLS DEBUG</h4>
        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong className="text-yellow-400">Character Data:</strong>
          <div className="pl-2">
            <div>isSpellcaster: <span className={characterData.isSpellcaster ? 'text-green-400' : 'text-red-400'}>{String(characterData.isSpellcaster)}</span></div>
            <div>spellcastingAbility: <span className="text-blue-400">{characterData.spellcastingAbility || 'null'}</span></div>
            <div>level: <span className="text-blue-400">{characterData.level}</span></div>
            <div>className: <span className={characterData.characterClass?.name ? 'text-green-400' : 'text-red-400'}>{characterData.characterClass?.name || 'null'}</span></div>
            <div>classIndex: <span className={characterData.characterClass?.index ? 'text-green-400' : 'text-red-400'}>{characterData.characterClass?.index || 'null'}</span></div>
            <div>hasSpellcasting: <span className={characterData.characterClass?.spellcasting ? 'text-green-400' : 'text-red-400'}>{String(!!characterData.characterClass?.spellcasting)}</span></div>
            <div>selectedSpells: <span className="text-blue-400">{characterData.selectedSpells?.length || 0}</span></div>
          </div>
        </div>

        <div>
          <strong className="text-yellow-400">Spells Hook:</strong>
          <div className="pl-2">
            <div>isSpellcaster: <span className={spellsHook.isSpellcaster ? 'text-green-400' : 'text-red-400'}>{String(spellsHook.isSpellcaster)}</span></div>
            <div>spellcastingAbility: <span className="text-blue-400">{spellsHook.spellcastingAbility || 'null'}</span></div>
            <div>cantripsKnown: <span className="text-blue-400">{spellsHook.cantripsKnown}</span></div>
            <div>spellsKnown: <span className="text-blue-400">{spellsHook.spellsKnown}</span></div>
            <div>selectedCantrips: <span className="text-blue-400">{spellsHook.selectedCantrips.length}</span></div>
            <div>selectedSpells: <span className="text-blue-400">{spellsHook.selectedSpells.length}</span></div>
            <div>availableCantrips: <span className="text-blue-400">{spellsHook.availableCantrips.length}</span></div>
            <div>availableSpells: <span className="text-blue-400">{spellsHook.availableSpells.length}</span></div>
          </div>
        </div>

        <div>
          <strong className="text-yellow-400">API Data:</strong>
          <div className="pl-2">
            <div>currentClassIndex: <span className="text-blue-400">{currentClassIndex || 'null'}</span></div>
            <div>isLoadingSpells: <span className={isLoadingSpells ? 'text-yellow-400' : 'text-green-400'}>{String(isLoadingSpells)}</span></div>
            <div>spellsFromAPI: <span className="text-blue-400">{spellsFromAPI.length} magias</span></div>
          </div>
        </div>

        {characterData.characterClass?.spellcasting && (
          <div>
            <strong className="text-yellow-400">Spellcasting Data:</strong>
            <div className="pl-2 text-green-400">
              <div>ability: {characterData.characterClass.spellcasting.spellcasting_ability?.index}</div>
              <div>level: {characterData.characterClass.spellcasting.level}</div>
            </div>
          </div>
        )}

        {/* Verificação de problemas */}
        <div>
          <strong className="text-yellow-400">Problemas Detectados:</strong>
          <div className="pl-2">
            <div>SpellcasterBug: <span className={hasSpellcasterBug ? 'text-red-400' : 'text-green-400'}>{String(hasSpellcasterBug)}</span></div>
            <div>DataPropagationBug: <span className={hasDataPropagationBug ? 'text-red-400' : 'text-green-400'}>{String(hasDataPropagationBug)}</span></div>
          </div>
        </div>

        {/* Sugestões baseadas no estado */}
        {hasDataPropagationBug && (
          <div>
            <strong className="text-red-400">🔧 Ação Sugerida:</strong>
            <div className="pl-2 text-red-300 text-xs">
              <div>1. Volte para "Informações Básicas"</div>
              <div>2. Confirme que Clérigo está selecionado</div>
              <div>3. Aguarde carregamento da API</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// SPELL CARD COMPONENT
// ===========================

interface SpellCardProps {
  spell: any;
  isSelected: boolean;
  onToggle: () => void;
  canSelect: boolean;
  isCantrip: boolean;
  spellcastingInfo: any;
}

function SpellCard({ 
  spell, 
  isSelected, 
  onToggle,
  canSelect,
  isCantrip,
  spellcastingInfo
}: SpellCardProps) {
  const schoolKey = spell.school?.index?.toLowerCase() || 'evocation';
  const school = spellSchools[schoolKey] || spellSchools['evocation'];
  const SchoolIcon = school.icon;
  const isDisabled = !canSelect && !isSelected;

  const formatComponents = (components: string[]) => {
    if (!components || !Array.isArray(components)) return '';
    return components.map(comp => {
      switch(comp.toLowerCase()) {
        case 'v': return 'Verbal';
        case 's': return 'Somático';
        case 'm': return 'Material';
        default: return comp;
      }
    }).join(', ');
  };

  const castingTime = spell.casting_time || '1 ação';
  const range = spell.range || '60 pés';
  const duration = spell.duration || 'Instantâneo';
  const components = spell.components || [];
  const description = spell.desc?.join(' ') || spell.description || 'Sem descrição disponível';

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'cursor-pointer bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border-purple-500/50 shadow-lg'
          : 'cursor-pointer bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/30'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${school.color} flex items-center justify-center`}>
          <SchoolIcon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {spell.name}
              </h3>
              
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

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
                <div><span className="font-medium">Tempo:</span> {castingTime}</div>
                <div><span className="font-medium">Alcance:</span> {range}</div>
                <div><span className="font-medium">Componentes:</span> {formatComponents(components)}</div>
                <div><span className="font-medium">Duração:</span> {duration}</div>
              </div>

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
                {spell.damage && spell.damage.damage_type && (
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                    Dano
                  </span>
                )}
              </div>

              {description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {description.length > 150 ? `${description.substring(0, 150)}...` : description}
                </p>
              )}
            </div>
          </div>
        </div>

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
    calculateModifier,
  } = useCharacterCreationContext();

  // Hooks
  const spellsHook = useCharacterSpells();
  const { useSpellsQuery } = useCharacterAPI();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [showOnlyRitual, setShowOnlyRitual] = useState(false);
  const [showOnlyConcentration, setShowOnlyConcentration] = useState(false);
  const [activeTab, setActiveTab] = useState<'cantrips' | 'spells'>('cantrips');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Função para adicionar logs de debug
  const addDebugLog = (message: string) => {
    console.log(`🔍 SpellsStep: ${message}`);
    setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // ===========================
  // BUSCA DE MAGIAS DA API
  // ===========================

  const currentClassIndex = characterData.characterClass?.index;
  const { 
    data: spellsFromAPI = [], 
    isLoading: isLoadingSpells, 
    error: spellsError 
  } = useSpellsQuery(currentClassIndex);

  // Debug logs
  useEffect(() => {
    addDebugLog(`Dados do personagem carregados - Classe: ${characterData.characterClass?.name || 'null'}, IsSpellcaster: ${characterData.isSpellcaster}`);
  }, [characterData.characterClass, characterData.isSpellcaster]);

  useEffect(() => {
    addDebugLog(`Hook de magias atualizado - IsSpellcaster: ${spellsHook.isSpellcaster}, Ability: ${spellsHook.spellcastingAbility}`);
  }, [spellsHook.isSpellcaster, spellsHook.spellcastingAbility]);

  useEffect(() => {
    addDebugLog(`API de magias - Loading: ${isLoadingSpells}, Spells: ${spellsFromAPI.length}, Error: ${!!spellsError}`);
  }, [isLoadingSpells, spellsFromAPI.length, spellsError]);

  // ===========================
  // SINCRONIZAÇÃO COM HOOK DE MAGIAS
  // ===========================

  useEffect(() => {
    if (spellsFromAPI.length > 0 && characterData.characterClass) {
      addDebugLog(`Sincronizando ${spellsFromAPI.length} magias da API com o hook`);
      spellsHook.setAvailableSpells(spellsFromAPI, characterData.characterClass);
    }
  }, [spellsFromAPI, characterData.characterClass, spellsHook.setAvailableSpells]);

  useEffect(() => {
    if (characterData.characterClass && characterData.level) {
      addDebugLog(`Configurando conjuração para ${characterData.characterClass.name} nível ${characterData.level}`);
      
      const abilityModifier = spellsHook.spellcastingAbility 
        ? calculateModifier(characterData.abilityScores[spellsHook.spellcastingAbility] || 10)
        : 0;
        
      spellsHook.configureSpellcasting(
        characterData.characterClass,
        characterData.level,
        abilityModifier
      );
    }
  }, [
    characterData.characterClass, 
    characterData.level, 
    characterData.abilityScores,
    spellsHook.configureSpellcasting,
    spellsHook.spellcastingAbility,
    calculateModifier
  ]);

  useEffect(() => {
    if (spellsHook.spellcastingAbility && characterData.abilityScores) {
      const abilityModifier = calculateModifier(
        characterData.abilityScores[spellsHook.spellcastingAbility] || 10
      );
      const proficiencyBonus = Math.ceil((characterData.level || 1) / 4) + 1;
      
      addDebugLog(`Atualizando valores dinâmicos - Modifier: ${abilityModifier}, Proficiency: ${proficiencyBonus}`);
      
      spellsHook.updateDynamicValues(
        abilityModifier,
        proficiencyBonus,
        characterData.characterClass
      );
    }
  }, [
    characterData.abilityScores,
    characterData.level,
    characterData.characterClass,
    spellsHook.spellcastingAbility,
    spellsHook.updateDynamicValues,
    calculateModifier
  ]);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const allAvailableSpells = useMemo(() => {
    return [...spellsHook.availableCantrips, ...spellsHook.availableSpells];
  }, [spellsHook.availableCantrips, spellsHook.availableSpells]);

  const filteredSpells = useMemo(() => {
    if (!allAvailableSpells || allAvailableSpells.length === 0) return [];

    let filtered = allAvailableSpells;

    if (activeTab === 'cantrips') {
      filtered = filtered.filter(spell => spell.level === 0);
    } else {
      filtered = filtered.filter(spell => spell.level > 0);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSchool !== 'all') {
      filtered = filtered.filter(spell => 
        spell.school?.index === selectedSchool
      );
    }

    if (selectedLevel !== 'all' && activeTab === 'spells') {
      filtered = filtered.filter(spell => spell.level === selectedLevel);
    }

    if (showOnlyRitual) {
      filtered = filtered.filter(spell => spell.ritual);
    }

    if (showOnlyConcentration) {
      filtered = filtered.filter(spell => spell.concentration);
    }

    return filtered;
  }, [allAvailableSpells, activeTab, searchTerm, selectedSchool, selectedLevel, showOnlyRitual, showOnlyConcentration]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleToggleSpell = (spell: any) => {
    if (spell.level === 0) {
      if (spellsHook.isKnownCantrip(spell.index)) {
        addDebugLog(`Removendo cantrip: ${spell.name}`);
        spellsHook.removeCantrip(spell.index);
      } else {
        addDebugLog(`Adicionando cantrip: ${spell.name}`);
        spellsHook.addCantrip(spell);
      }
    } else {
      if (spellsHook.isKnownSpell(spell.index)) {
        addDebugLog(`Removendo magia: ${spell.name}`);
        spellsHook.removeSpell(spell.index);
      } else {
        addDebugLog(`Adicionando magia: ${spell.name}`);
        spellsHook.addSpell(spell);
      }
    }
  };

  const canSelectSpell = (spell: any): boolean => {
    const isAlreadySelected = spell.level === 0 
      ? spellsHook.isKnownCantrip(spell.index)
      : spellsHook.isKnownSpell(spell.index);
      
    if (isAlreadySelected) return true;
    
    if (spell.level === 0) {
      return spellsHook.canLearnMoreCantrips;
    } else {
      return spellsHook.canLearnMoreSpells;
    }
  };

  // ===========================
  // VERIFICAÇÃO DE PROBLEMAS
  // ===========================

  const hasSpellcasterBug = useMemo(() => {
    // Se tem dados de spellcasting mas não é marcado como spellcaster, é um bug
    return !!characterData.characterClass?.spellcasting && !characterData.isSpellcaster;
  }, [characterData.characterClass, characterData.isSpellcaster]);

  const hasDataPropagationBug = useMemo(() => {
    // Se é spellcaster mas não tem dados da classe, é problema de propagação
    return characterData.isSpellcaster && !characterData.characterClass;
  }, [characterData.isSpellcaster, characterData.characterClass]);

  // ===========================
  // RENDER ESTADOS DE ERRO E LOADING
  // ===========================

  if (hasDataPropagationBug) {
    return (
      <div className="space-y-6">
        <div className="bg-orange-800/20 rounded-xl p-6 border border-orange-700/50">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-orange-300 mb-2">
                🔄 PROBLEMA: Dados da Classe Não Estão Chegando
              </h3>
              <p className="text-orange-200 mb-4">
                O sistema detectou que você é um conjurador, mas os dados da sua classe não estão sendo propagados 
                corretamente para o componente de magias.
              </p>
              
              <div className="bg-orange-900/50 rounded-lg p-4 mb-4">
                <h4 className="text-orange-300 font-medium mb-2">Possíveis Soluções:</h4>
                <ol className="text-sm text-orange-200 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Volte para "Informações Básicas"</strong> e confirme que o Clérigo está selecionado
                  </li>
                  <li>
                    <strong>Aguarde alguns segundos</strong> para os dados carregarem da API
                  </li>
                  <li>
                    <strong>Recarregue a página</strong> se o problema persistir
                  </li>
                  <li>
                    <strong>Verifique o console</strong> para mensagens de erro da API
                  </li>
                </ol>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Recarregar Página
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Voltar ao Step Anterior
                </button>
              </div>

              <div className="text-xs text-orange-300 font-mono bg-orange-900/30 p-2 rounded mt-4">
                DEBUG: isSpellcaster={String(characterData.isSpellcaster)} | 
                hasCharacterClass={String(!!characterData.characterClass)} | 
                characterClass={characterData.characterClass?.name || 'null'}
              </div>
            </div>
          </div>
        </div>
        
        <DebugPanel 
          characterData={characterData}
          spellsHook={spellsHook}
          currentClassIndex={currentClassIndex}
          spellsFromAPI={spellsFromAPI}
          isLoadingSpells={isLoadingSpells}
          hasSpellcasterBug={hasSpellcasterBug}
          hasDataPropagationBug={hasDataPropagationBug}
        />
      </div>
    );
  }

  if (hasSpellcasterBug) {
    return (
      <div className="space-y-6">
        <div className="bg-red-800/20 rounded-xl p-6 border border-red-700/50">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-300 mb-2">
                🐛 BUG DETECTADO: Lógica de Spellcaster Invertida
              </h3>
              <p className="text-red-200 mb-4">
                Sua classe <strong>{characterData.characterClass?.name}</strong> TEM habilidades de conjuração, 
                mas está sendo marcada como NÃO-conjuradora devido a um bug no código.
              </p>
              
              <div className="bg-red-900/50 rounded-lg p-4 mb-4">
                <h4 className="text-red-300 font-medium mb-2">Como Corrigir:</h4>
                <ol className="text-sm text-red-200 space-y-1 list-decimal list-inside">
                  <li>Abra <code className="bg-red-800/50 px-1 rounded">src/hooks/character-creation/useCharacterCreationOrchestrator.tsx</code></li>
                  <li>Encontre a linha: <code className="bg-red-800/50 px-1 rounded">const isSpellcaster = !characterClass.spellcasting;</code></li>
                  <li>Substitua por: <code className="bg-green-800/50 px-1 rounded">const isSpellcaster = !!characterClass.spellcasting;</code></li>
                  <li>Salve o arquivo e recarregue a página</li>
                </ol>
              </div>

              <div className="text-xs text-red-300 font-mono bg-red-900/30 p-2 rounded">
                DEBUG: hasSpellcasting={String(!!characterData.characterClass?.spellcasting)} | 
                isSpellcaster={String(characterData.isSpellcaster)} | 
                className={characterData.characterClass?.name}
              </div>
            </div>
          </div>
        </div>
        
        <DebugPanel 
          characterData={characterData}
          spellsHook={spellsHook}
          currentClassIndex={currentClassIndex}
          spellsFromAPI={spellsFromAPI}
          isLoadingSpells={isLoadingSpells}
          hasSpellcasterBug={hasSpellcasterBug}
          hasDataPropagationBug={hasDataPropagationBug}
        />
      </div>
    );
  }

  if (hasSpellcasterBug) {
    return (
      <div className="space-y-6">
        <div className="bg-red-800/20 rounded-xl p-6 border border-red-700/50">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-300 mb-2">
                🐛 BUG DETECTADO: Lógica de Spellcaster Invertida
              </h3>
              <p className="text-red-200 mb-4">
                Sua classe <strong>{characterData.characterClass?.name}</strong> TEM habilidades de conjuração, 
                mas está sendo marcada como NÃO-conjuradora devido a um bug no código.
              </p>
              
              <div className="bg-red-900/50 rounded-lg p-4 mb-4">
                <h4 className="text-red-300 font-medium mb-2">Como Corrigir:</h4>
                <ol className="text-sm text-red-200 space-y-1 list-decimal list-inside">
                  <li>Abra <code className="bg-red-800/50 px-1 rounded">src/hooks/character-creation/useCharacterCreationOrchestrator.tsx</code></li>
                  <li>Encontre a linha: <code className="bg-red-800/50 px-1 rounded">const isSpellcaster = !characterClass.spellcasting;</code></li>
                  <li>Substitua por: <code className="bg-green-800/50 px-1 rounded">const isSpellcaster = !!characterClass.spellcasting;</code></li>
                  <li>Salve o arquivo e recarregue a página</li>
                </ol>
              </div>

              <div className="text-xs text-red-300 font-mono bg-red-900/30 p-2 rounded">
                DEBUG: hasSpellcasting={String(!!characterData.characterClass?.spellcasting)} | 
                isSpellcaster={String(characterData.isSpellcaster)} | 
                className={characterData.characterClass?.name}
              </div>
            </div>
          </div>
        </div>
        
        <DebugPanel 
          characterData={characterData}
          spellsHook={spellsHook}
          currentClassIndex={currentClassIndex}
          spellsFromAPI={spellsFromAPI}
          isLoadingSpells={isLoadingSpells}
          hasSpellcasterBug={hasSpellcasterBug}
          hasDataPropagationBug={hasDataPropagationBug}
        />
      </div>
    );
  }

  if (isLoadingSpells) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Carregando Magias
        </h3>
        <p className="text-gray-500">
          Buscando magias da API do D&D...
        </p>
        {debugLogs.length > 0 && (
          <div className="mt-4 text-xs text-gray-400 max-w-md">
            <strong>Últimas ações:</strong>
            {debugLogs.slice(-3).map((log, i) => (
              <div key={i} className="truncate">• {log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (spellsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-300 mb-2">
          Erro ao Carregar Magias
        </h3>
        <p className="text-gray-500 mb-4">
          Não foi possível carregar as magias da API do D&D: {spellsError.message}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!spellsHook.isSpellcaster) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Não é um Conjurador
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Sua classe não possui habilidades de conjuração.
            Você pode pular esta etapa.
          </p>
          {characterData.characterClass && (
            <p className="text-xs text-gray-400 mt-2">
              Classe: {characterData.characterClass.name} ({characterData.characterClass.index})
            </p>
          )}
        </div>
        
        <DebugPanel 
          characterData={characterData}
          spellsHook={spellsHook}
          currentClassIndex={currentClassIndex}
          spellsFromAPI={spellsFromAPI}
          isLoadingSpells={isLoadingSpells}
          hasSpellcasterBug={hasSpellcasterBug}
          hasDataPropagationBug={hasDataPropagationBug}
        />
      </div>
    );
  }

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-6">
      {/* Header com informações de status */}
      <div className="bg-blue-800/20 rounded-xl p-4 border border-blue-700/50">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <p className="text-sm text-blue-300">
              <span className="font-medium">✅ Conjurador Ativo:</span> {allAvailableSpells.length} magias disponíveis
            </p>
            {currentClassIndex && (
              <p className="text-xs text-blue-400 mt-1">
                {characterData.characterClass?.name} • Cantrips: {spellsHook.selectedCantrips.length}/{spellsHook.cantripsKnown} • Magias: {spellsHook.selectedSpells.length}/{spellsHook.spellsKnown}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spellcasting Info */}
      {spellsHook.spellcastingInfo && (
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
                    {spellsHook.spellcastingInfo.ability.charAt(0).toUpperCase() + spellsHook.spellcastingInfo.ability.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">CD de Resistência:</span>
                  <span className="text-white ml-2 font-medium">
                    {spellsHook.spellcastingInfo.spellSaveDC}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Bônus de Ataque:</span>
                  <span className="text-white ml-2 font-medium">
                    +{spellsHook.spellcastingInfo.spellAttackBonus}
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
      )}

      {/* Tabs de Seleção */}
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
              {spellsHook.selectedCantrips.length}/{spellsHook.cantripsKnown}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('spells')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all ${
            activeTab === 'spells'
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Magias</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {spellsHook.selectedSpells.length}/{spellsHook.spellsKnown}
            </span>
          </div>
        </button>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar magias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
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

      {/* Lista de Magias */}
      <div className="space-y-3">
        {filteredSpells.map((spell) => (
          <SpellCard
            key={spell.index}
            spell={spell}
            isSelected={spell.level === 0 ? spellsHook.isKnownCantrip(spell.index) : spellsHook.isKnownSpell(spell.index)}
            onToggle={() => handleToggleSpell(spell)}
            canSelect={canSelectSpell(spell)}
            isCantrip={spell.level === 0}
            spellcastingInfo={spellsHook.spellcastingInfo}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSpells.length === 0 && !isLoadingSpells && (
        <div className="text-center py-12">
          <MagicIcon className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhuma magia encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Resumo das Magias Selecionadas */}
      {(spellsHook.selectedCantrips.length > 0 || spellsHook.selectedSpells.length > 0) && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Magias Selecionadas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Truques</h5>
              {spellsHook.selectedCantrips.map(spell => (
                <div key={spell.index} className="text-sm text-gray-400 mb-1">
                  • {spell.name}
                </div>
              ))}
              {spellsHook.selectedCantrips.length === 0 && (
                <p className="text-xs text-gray-500">Nenhum truque selecionado</p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Magias</h5>
              {spellsHook.selectedSpells.map(spell => (
                <div key={spell.index} className="text-sm text-gray-400 mb-1">
                  • {spell.name} (Nível {spell.level})
                </div>
              ))}
              {spellsHook.selectedSpells.length === 0 && (
                <p className="text-xs text-gray-500">Nenhuma magia selecionada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel 
        characterData={characterData}
        spellsHook={spellsHook}
        currentClassIndex={currentClassIndex}
        spellsFromAPI={spellsFromAPI}
        isLoadingSpells={isLoadingSpells}
        hasSpellcasterBug={hasSpellcasterBug}
        hasDataPropagationBug={hasDataPropagationBug}
      />
    </div>
  );
}

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-6">
      {/* Header com informações de status */}
      <div className="bg-blue-800/20 rounded-xl p-4 border border-blue-700/50">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <p className="text-sm text-blue-300">
              <span className="font-medium">✅ Conjurador Ativo:</span> {allAvailableSpells.length} magias disponíveis
            </p>
            {currentClassIndex && (
              <p className="text-xs text-blue-400 mt-1">
                {characterData.characterClass?.name} • Cantrips: {spellsHook.selectedCantrips.length}/{spellsHook.cantripsKnown} • Magias: {spellsHook.selectedSpells.length}/{spellsHook.spellsKnown}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spellcasting Info */}
      {spellsHook.spellcastingInfo && (
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
                    {spellsHook.spellcastingInfo.ability.charAt(0).toUpperCase() + spellsHook.spellcastingInfo.ability.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">CD de Resistência:</span>
                  <span className="text-white ml-2 font-medium">
                    {spellsHook.spellcastingInfo.spellSaveDC}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Bônus de Ataque:</span>
                  <span className="text-white ml-2 font-medium">
                    +{spellsHook.spellcastingInfo.spellAttackBonus}
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
      )}

      {/* Tabs de Seleção */}
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
              {spellsHook.selectedCantrips.length}/{spellsHook.cantripsKnown}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('spells')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all ${
            activeTab === 'spells'
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Magias</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {spellsHook.selectedSpells.length}/{spellsHook.spellsKnown}
            </span>
          </div>
        </button>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar magias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
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

      {/* Lista de Magias */}
      <div className="space-y-3">
        {filteredSpells.map((spell) => (
          <SpellCard
            key={spell.index}
            spell={spell}
            isSelected={spell.level === 0 ? spellsHook.isKnownCantrip(spell.index) : spellsHook.isKnownSpell(spell.index)}
            onToggle={() => handleToggleSpell(spell)}
            canSelect={canSelectSpell(spell)}
            isCantrip={spell.level === 0}
            spellcastingInfo={spellsHook.spellcastingInfo}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSpells.length === 0 && !isLoadingSpells && (
        <div className="text-center py-12">
          <MagicIcon className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhuma magia encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Resumo das Magias Selecionadas */}
      {(spellsHook.selectedCantrips.length > 0 || spellsHook.selectedSpells.length > 0) && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Magias Selecionadas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Truques</h5>
              {spellsHook.selectedCantrips.map(spell => (
                <div key={spell.index} className="text-sm text-gray-400 mb-1">
                  • {spell.name}
                </div>
              ))}
              {spellsHook.selectedCantrips.length === 0 && (
                <p className="text-xs text-gray-500">Nenhum truque selecionado</p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Magias</h5>
              {spellsHook.selectedSpells.map(spell => (
                <div key={spell.index} className="text-sm text-gray-400 mb-1">
                  • {spell.name} (Nível {spell.level})
                </div>
              ))}
              {spellsHook.selectedSpells.length === 0 && (
                <p className="text-xs text-gray-500">Nenhuma magia selecionada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel 
        characterData={characterData}
        spellsHook={spellsHook}
        currentClassIndex={currentClassIndex}
        spellsFromAPI={spellsFromAPI}
        isLoadingSpells={isLoadingSpells}
      />
    </div>
  );
}