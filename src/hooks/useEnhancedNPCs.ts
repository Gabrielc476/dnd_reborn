// ===========================
// HOOK CUSTOMIZADO PARA GERENCIAMENTO DE NPCs - VERSÃO ATUALIZADA
// src/hooks/useEnhancedNPCs.ts - Integração com sistema de dados
// ===========================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { campaignAPI } from '@/api/campaignAPI'; // API atualizada
import { npcUtilities, rollDice } from '@/lib/npcUtilities'; // Utilities existentes
import {
  EnhancedNPC,
  CreateEnhancedNPCRequest,
  UpdateEnhancedNPCRequest,
  NPCSearchFilters,
  NPCSearchResult,
  RollResult,
  DiceRoll,
  Attack,
  Spell,
  NPCType
} from '@/types/enhancedNPC';

// ===========================
// INTERFACES ATUALIZADAS
// ===========================

interface UseEnhancedNPCsOptions {
  campaignId: string;
  autoLoad?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface UseEnhancedNPCsReturn {
  // Estados principais
  npcs: EnhancedNPC[];
  selectedNPC: EnhancedNPC | null;
  isLoading: boolean;
  error: string | null;
  
  // Operações CRUD
  createNPC: (data: CreateEnhancedNPCRequest) => Promise<EnhancedNPC>;
  updateNPC: (id: string, data: UpdateEnhancedNPCRequest) => Promise<EnhancedNPC>;
  deleteNPC: (id: string) => Promise<boolean>;
  
  // NOVOS: Métodos de rolagem
  rollAttack: (npcId: string, attackId: string, options?: { advantage?: boolean; disadvantage?: boolean }) => Promise<RollResult>;
  rollDamage: (npcId: string, attackId: string, options?: { critical?: boolean }) => Promise<RollResult>;
  castSpell: (npcId: string, spellId: string, options?: { spellLevel?: number }) => Promise<RollResult | null>;
  
  // NOVOS: Gerenciamento de HP
  updateHitPoints: (npcId: string, newHP: number, tempHP?: number) => Promise<boolean>;
  healNPC: (npcId: string, amount: number) => Promise<boolean>;
  damageNPC: (npcId: string, amount: number) => Promise<boolean>;
  killNPC: (npcId: string) => Promise<boolean>;
  reviveNPC: (npcId: string) => Promise<boolean>;
  
  // Busca e filtros
  searchNPCs: (query: string) => void;
  setSelectedNPC: (npc: EnhancedNPC | null) => void;
  
  // Estados de filtros
  filters: NPCSearchFilters;
  setFilters: (filters: NPCSearchFilters) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // NPCs processados
  filteredNPCs: EnhancedNPC[];
  
  // Estatísticas
  stats: {
    total: number;
    alive: number;
    dead: number;
    active: number;
    inactive: number;
    spellcasters: number;
    withAttacks: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
    byFaction: Record<string, number>;
  };
  
  // Operações em lote
  bulkUpdate: (ids: string[], updates: Partial<EnhancedNPC>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Importação/Exportação
  exportNPCs: (format: 'json' | 'csv') => string;
  importNPCs: (data: any[], format: 'json' | 'csv') => Promise<EnhancedNPC[]>;
  
  // Backup e restore
  createBackup: () => any;
  restoreFromBackup: (backup: any) => Promise<void>;
}

// ===========================
// HOOK PRINCIPAL ATUALIZADO
// ===========================

export function useEnhancedNPCs({
  campaignId,
  autoLoad = true,
  enableRealTimeUpdates = false
}: UseEnhancedNPCsOptions): UseEnhancedNPCsReturn {
  
  // ===========================
  // ESTADOS PRINCIPAIS
  // ===========================
  
  const [npcs, setNpcs] = useState<EnhancedNPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<EnhancedNPC | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NPCSearchFilters>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ===========================
  // INTEGRAÇÃO COM API ATUALIZADA
  // ===========================
  
  const loadNPCs = useCallback(async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando NPCs Enhanced da campanha:', campaignId);
      
      // Usar método unificado da API atualizada
      const response = await campaignAPI.getNPCsUnified(campaignId, true);
      
      if (response && response.npcs && Array.isArray(response.npcs)) {
        setNpcs(response.npcs);
        console.log(`✅ ${response.npcs.length} NPCs Enhanced carregados`);
      } else {
        console.warn('⚠️ Resposta da API não contém NPCs válidos:', response);
        setNpcs([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar NPCs Enhanced:', err);
      setError(`Erro ao carregar NPCs: ${err}`);
      setNpcs([]);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  // ===========================
  // OPERAÇÕES CRUD ATUALIZADAS
  // ===========================
  
  const createNPC = useCallback(async (data: CreateEnhancedNPCRequest): Promise<EnhancedNPC> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🆕 Criando novo NPC Enhanced:', data.name);
      
      const response = await campaignAPI.createEnhancedNPC(campaignId, data);
      
      if (response.success && response.npc_id) {
        await loadNPCs(); // Recarregar lista
        
        const newNPC = npcs.find(npc => npc.id === response.npc_id);
        if (newNPC) {
          console.log(`✅ NPC Enhanced ${data.name} criado com sucesso`);
          return newNPC;
        }
      }
      
      throw new Error(response.error || 'Falha ao criar NPC');
    } catch (err) {
      console.error('❌ Erro ao criar NPC Enhanced:', err);
      setError(`Erro ao criar NPC: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, loadNPCs, npcs]);

  const updateNPC = useCallback(async (id: string, data: UpdateEnhancedNPCRequest): Promise<EnhancedNPC> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Atualizando NPC Enhanced:', id);
      
      const response = await campaignAPI.updateEnhancedNPC(campaignId, id, data);
      
      if (response.success) {
        // Atualizar NPC localmente
        setNpcs(prev => prev.map(npc => 
          npc.id === id ? { ...npc, ...data } : npc
        ));
        
        if (selectedNPC?.id === id) {
          setSelectedNPC(prev => prev ? { ...prev, ...data } : null);
        }
        
        const updatedNPC = npcs.find(npc => npc.id === id);
        if (updatedNPC) {
          return { ...updatedNPC, ...data };
        }
      }
      
      throw new Error(response.error || 'Falha ao atualizar NPC');
    } catch (err) {
      console.error('❌ Erro ao atualizar NPC Enhanced:', err);
      setError(`Erro ao atualizar NPC: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, npcs, selectedNPC]);

  const deleteNPC = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await campaignAPI.deleteEnhancedNPC(campaignId, id);
      if (response.success) {
        setNpcs(prev => prev.filter(npc => npc.id !== id));
        if (selectedNPC?.id === id) setSelectedNPC(null);
        return true;
      }
      return false;
    } catch (err) {
      setError(`Erro ao deletar NPC: ${err}`);
      return false;
    }
  }, [campaignId, selectedNPC]);

  // ===========================
  // SISTEMA DE ROLAGEM INTEGRADO
  // ===========================
  
  const rollAttack = useCallback(async (
    npcId: string, 
    attackId: string, 
    options: { advantage?: boolean; disadvantage?: boolean } = {}
  ): Promise<RollResult> => {
    try {
      console.log('🎲 Rolando ataque para NPC:', npcId);
      
      // Tentar usar API do servidor primeiro
      const response = await campaignAPI.rollDiceForNPC(campaignId, npcId, {
        roll_type: 'attack',
        target_id: attackId,
        advantage: options.advantage,
        disadvantage: options.disadvantage
      });
      
      if (response.success && response.result) {
        console.log(`✅ Rolagem de ataque: ${response.result.total}`);
        return response.result;
      }
      
      throw new Error(response.error || 'Falha na rolagem');
    } catch (err) {
      console.warn('❌ Erro na API, usando rolagem local:', err);
      
      // Fallback para rolagem local usando utilities existentes
      const npc = npcs.find(n => n.id === npcId);
      const attack = npc?.attacks?.find(a => a.id === attackId);
      
      if (attack) {
        const roll: DiceRoll = {
          dice_count: 1,
          dice_sides: 20,
          modifier: attack.attack_bonus
        };
        
        return rollDice(roll, options.advantage, options.disadvantage);
      }
      
      throw err;
    }
  }, [campaignId, npcs]);

  const rollDamage = useCallback(async (
    npcId: string, 
    attackId: string, 
    options: { critical?: boolean } = {}
  ): Promise<RollResult> => {
    try {
      console.log('🎲 Rolando dano para NPC:', npcId);
      
      const response = await campaignAPI.rollDiceForNPC(campaignId, npcId, {
        roll_type: 'damage',
        target_id: attackId,
        modifier_override: options.critical ? undefined : undefined
      });
      
      if (response.success && response.result) {
        console.log(`✅ Rolagem de dano: ${response.result.total}`);
        return response.result;
      }
      
      throw new Error(response.error || 'Falha na rolagem');
    } catch (err) {
      console.warn('❌ Erro na API, usando rolagem local:', err);
      
      // Fallback local
      const npc = npcs.find(n => n.id === npcId);
      const attack = npc?.attacks?.find(a => a.id === attackId);
      
      if (attack) {
        let damageRoll = attack.damage;
        
        // Para críticos, dobrar os dados
        if (options.critical) {
          damageRoll = {
            ...attack.damage,
            dice_count: attack.damage.dice_count * 2
          };
        }
        
        return rollDice(damageRoll);
      }
      
      throw err;
    }
  }, [campaignId, npcs]);

  const castSpell = useCallback(async (
    npcId: string, 
    spellId: string, 
    options: { spellLevel?: number } = {}
  ): Promise<RollResult | null> => {
    try {
      console.log('🎲 Conjurando magia ID:', spellId);
      
      const response = await campaignAPI.castSpellForNPC(campaignId, npcId, {
        spell_id: spellId,
        cast_level: options.spellLevel || 1
      });
      
      if (response.success) {
        console.log(`✅ Magia conjurada: ${spellId}`);
        return response.result || null;
      }
      
      throw new Error(response.error || 'Falha na conjuração');
    } catch (err) {
      console.error('❌ Erro na conjuração:', err);
      throw err;
    }
  }, [campaignId]);

  // ===========================
  // GERENCIAMENTO DE HP INTEGRADO
  // ===========================
  
  const updateHitPoints = useCallback(async (
    npcId: string, 
    newHP: number, 
    tempHP?: number
  ): Promise<boolean> => {
    try {
      console.log('❤️ Atualizando HP do NPC:', npcId, 'Novo HP:', newHP);
      
      const response = await campaignAPI.updateNPCHitPoints(campaignId, npcId, {
        npc_id: npcId,
        new_hit_points: newHP,
        temporary_hit_points: tempHP
      });
      
      if (response.success) {
        // Atualizar localmente
        setNpcs(prev => prev.map(npc => 
          npc.id === npcId 
            ? { 
                ...npc, 
                stats: { 
                  ...npc.stats, 
                  current_hit_points: newHP,
                  temporary_hit_points: tempHP
                },
                is_alive: newHP > 0
              } 
            : npc
        ));
        
        if (selectedNPC?.id === npcId) {
          setSelectedNPC(prev => prev ? {
            ...prev,
            stats: { 
              ...prev.stats, 
              current_hit_points: newHP,
              temporary_hit_points: tempHP
            },
            is_alive: newHP > 0
          } : null);
        }
        
        console.log(`✅ HP atualizado para ${newHP}`);
        return true;
      }
      
      throw new Error(response.error || 'Falha ao atualizar HP');
    } catch (err) {
      console.error('❌ Erro ao atualizar HP:', err);
      setError(`Erro ao atualizar HP: ${err}`);
      return false;
    }
  }, [campaignId, selectedNPC]);

  const healNPC = useCallback(async (npcId: string, amount: number): Promise<boolean> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return false;
    
    const currentHP = npc.stats?.current_hit_points ?? npc.stats?.hit_points ?? 0;
    const maxHP = npc.stats?.hit_points ?? 0;
    const newHP = Math.min(currentHP + amount, maxHP);
    
    return updateHitPoints(npcId, newHP, npc.stats?.temporary_hit_points);
  }, [npcs, updateHitPoints]);

  const damageNPC = useCallback(async (npcId: string, amount: number): Promise<boolean> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return false;
    
    const currentHP = npc.stats?.current_hit_points ?? npc.stats?.hit_points ?? 0;
    let tempHP = npc.stats?.temporary_hit_points ?? 0;
    let remainingDamage = amount;
    
    // Aplicar dano aos HP temporários primeiro
    if (tempHP > 0) {
      const tempDamage = Math.min(remainingDamage, tempHP);
      tempHP -= tempDamage;
      remainingDamage -= tempDamage;
    }
    
    // Aplicar dano restante aos HP normais
    const newHP = Math.max(currentHP - remainingDamage, 0);
    
    return updateHitPoints(npcId, newHP, tempHP);
  }, [npcs, updateHitPoints]);

  const killNPC = useCallback(async (npcId: string): Promise<boolean> => {
    return updateHitPoints(npcId, 0);
  }, [updateHitPoints]);

  const reviveNPC = useCallback(async (npcId: string): Promise<boolean> => {
    const npc = npcs.find(n => n.id === npcId);
    return updateHitPoints(npcId, npc?.stats?.hit_points || 1);
  }, [npcs, updateHitPoints]);

  // ===========================
  // BUSCA E FILTROS
  // ===========================
  
  const searchNPCs = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, name: query }));
  }, []);

  const filteredNPCs = useMemo(() => {
    return npcs.filter(npc => {
      if (filters.name && !npc.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.npc_type && filters.npc_type.length > 0 && !filters.npc_type.includes(npc.npc_type)) {
        return false;
      }
      if (filters.is_alive !== undefined && npc.is_alive !== filters.is_alive) {
        return false;
      }
      return true;
    });
  }, [npcs, filters]);

  // ===========================
  // ESTATÍSTICAS
  // ===========================
  
  const stats = useMemo(() => {
    const total = npcs.length;
    const alive = npcs.filter(npc => npc.is_alive).length;
    const spellcasters = npcs.filter(npc => npc.spellcasting?.is_spellcaster).length;
    const withAttacks = npcs.filter(npc => npc.attacks && npc.attacks.length > 0).length;
    
    return {
      total,
      alive,
      dead: total - alive,
      active: npcs.filter(npc => npc.is_active).length,
      inactive: total - npcs.filter(npc => npc.is_active).length,
      spellcasters,
      withAttacks,
      byType: {},
      byLocation: {},
      byFaction: {}
    };
  }, [npcs]);

  // ===========================
  // OPERAÇÕES EM LOTE
  // ===========================
  
  const bulkUpdate = useCallback(async (ids: string[], updates: Partial<EnhancedNPC>): Promise<void> => {
    setIsLoading(true);
    try {
      for (const id of ids) {
        await updateNPC(id, updates as UpdateEnhancedNPCRequest);
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateNPC]);

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      for (const id of ids) {
        await deleteNPC(id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [deleteNPC]);

  // ===========================
  // IMPORTAÇÃO/EXPORTAÇÃO
  // ===========================
  
  const exportNPCs = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      return JSON.stringify(npcs, null, 2);
    } else {
      // Implementar CSV export
      const headers = ['name', 'npc_type', 'location', 'is_alive', 'challenge_rating'];
      const csvContent = [
        headers.join(','),
        ...npcs.map(npc => headers.map(key => (npc as any)[key] || '').join(','))
      ].join('\n');
      return csvContent;
    }
  }, [npcs]);

  const importNPCs = useCallback(async (data: any[], format: 'json' | 'csv'): Promise<EnhancedNPC[]> => {
    const imported: EnhancedNPC[] = [];
    
    for (const item of data) {
      try {
        const created = await createNPC(item);
        imported.push(created);
      } catch (err) {
        console.error('Erro ao importar NPC:', err);
      }
    }
    
    return imported;
  }, [createNPC]);

  // ===========================
  // BACKUP E RESTORE
  // ===========================
  
  const createBackup = useCallback(() => {
    return {
      npcs,
      filters,
      sort: { sortBy, sortOrder },
      timestamp: new Date().toISOString()
    };
  }, [npcs, filters, sortBy, sortOrder]);

  const restoreFromBackup = useCallback(async (backup: any): Promise<void> => {
    setIsLoading(true);
    try {
      await importNPCs(backup.npcs, 'json');
      
      if (backup.filters) setFilters(backup.filters);
      if (backup.sort) {
        setSortBy(backup.sort.sortBy);
        setSortOrder(backup.sort.sortOrder);
      }
      
      console.log('✅ Backup restaurado com sucesso');
    } catch (err) {
      console.error('❌ Erro ao restaurar backup:', err);
      setError(`Erro ao restaurar backup: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [importNPCs]);

  // ===========================
  // EFEITOS
  // ===========================
  
  // Carregar NPCs automaticamente
  useEffect(() => {
    if (autoLoad && campaignId) {
      loadNPCs();
    }
  }, [autoLoad, campaignId, loadNPCs]);

  // Updates em tempo real (implementação futura)
  useEffect(() => {
    if (enableRealTimeUpdates && campaignId) {
      console.log('🔄 Habilitando updates em tempo real para:', campaignId);
      
      return () => {
        console.log('🔄 Desabilitando updates em tempo real');
      };
    }
  }, [enableRealTimeUpdates, campaignId]);

  // ===========================
  // RETORNO COMPLETO
  // ===========================
  
  return {
    // Estados principais
    npcs,
    selectedNPC,
    isLoading,
    error,
    
    // Operações CRUD
    createNPC,
    updateNPC,
    deleteNPC,
    
    // NOVOS: Operações de combate
    rollAttack,
    rollDamage,
    castSpell,
    
    // NOVOS: Operações de status
    updateHitPoints,
    healNPC,
    damageNPC,
    killNPC,
    reviveNPC,
    
    // Busca e filtros
    searchNPCs,
    setSelectedNPC,
    
    // Estados de filtros
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // NPCs processados
    filteredNPCs,
    
    // Estatísticas
    stats,
    
    // Operações em lote
    bulkUpdate,
    bulkDelete,
    
    // Importação/Exportação
    exportNPCs,
    importNPCs,
    
    // Backup e restore
    createBackup,
    restoreFromBackup
  };
}