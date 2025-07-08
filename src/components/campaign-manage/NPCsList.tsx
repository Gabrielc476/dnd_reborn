// ===========================
// NPCSLIST COMPLETO COM INTEGRAÇÃO DO ENHANCEDNPCCARD
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
  RotateCcw,
  Zap,
  Star,
  Clock,
  Activity,
  Sparkles
} from 'lucide-react';

// Hooks e contextos
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';
import { campaignAPI } from '@/api/campaignAPI';

// Componentes Enhanced
import { DiceRoller, AttackRoller, SpellRoller, HPManager } from '@/components/DiceComponents';
import { EnhancedNPCModal } from '@/components/npc/EnhancedNPCModal';
import EnhancedNPCCard from '@/components/npc/EnhancedNPCCard'; // 🔥 IMPORTANDO O CARD MELHORADO

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

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: 'red' | 'yellow' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
}

// ===========================
// COMPONENTE DE CONFIRMAÇÃO
// ===========================

const ConfirmationModal: React.FC<ConfirmDialog & { isOpen: boolean }> = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${colorClasses[confirmColor]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// FUNÇÕES AUXILIARES
// ===========================

const getNPCTypeColor = (type: string) => {
  const colors = {
    'aliado': 'text-green-400 bg-green-400/10 border-green-400/20',
    'inimigo': 'text-red-400 bg-red-400/10 border-red-400/20',
    'neutro': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    'mercador': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'missões': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'cenário': 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };
  return colors[type as keyof typeof colors] || colors['neutro'];
};

const getStatusColor = (isAlive: boolean, isActive: boolean) => {
  if (!isAlive) return 'bg-red-500';
  if (!isActive) return 'bg-yellow-500';
  return 'bg-green-500';
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export const NPCsList: React.FC = () => {
  // Contexto da campanha
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
    filteredNPCs,
    stats
  } = useEnhancedNPCs({ 
    campaignId: campaign?.id || '',
    autoLoad: true,
  });

  // Estados locais
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingNPC, setEditingNPC] = useState<EnhancedNPC | null>(null);
  const [selectedNPCs, setSelectedNPCs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: 'red',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    npcType: '',
    location: '',
    faction: '',
    isAlive: '',
    isActive: ''
  });

  // ===========================
  // FUNÇÕES DE CONFIRMAÇÃO
  // ===========================

  const showConfirmDialog = (config: Omit<ConfirmDialog, 'isOpen' | 'onCancel'>) => {
    setConfirmDialog({
      ...config,
      isOpen: true,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
  };

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
  }, []);

  const handleViewNPC = useCallback((npc: EnhancedNPC) => {
    setEditingNPC(npc);
    setModalMode('view');
  }, []);

  const handleModalSave = useCallback(async (npcData: any) => {
    try {
      if (modalMode === 'create') {
        await createNPC({
          ...npcData,
          campaign_id: campaign?.id || ''
        });
      } else if (modalMode === 'edit' && editingNPC) {
        await updateNPC(editingNPC.id!, npcData);
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
  // HANDLERS DE AÇÕES DOS NPCS
  // ===========================

  const handleDeleteNPC = useCallback((npc: EnhancedNPC) => {
    showConfirmDialog({
      title: 'Deletar NPC',
      message: `Tem certeza que deseja deletar "${npc.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await deleteNPC(npc.id!);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Erro ao deletar NPC:', error);
        }
      }
    });
  }, [deleteNPC]);

  const handleKillNPC = useCallback((npc: EnhancedNPC) => {
    showConfirmDialog({
      title: 'Matar NPC',
      message: `Tem certeza que deseja marcar "${npc.name}" como morto?`,
      confirmText: 'Matar',
      confirmColor: 'yellow',
      onConfirm: async () => {
        try {
          await killNPC(npc.id!);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Erro ao matar NPC:', error);
        }
      }
    });
  }, [killNPC]);

  const handleReviveNPC = useCallback(async (npc: EnhancedNPC) => {
    try {
      await reviveNPC(npc.id!);
    } catch (error) {
      console.error('Erro ao reviver NPC:', error);
    }
  }, [reviveNPC]);

  // ===========================
  // HANDLERS DE COMBATE
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
    setRollHistory(prev => [entry, ...prev.slice(0, 19)]);
  }, []);

  const handleAttackRoll = useCallback(async (npc: EnhancedNPC, attackId: string, options?: { advantage?: boolean; disadvantage?: boolean; critical?: boolean }) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      let result: RollResult;
      let description: string;

      if (options?.critical) {
        // Rolar dano crítico diretamente
        result = await rollDamage(npc.id!, attackId, { critical: true });
        description = 'Dano Crítico';
      } else {
        // Rolar ataque com vantagem/desvantagem
        result = await rollAttack(npc.id!, attackId, { 
          advantage: options?.advantage, 
          disadvantage: options?.disadvantage 
        });
        
        description = 'Ataque';
        if (options?.advantage) description += ' (Vantagem)';
        if (options?.disadvantage) description += ' (Desvantagem)';
      }

      const attack = npc.attacks?.find(a => a.id === attackId);
      addToRollHistory(npc.id!, npc.name, 'attack', result, `${description}: ${attack?.name || 'Desconhecido'}`);
      
    } catch (error) {
      console.error('Erro na rolagem:', error);
    } finally {
      setIsRolling(false);
    }
  }, [rollAttack, rollDamage, addToRollHistory, isRolling]);

  const handleDamageRoll = useCallback(async (npc: EnhancedNPC, attackId: string, options?: { critical?: boolean }) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      const result = await rollDamage(npc.id!, attackId, options);
      const attack = npc.attacks?.find(a => a.id === attackId);
      
      let description = `Dano: ${attack?.name || 'Desconhecido'}`;
      if (options?.critical) description += ' (Crítico)';
      
      addToRollHistory(npc.id!, npc.name, 'damage', result, description);
      
    } catch (error) {
      console.error('Erro na rolagem de dano:', error);
    } finally {
      setIsRolling(false);
    }
  }, [rollDamage, addToRollHistory, isRolling]);

  const handleSpellCast = useCallback(async (npc: EnhancedNPC, spellId: string) => {
    if (isRolling) return;
    
    setIsRolling(true);
    try {
      const result = await castSpell(npc.id!, spellId);
      if (result) {
        const spell = npc.spellcasting?.spells_known?.find(s => s.id === spellId);
        addToRollHistory(npc.id!, npc.name, 'spell', result, `Magia: ${spell?.name || 'Desconhecida'}`);
      }
    } catch (error) {
      console.error('Erro ao lançar magia:', error);
    } finally {
      setIsRolling(false);
    }
  }, [castSpell, addToRollHistory, isRolling]);

  // ===========================
  // HANDLERS DE HP
  // ===========================

  const handleHPChange = useCallback(async (npc: EnhancedNPC, newHP: number, tempHP?: number) => {
    try {
      await updateHitPoints(npc.id!, newHP, tempHP);
    } catch (error) {
      console.error('Erro ao alterar HP:', error);
    }
  }, [updateHitPoints]);

  const handleHeal = useCallback(async (npc: EnhancedNPC, amount: number) => {
    try {
      await healNPC(npc.id!, amount);
    } catch (error) {
      console.error('Erro ao curar:', error);
    }
  }, [healNPC]);

  const handleDamage = useCallback(async (npc: EnhancedNPC, amount: number) => {
    try {
      await damageNPC(npc.id!, amount);
    } catch (error) {
      console.error('Erro ao causar dano:', error);
    }
  }, [damageNPC]);

  // ===========================
  // HANDLERS DE SELEÇÃO
  // ===========================

  const handleToggleSelection = (npcId: string) => {
    setSelectedNPCs(prev => 
      prev.includes(npcId) 
        ? prev.filter(id => id !== npcId)
        : [...prev, npcId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNPCs.length === displayNPCs.length) {
      setSelectedNPCs([]);
    } else {
      setSelectedNPCs(displayNPCs.map(npc => npc.id!));
    }
  };

  const handleBulkDelete = () => {
    if (selectedNPCs.length === 0) return;

    showConfirmDialog({
      title: 'Deletar NPCs Selecionados',
      message: `Tem certeza que deseja deletar ${selectedNPCs.length} NPCs? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar Todos',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          for (const npcId of selectedNPCs) {
            await deleteNPC(npcId);
          }
          setSelectedNPCs([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Erro ao deletar NPCs:', error);
        }
      }
    });
  };

  // ===========================
  // FILTROS E BUSCA
  // ===========================

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const displayNPCs = useMemo(() => {
    return filteredNPCs.filter(npc => {
      // Filtro de busca
      if (searchTerm && !npc.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtros específicos
      if (filters.npcType && npc.npc_type !== filters.npcType) return false;
      if (filters.location && npc.location !== filters.location) return false;
      if (filters.faction && npc.faction !== filters.faction) return false;
      if (filters.isAlive === 'true' && !npc.is_alive) return false;
      if (filters.isAlive === 'false' && npc.is_alive) return false;
      if (filters.isActive === 'true' && !npc.is_active) return false;
      if (filters.isActive === 'false' && npc.is_active) return false;

      return true;
    });
  }, [filteredNPCs, searchTerm, filters]);

  // ===========================
  // RENDERIZAÇÃO PRINCIPAL
  // ===========================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Carregando NPCs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Erro ao carregar NPCs</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>NPCs</span>
          </h2>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">
              <span className="text-green-400 font-semibold">{stats.alive}</span> vivos
            </span>
            <span className="text-gray-400">
              <span className="text-red-400 font-semibold">{stats.dead}</span> mortos
            </span>
            <span className="text-gray-400">
              <span className="text-blue-400 font-semibold">{stats.total}</span> total
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Ações em lote */}
          {isGM && selectedNPCs.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{selectedNPCs.length} selecionados</span>
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                {selectedNPCs.length === displayNPCs.length ? 'Desmarcar' : 'Selecionar'} Todos
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Deletar</span>
              </button>
            </div>
          )}

          {/* Botão criar NPC */}
          {isGM && (
            <button
              onClick={handleCreateNPC}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar NPCs..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filtros rápidos */}
        <select
          value={filters.npcType}
          onChange={(e) => setFilters(prev => ({ ...prev, npcType: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Todos os tipos</option>
          <option value="aliado">Aliados</option>
          <option value="inimigo">Inimigos</option>
          <option value="neutro">Neutros</option>
          <option value="mercador">Mercadores</option>
          <option value="missões">Quest Givers</option>
          <option value="cenário">Background</option>
        </select>

        <select
          value={filters.isAlive}
          onChange={(e) => setFilters(prev => ({ ...prev, isAlive: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Todos</option>
          <option value="true">Vivos</option>
          <option value="false">Mortos</option>
        </select>
      </div>

      {/* Lista de NPCs usando o card melhorado */}
      {displayNPCs.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum NPC encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro NPC'}
          </p>
          {isGM && !searchTerm && (
            <button
              onClick={handleCreateNPC}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Criar Primeiro NPC
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayNPCs.map((npc) => (
            <div key={npc.id} className="relative">
              {/* Checkbox para seleção múltipla */}
              {isGM && (
                <input
                  type="checkbox"
                  checked={selectedNPCs.includes(npc.id!)}
                  onChange={() => handleToggleSelection(npc.id!)}
                  className="absolute top-2 left-2 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 z-10"
                />
              )}
              
              {/* 🔥 USANDO O CARD MELHORADO */}
              <EnhancedNPCCard
                npc={npc}
                isGM={isGM}
                onEdit={() => handleEditNPC(npc)}
                onView={() => handleViewNPC(npc)}
                onDelete={() => handleDeleteNPC(npc)}
                onKill={() => handleKillNPC(npc)}
                onRevive={() => handleReviveNPC(npc)}
                onAttackRoll={(attackId, options) => handleAttackRoll(npc, attackId, options)}
                onDamageRoll={(attackId, options) => handleDamageRoll(npc, attackId, options)}
                onHPChange={(newHP, tempHP) => handleHPChange(npc, newHP, tempHP)}
                onHeal={(amount) => handleHeal(npc, amount)}
                onDamage={(amount) => handleDamage(npc, amount)}
                isRolling={isRolling}
              />
            </div>
          ))}
        </div>
      )}

      {/* Histórico de rolagens (sidebar) */}
      {rollHistory.length > 0 && (
        <div className="fixed right-4 top-20 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-40">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center space-x-2">
                <Dice6 className="w-4 h-4" />
                <span>Histórico de Rolagens</span>
              </h3>
              <button
                onClick={() => setRollHistory([])}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-2 space-y-2">
            {rollHistory.map((entry, index) => (
              <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{entry.npcName}</span>
                  <span className="text-gray-400 text-xs">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-300">{entry.description}</div>
                <div className="text-purple-400 font-semibold">
                  Resultado: {entry.result.total}
                  {entry.result.rolls && ` (${entry.result.rolls.join(', ')})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal do NPC */}
      <EnhancedNPCModal
        isOpen={modalMode !== null}
        onClose={handleModalClose}
        onSave={handleModalSave}
        npc={editingNPC}
        campaignId={campaign?.id || ''}
        mode={modalMode || 'create'}
      />

      {/* Modal de confirmação */}
      <ConfirmationModal {...confirmDialog} />
    </div>
  );
};