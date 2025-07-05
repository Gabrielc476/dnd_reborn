// ===========================
// NPCSLIST COMPLETO COM INTEGRAÇÃO ENHANCED
// src/components/campaign-manage/NPCsList.tsx
// ===========================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Skull, 
  MapPin, 
  Search,
  RefreshCw,
  User,
  Target,
  Filter,
  Grid,
  List,
  Swords,
  Wand2,
  Shield,
  Dice6,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Settings,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  RotateCcw
} from 'lucide-react';

// Hooks e contextos
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';
import { campaignAPI } from '@/api/campaignAPI';

// Componentes Enhanced
import { DiceRoller, AttackRoller, SpellRoller, HPManager } from '@/components/DiceComponents';
import { EnhancedNPCModal } from '@/components/npc/EnhancedNPCModal';

// Tipos
import { NPC, NPCType } from '@/types/manageCampaign';
import { EnhancedNPC, RollResult, CreateEnhancedNPCRequest, UpdateEnhancedNPCRequest } from '@/types/enhancedNPC';

// ===========================
// INTERFACES E TIPOS
// ===========================

interface RollHistoryEntry {
  npcId: string;
  npcName: string;
  type: string;
  result: RollResult;
  description: string;
  timestamp: Date;
}

type ViewMode = 'grid' | 'list' | 'combat';
type ModalMode = 'create' | 'edit' | 'view' | null;

// ===========================
// FUNÇÕES AUXILIARES
// ===========================

const getNPCTypeColor = (type: NPCType) => {
  const colors = {
    [NPCType.ALLY]: 'text-green-400 bg-green-400/10 border-green-400/20',
    [NPCType.ENEMY]: 'text-red-400 bg-red-400/10 border-red-400/20',
    [NPCType.NEUTRAL]: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    [NPCType.MERCHANT]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    [NPCType.QUEST_GIVER]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    [NPCType.BACKGROUND]: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };
  return colors[type] || colors[NPCType.NEUTRAL];
};

const getNPCTypeLabel = (type: NPCType) => {
  const labels = {
    [NPCType.ALLY]: 'Aliado',
    [NPCType.ENEMY]: 'Inimigo',
    [NPCType.NEUTRAL]: 'Neutro',
    [NPCType.MERCHANT]: 'Mercador',
    [NPCType.QUEST_GIVER]: 'Quest Giver',
    [NPCType.BACKGROUND]: 'Background'
  };
  return labels[type] || 'Neutro';
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export const NPCsList: React.FC = () => {
  // Contexto legado (mantém compatibilidade)
  const { campaign, isGM } = useManageCampaignContext();

  // Hook Enhanced integrado
  const {
    npcs,
    isLoading,
    error,
    createNPC,
    updateNPC,
    deleteNPC,
    rollAttack,
    rollDamage,
    castSpell,
    updateHitPoints,
    healNPC,
    damageNPC,
    killNPC,
    reviveNPC,
    searchNPCs,
    setSelectedNPC,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredNPCs,
    stats
  } = useEnhancedNPCs({ 
    campaignId: campaign?.id || '',
    autoLoad: true,
    enableRealTimeUpdates: true
  });

  // ===========================
  // ESTADOS LOCAIS
  // ===========================

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NPCType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [combatMode, setCombatMode] = useState(false);
  
  // Estados do modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingNPC, setEditingNPC] = useState<EnhancedNPC | null>(null);
  
  // Estados do sistema de dados
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNPCs, setSelectedNPCs] = useState<Set<string>>(new Set());

  // ===========================
  // EFEITOS
  // ===========================

  // Listener para abrir modal de criação via evento do sidebar
  useEffect(() => {
    const handleCreateNPCEvent = () => {
      if (isGM) {
        handleCreateNPC();
      }
    };

    document.addEventListener('create-npc-modal', handleCreateNPCEvent);
    
    return () => {
      document.removeEventListener('create-npc-modal', handleCreateNPCEvent);
    };
  }, [isGM]);

  // ===========================
  // HANDLERS DE MODAL
  // ===========================

  const handleCreateNPC = useCallback(() => {
    setEditingNPC(null);
    setModalMode('create');
  }, []);

  const handleEditNPC = useCallback((npc: EnhancedNPC) => {
    setEditingNPC(npc);
    setModalMode('edit');
    setSelectedNPC(npc);
  }, [setSelectedNPC]);

  const handleViewNPC = useCallback((npc: EnhancedNPC) => {
    setEditingNPC(npc);
    setModalMode('view');
    setSelectedNPC(npc);
  }, [setSelectedNPC]);

  const handleModalSave = useCallback(async (npcData: CreateEnhancedNPCRequest | UpdateEnhancedNPCRequest) => {
    try {
      if (modalMode === 'create') {
        await createNPC({
          ...npcData,
          campaign_id: campaign?.id || ''
        } as CreateEnhancedNPCRequest);
      } else if (modalMode === 'edit' && editingNPC) {
        await updateNPC(editingNPC.id!, npcData as UpdateEnhancedNPCRequest);
      }
      
      setModalMode(null);
      setEditingNPC(null);
    } catch (error) {
      console.error('Erro ao salvar NPC:', error);
    }
  }, [modalMode, editingNPC, createNPC, updateNPC, campaign?.id]);

  const handleModalClose = useCallback(() => {
    setModalMode(null);
    setEditingNPC(null);
  }, []);

  // ===========================
  // HANDLERS DE ROLAGEM
  // ===========================

  const addToRollHistory = useCallback((npcId: string, npcName: string, type: string, result: RollResult, description: string) => {
    const entry: RollHistoryEntry = {
      npcId,
      npcName,
      type,
      result,
      description,
      timestamp: new Date()
    };
    setRollHistory(prev => [entry, ...prev.slice(0, 19)]); // Manter 20 entradas
  }, []);

  const handleQuickAttack = useCallback(async (npc: EnhancedNPC, attackId: string, advantage?: boolean, disadvantage?: boolean) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      const result = await rollAttack(npc.id!, attackId, { advantage, disadvantage });
      const attack = npc.attacks?.find(a => a.id === attackId);
      
      let description = `Ataque: ${attack?.name || 'Desconhecido'}`;
      if (advantage) description += ' (Vantagem)';
      if (disadvantage) description += ' (Desvantagem)';
      
      addToRollHistory(npc.id!, npc.name, 'attack', result, description);
    } catch (error) {
      console.error('Erro na rolagem de ataque:', error);
    } finally {
      setIsRolling(false);
    }
  }, [rollAttack, addToRollHistory, isRolling]);

  const handleQuickDamage = useCallback(async (npc: EnhancedNPC, attackId: string, critical?: boolean) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      const result = await rollDamage(npc.id!, attackId, { critical });
      const attack = npc.attacks?.find(a => a.id === attackId);
      
      let description = `Dano: ${attack?.name || 'Desconhecido'}`;
      if (critical) description += ' (CRÍTICO)';
      
      addToRollHistory(npc.id!, npc.name, 'damage', result, description);
    } catch (error) {
      console.error('Erro na rolagem de dano:', error);
    } finally {
      setIsRolling(false);
    }
  }, [rollDamage, addToRollHistory, isRolling]);

  const handleQuickSpell = useCallback(async (npc: EnhancedNPC, spellName: string, spellLevel?: number) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      const result = await castSpell(npc.id!, spellName, { spellLevel });
      
      let description = `Magia: ${spellName}`;
      if (spellLevel) description += ` (Nível ${spellLevel})`;
      
      if (result) {
        addToRollHistory(npc.id!, npc.name, 'spell', result, description);
      } else {
        // Magia sem rolagem
        addToRollHistory(npc.id!, npc.name, 'spell', {
          total: 0,
          rolls: [],
          modifier: 0,
          formula: spellName,
          timestamp: new Date()
        }, description);
      }
    } catch (error) {
      console.error('Erro na conjuração:', error);
    } finally {
      setIsRolling(false);
    }
  }, [castSpell, addToRollHistory, isRolling]);

  const handleHPChange = useCallback(async (npc: EnhancedNPC, newHP: number, tempHP?: number) => {
    try {
      await updateHitPoints(npc.id!, newHP, tempHP);
    } catch (error) {
      console.error('Erro ao atualizar HP:', error);
    }
  }, [updateHitPoints]);

  const handleQuickHeal = useCallback(async (npc: EnhancedNPC, amount: number) => {
    try {
      await healNPC(npc.id!, amount);
    } catch (error) {
      console.error('Erro ao curar NPC:', error);
    }
  }, [healNPC]);

  const handleQuickDamageHP = useCallback(async (npc: EnhancedNPC, amount: number) => {
    try {
      await damageNPC(npc.id!, amount);
    } catch (error) {
      console.error('Erro ao aplicar dano:', error);
    }
  }, [damageNPC]);

  // ===========================
  // HANDLERS DE BUSCA E FILTROS
  // ===========================

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
    searchNPCs(query);
  }, [searchNPCs]);

  const handleFilterChange = useCallback((type: NPCType | 'all') => {
    setFilterType(type);
    if (type === 'all') {
      setFilters({ ...filters, npc_type: undefined });
    } else {
      setFilters({ ...filters, npc_type: [type] });
    }
  }, [filters, setFilters]);

  const handleSortChange = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder, setSortBy, setSortOrder]);

  // ===========================
  // HANDLERS DE SELEÇÃO
  // ===========================

  const handleNPCSelect = useCallback((npcId: string, selected: boolean) => {
    setSelectedNPCs(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(npcId);
      } else {
        newSet.delete(npcId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedNPCs.size === filteredNPCs.length) {
      setSelectedNPCs(new Set());
    } else {
      setSelectedNPCs(new Set(filteredNPCs.map(npc => npc.id!)));
    }
  }, [selectedNPCs.size, filteredNPCs]);

  // ===========================
  // COMPONENTE NPC CARD
  // ===========================

  const NPCCard: React.FC<{ npc: EnhancedNPC }> = ({ npc }) => {
    const currentHP = npc.stats?.current_hit_points ?? npc.stats?.hit_points ?? 0;
    const maxHP = npc.stats?.hit_points ?? 0;
    const tempHP = npc.stats?.temporary_hit_points ?? 0;
    const isSelected = selectedNPCs.has(npc.id!);

    return (
      <div className={`bg-gray-800 rounded-lg border transition-colors p-4 ${
        isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600'
      }`}>
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Checkbox de seleção */}
            {combatMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleNPCSelect(npc.id!, e.target.checked)}
                className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-600"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{npc.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-400">
                  {npc.race} {npc.npc_class}
                </p>
                {npc.challenge_rating && (
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                    CR {npc.challenge_rating}
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs border ${getNPCTypeColor(npc.npc_type)}`}>
                  {getNPCTypeLabel(npc.npc_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Status e menu */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${npc.is_alive ? 'bg-green-500' : 'bg-red-500'}`} />
            
            {/* Menu de ações */}
            <div className="relative group">
              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 min-w-40">
                <div className="py-1">
                  <button
                    onClick={() => handleViewNPC(npc)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Detalhes</span>
                  </button>
                  
                  {isGM && (
                    <>
                      <button
                        onClick={() => handleEditNPC(npc)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          // Implementar duplicação
                          console.log('Duplicar NPC:', npc.name);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Duplicar</span>
                      </button>
                      
                      <div className="border-t border-gray-600 my-1"></div>
                      
                      {npc.is_alive ? (
                        <button
                          onClick={() => killNPC(npc.id!)}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <Skull className="w-3 h-3" />
                          <span>Matar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reviveNPC(npc.id!)}
                          className="w-full px-3 py-2 text-left text-sm text-green-400 hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <Heart className="w-3 h-3" />
                          <span>Reviver</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNPC(npc.id!)}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas básicas */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div className="text-center">
            <div className="text-gray-400">CA</div>
            <div className="text-white font-semibold">{npc.stats?.armor_class || 10}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">HP</div>
            <div className="text-white font-semibold">
              {currentHP}/{maxHP}
              {tempHP > 0 && <span className="text-blue-400 ml-1">+{tempHP}</span>}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Vel</div>
            <div className="text-white font-semibold">{npc.stats?.speed || '30 ft'}</div>
          </div>
        </div>

        {/* HP Manager (apenas para GM) */}
        {isGM && npc.is_alive && (
          <div className="mb-3">
            <HPManager
              currentHP={currentHP}
              maxHP={maxHP}
              tempHP={tempHP}
              onHPChange={(newHP, newTempHP) => handleHPChange(npc, newHP, newTempHP)}
              compact={true}
              disabled={isRolling}
            />
          </div>
        )}

        {/* Botões rápidos de HP para combate */}
        {combatMode && isGM && npc.is_alive && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">HP Rápido</div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleQuickHeal(npc, 5)}
                disabled={isRolling}
                className="flex-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors disabled:opacity-50"
              >
                +5 HP
              </button>
              <button
                onClick={() => handleQuickDamageHP(npc, 5)}
                disabled={isRolling}
                className="flex-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors disabled:opacity-50"
              >
                -5 HP
              </button>
            </div>
          </div>
        )}

        {/* Ataques rápidos em modo combate */}
        {combatMode && npc.attacks && npc.attacks.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2">Ataques Rápidos</div>
            <div className="space-y-1">
              {npc.attacks.slice(0, 2).map(attack => (
                <div key={attack.id} className="flex items-center space-x-1">
                  <button
                    onClick={() => handleQuickAttack(npc, attack.id!)}
                    disabled={isRolling}
                    className="flex-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50 truncate"
                  >
                    {attack.name} +{attack.attack_bonus}
                  </button>
                  <button
                    onClick={() => handleQuickDamage(npc, attack.id!)}
                    disabled={isRolling}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors disabled:opacity-50"
                  >
                    DMG
                  </button>
                  
                  {/* Botões de vantagem/desvantagem */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleQuickAttack(npc, attack.id!, true)}
                      disabled={isRolling}
                      className="p-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors disabled:opacity-50"
                      title="Vantagem"
                    >
                      <TrendingUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleQuickAttack(npc, attack.id!, false, true)}
                      disabled={isRolling}
                      className="p-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors disabled:opacity-50"
                      title="Desvantagem"
                    >
                      <TrendingDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Magias rápidas em modo combate */}
        {combatMode && npc.spellcasting?.is_spellcaster && npc.spellcasting.spells_known && npc.spellcasting.spells_known.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2">Magias Rápidas</div>
            <div className="space-y-1">
              {npc.spellcasting.spells_known.slice(0, 2).map(spell => (
                <button
                  key={spell.id}
                  onClick={() => handleQuickSpell(npc, spell.name)}
                  disabled={isRolling}
                  className="w-full px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-xs transition-colors disabled:opacity-50 truncate"
                >
                  {spell.name} {spell.level > 0 && `(${spell.level})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Informações contextuais */}
        <div className="text-xs text-gray-500 space-y-1">
          {npc.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{npc.location}</span>
            </div>
          )}
          {npc.faction && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span className="truncate">{npc.faction}</span>
            </div>
          )}
          {npc.occupation && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="truncate">{npc.occupation}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===========================
  // COMPONENTE SIDEBAR DE COMBATE
  // ===========================

  const CombatSidebar: React.FC = () => (
    <div className="w-80 space-y-4">
      {/* Controles de combate */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Controles de Combate</h3>
        
        {selectedNPCs.size > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
            <div className="text-blue-400 text-sm font-medium mb-2">
              {selectedNPCs.size} NPCs selecionados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  selectedNPCs.forEach(npcId => {
                    const npc = npcs.find(n => n.id === npcId);
                    if (npc) handleQuickHeal(npc, 5);
                  });
                }}
                className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                Curar Todos +5
              </button>
              <button
                onClick={() => {
                  selectedNPCs.forEach(npcId => {
                    const npc = npcs.find(n => n.id === npcId);
                    if (npc) handleQuickDamageHP(npc, 5);
                  });
                }}
                className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                Dano -5
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Histórico de rolagens */}
      {rollHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Histórico de Rolagens</h3>
            <button
              onClick={() => setRollHistory([])}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Limpar
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rollHistory.map((entry, index) => (
              <div key={index} className="bg-gray-700 rounded p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium truncate">{entry.npcName}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {entry.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="text-gray-300 mb-1">{entry.description}</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-400">{entry.result.total}</span>
                  <span className="text-gray-400">{entry.result.formula}</span>
                  {entry.result.rolls.length > 1 && (
                    <span className="text-xs text-gray-500">
                      [{entry.result.rolls.join(', ')}]
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas da campanha */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.alive}</div>
            <div className="text-gray-400">Vivos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.dead}</div>
            <div className="text-gray-400">Mortos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.spellcasters}</div>
            <div className="text-gray-400">Conjuradores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.withAttacks}</div>
            <div className="text-gray-400">Com Ataques</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Erro ao carregar NPCs</span>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Recarregar Página</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">NPCs da Campanha</h2>
          <p className="text-gray-400">
            {stats.total} NPCs • {stats.alive} vivos • {stats.spellcasters} conjuradores • {stats.withAttacks} com ataques
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botões de visualização */}
          <div className="flex bg-gray-800 rounded-lg border border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle modo combate */}
          <button
            onClick={() => setCombatMode(!combatMode)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              combatMode 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>{combatMode ? 'Sair do Combate' : 'Modo Combate'}</span>
          </button>

          {isGM && (
            <button
              onClick={handleCreateNPC}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo NPC</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar NPCs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value as NPCType | 'all')}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">Todos os Tipos</option>
          {Object.values(NPCType).map(type => (
            <option key={type} value={type}>{getNPCTypeLabel(type)}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 border rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>

        {combatMode && filteredNPCs.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            {selectedNPCs.size === filteredNPCs.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.is_alive === undefined ? 'all' : filters.is_alive ? 'alive' : 'dead'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    is_alive: value === 'all' ? undefined : value === 'alive'
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">Todos</option>
                <option value="alive">Vivos</option>
                <option value="dead">Mortos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ativo</label>
              <select
                value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    is_active: value === 'all' ? undefined : value === 'active'
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Conjuradores</label>
              <select
                value={filters.is_spellcaster === undefined ? 'all' : filters.is_spellcaster ? 'yes' : 'no'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    is_spellcaster: value === 'all' ? undefined : value === 'yes'
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">Todos</option>
                <option value="yes">Conjuradores</option>
                <option value="no">Não conjuradores</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ordenação</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="name">Nome</option>
                  <option value="npc_type">Tipo</option>
                  <option value="challenge_rating">CR</option>
                  <option value="location">Localização</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white hover:bg-gray-600 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex gap-6">
        {/* Lista de NPCs */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Carregando NPCs...</p>
              </div>
            </div>
          ) : filteredNPCs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Nenhum NPC encontrado com os filtros aplicados'
                  : 'Nenhum NPC criado ainda'
                }
              </p>
              {isGM && !searchTerm && Object.keys(filters).length === 0 && (
                <button
                  onClick={handleCreateNPC}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Criar primeiro NPC
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {filteredNPCs.map(npc => (
                <NPCCard key={npc.id} npc={npc} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar de combate */}
        {combatMode && <CombatSidebar />}
      </div>

      {/* Modal Enhanced */}
      {modalMode && (
        <EnhancedNPCModal
          isOpen={true}
          onClose={handleModalClose}
          onSave={handleModalSave}
          npc={editingNPC || undefined}
          campaignId={campaign?.id || ''}
          mode={modalMode}
        />
      )}
    </div>
  );
};