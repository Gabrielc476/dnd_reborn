// ===========================
// HOOK CUSTOMIZADO PARA GERENCIAMENTO DE NPCs
// hooks/useEnhancedNPCs.ts
// ===========================

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  NPCType,
  NPCContextData
} from '@/types/enhancedNPC';
import { npcUtilities } from '@/lib/npcUtilities';
import { campaignAPI } from '@/api/campaignAPI';

interface UseEnhancedNPCsOptions {
  campaignId: string;
  autoLoad?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface UseEnhancedNPCsReturn extends NPCContextData {
  // Estados adicionais específicos do hook
  filters: NPCSearchFilters;
  setFilters: (filters: NPCSearchFilters) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // NPCs filtrados e ordenados
  filteredNPCs: EnhancedNPC[];
  
  // Estatísticas
  stats: {
    total: number;
    alive: number;
    dead: number;
    byType: Record<NPCType, number>;
    averageCR: number;
    spellcasters: number;
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
  
  // Estados de filtros e ordenação
  const [filters, setFilters] = useState<NPCSearchFilters>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // ===========================
  // OPERAÇÕES CRUD
  // ===========================
  
  const loadNPCs = useCallback(async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando NPCs da campanha:', campaignId);
      const response = await campaignAPI.getCampaignNPCs(campaignId);
      
      if (response && response.npcs && Array.isArray(response.npcs)) {
        setNpcs(response.npcs);
        console.log(`✅ ${response.npcs.length} NPCs carregados`);
      } else {
        console.warn('⚠️ Resposta da API não contém NPCs válidos:', response);
        setNpcs([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar NPCs:', err);
      setError(`Erro ao carregar NPCs: ${err}`);
      setNpcs([]);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);
  
  const createNPC = useCallback(async (data: CreateEnhancedNPCRequest): Promise<EnhancedNPC> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🆕 Criando novo NPC:', data.name);
      
      // Validar dados antes de enviar
      const validation = npcUtilities.validateNPCData(data as any);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      const response = await campaignAPI.createNPC(campaignId, data);
      
      if (response && response.npc_id) {
        // Recarregar lista para obter o NPC completo
        await loadNPCs();
        
        const newNPC = npcs.find(npc => npc.id === response.npc_id);
        if (newNPC) {
          console.log(`✅ NPC ${data.name} criado com sucesso`);
          return newNPC;
        }
      }
      
      throw new Error('Falha ao criar NPC');
    } catch (err) {
      console.error('❌ Erro ao criar NPC:', err);
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
      console.log('📝 Atualizando NPC:', id);
      
      // Validar dados antes de enviar
      const validation = npcUtilities.validateNPCData(data as any);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      const response = await campaignAPI.updateNPC(id, data);
      
      if (response && response.success) {
        // Atualizar NPC localmente
        setNpcs(prev => prev.map(npc => 
          npc.id === id ? { ...npc, ...data, updated_date: new Date().toISOString() } : npc
        ));
        
        // Atualizar NPC selecionado se necessário
        if (selectedNPC?.id === id) {
          setSelectedNPC(prev => prev ? { ...prev, ...data } : null);
        }
        
        const updatedNPC = npcs.find(npc => npc.id === id);
        if (updatedNPC) {
          console.log(`✅ NPC ${updatedNPC.name} atualizado com sucesso`);
          return { ...updatedNPC, ...data };
        }
      }
      
      throw new Error('Falha ao atualizar NPC');
    } catch (err) {
      console.error('❌ Erro ao atualizar NPC:', err);
      setError(`Erro ao atualizar NPC: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [npcs, selectedNPC]);
  
  const deleteNPC = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deletando NPC:', id);
      
      const response = await campaignAPI.deleteNPC(id);
      
      if (response && response.success) {
        // Remover NPC localmente
        setNpcs(prev => prev.filter(npc => npc.id !== id));
        
        // Limpar seleção se necessário
        if (selectedNPC?.id === id) {
          setSelectedNPC(null);
        }
        
        console.log('✅ NPC deletado com sucesso');
      } else {
        throw new Error('Falha ao deletar NPC');
      }
    } catch (err) {
      console.error('❌ Erro ao deletar NPC:', err);
      setError(`Erro ao deletar NPC: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedNPC]);
  
  // ===========================
  // OPERAÇÕES DE COMBATE
  // ===========================
  
  const rollAttack = useCallback(async (
    npcId: string, 
    attackId: string, 
    options?: { advantage?: boolean; disadvantage?: boolean }
  ): Promise<RollResult> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) throw new Error('NPC não encontrado');
    
    const attack = npc.attacks.find(a => a.id === attackId);
    if (!attack) throw new Error('Ataque não encontrado');
    
    const roll: DiceRoll = {
      dice_count: 1,
      dice_sides: 20,
      modifier: attack.attack_bonus
    };
    
    const result = npcUtilities.rollDice(roll, options?.advantage, options?.disadvantage);
    
    console.log(`🎲 ${npc.name} atacou com ${attack.name}: ${result.total}`);
    
    // Aqui você pode adicionar lógica para salvar o resultado no histórico
    // ou enviar para outros jogadores em tempo real
    
    return result;
  }, [npcs]);
  
  const rollDamage = useCallback(async (npcId: string, attackId: string): Promise<RollResult> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) throw new Error('NPC não encontrado');
    
    const attack = npc.attacks.find(a => a.id === attackId);
    if (!attack) throw new Error('Ataque não encontrado');
    
    const result = npcUtilities.rollDice(attack.damage);
    
    console.log(`💥 ${npc.name} causou ${result.total} de dano ${attack.damage_type} com ${attack.name}`);
    
    return result;
  }, [npcs]);
  
  const castSpell = useCallback(async (
    npcId: string, 
    spellId: string, 
    level?: number
  ): Promise<RollResult> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) throw new Error('NPC não encontrado');
    
    const spell = npc.spells?.find(s => s.id === spellId);
    if (!spell) throw new Error('Magia não encontrada');
    
    if (!spell.is_attack_spell || !spell.damage) {
      throw new Error('Magia não é de ataque ou não tem dano');
    }
    
    // Usar dano upcast se nível for maior que o nível base da magia
    const damage = (level && level > spell.level && spell.upcast_damage) 
      ? spell.upcast_damage 
      : spell.damage;
    
    const result = npcUtilities.rollDice(damage);
    
    console.log(`✨ ${npc.name} conjurou ${spell.name} (nível ${level || spell.level}): ${result.total} de dano ${spell.damage_type}`);
    
    return result;
  }, [npcs]);
  
  // ===========================
  // OPERAÇÕES DE STATUS
  // ===========================
  
  const updateHitPoints = useCallback(async (npcId: string, newHp: number): Promise<void> => {
    const updates: UpdateEnhancedNPCRequest = {
      id: npcId,
      current_hit_points: Math.max(0, newHp)
    };
    
    await updateNPC(npcId, updates);
  }, [updateNPC]);
  
  const killNPC = useCallback(async (npcId: string): Promise<void> => {
    const updates: UpdateEnhancedNPCRequest = {
      id: npcId,
      is_alive: false,
      current_hit_points: 0
    };
    
    await updateNPC(npcId, updates);
  }, [updateNPC]);
  
  const reviveNPC = useCallback(async (npcId: string): Promise<void> => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) throw new Error('NPC não encontrado');
    
    const updates: UpdateEnhancedNPCRequest = {
      id: npcId,
      is_alive: true,
      current_hit_points: npc.stats.hit_points // Restaurar HP máximo
    };
    
    await updateNPC(npcId, updates);
  }, [npcs, updateNPC]);
  
  // ===========================
  // BUSCA E FILTROS
  // ===========================
  
  const searchNPCs = useCallback(async (searchFilters: NPCSearchFilters): Promise<NPCSearchResult> => {
    // Para esta implementação, fazemos a busca localmente
    // Em uma implementação completa, isso seria uma chamada à API
    
    const filtered = npcUtilities.filterNPCs(npcs, searchFilters);
    const sorted = npcUtilities.sortNPCs(filtered, sortBy, sortOrder);
    
    return {
      npcs: sorted,
      total: sorted.length,
      page: 1,
      per_page: sorted.length,
      filters_applied: searchFilters
    };
  }, [npcs, sortBy, sortOrder]);
  
  // ===========================
  // NPCs FILTRADOS E ORDENADOS
  // ===========================
  
  const filteredNPCs = useMemo(() => {
    let filtered = npcUtilities.filterNPCs(npcs, filters);
    return npcUtilities.sortNPCs(filtered, sortBy, sortOrder);
  }, [npcs, filters, sortBy, sortOrder]);
  
  // ===========================
  // ESTATÍSTICAS
  // ===========================
  
  const stats = useMemo(() => {
    const total = npcs.length;
    const alive = npcs.filter(npc => npc.is_alive).length;
    const dead = total - alive;
    
    const byType = npcs.reduce((acc, npc) => {
      acc[npc.npc_type] = (acc[npc.npc_type] || 0) + 1;
      return acc;
    }, {} as Record<NPCType, number>);
    
    const averageCR = npcs.length > 0 
      ? npcs.reduce((sum, npc) => sum + (parseFloat(npc.challenge_rating || '0')), 0) / npcs.length
      : 0;
    
    const spellcasters = npcs.filter(npc => npc.spellcasting?.is_spellcaster).length;
    
    return {
      total,
      alive,
      dead,
      byType,
      averageCR: Math.round(averageCR * 100) / 100,
      spellcasters
    };
  }, [npcs]);
  
  // ===========================
  // OPERAÇÕES EM LOTE
  // ===========================
  
  const bulkUpdate = useCallback(async (
    ids: string[], 
    updates: Partial<EnhancedNPC>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📝 Atualizando ${ids.length} NPCs em lote`);
      
      const promises = ids.map(id => updateNPC(id, { id, ...updates }));
      await Promise.all(promises);
      
      console.log('✅ Atualização em lote concluída');
    } catch (err) {
      console.error('❌ Erro na atualização em lote:', err);
      setError(`Erro na atualização em lote: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateNPC]);
  
  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🗑️ Deletando ${ids.length} NPCs em lote`);
      
      const promises = ids.map(id => deleteNPC(id));
      await Promise.all(promises);
      
      console.log('✅ Deleção em lote concluída');
    } catch (err) {
      console.error('❌ Erro na deleção em lote:', err);
      setError(`Erro na deleção em lote: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [deleteNPC]);
  
  // ===========================
  // IMPORTAÇÃO/EXPORTAÇÃO
  // ===========================
  
  const exportNPCs = useCallback((format: 'json' | 'csv'): string => {
    if (format === 'json') {
      return JSON.stringify(npcs, null, 2);
    } else {
      // Exportação CSV simplificada
      const headers = ['name', 'race', 'npc_class', 'npc_type', 'challenge_rating', 'hit_points', 'armor_class'];
      const csvHeaders = headers.join(',');
      
      const csvRows = npcs.map(npc => {
        return headers.map(header => {
          let value: any;
          switch (header) {
            case 'hit_points':
              value = npc.stats.hit_points;
              break;
            case 'armor_class':
              value = npc.stats.armor_class;
              break;
            default:
              value = (npc as any)[header] || '';
          }
          
          // Escapar valores com vírgulas
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          
          return value;
        }).join(',');
      });
      
      return [csvHeaders, ...csvRows].join('\n');
    }
  }, [npcs]);
  
  const importNPCs = useCallback(async (
    data: any[], 
    format: 'json' | 'csv'
  ): Promise<EnhancedNPC[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📥 Importando ${data.length} NPCs (${format})`);
      
      const importedNPCs: EnhancedNPC[] = [];
      
      for (const item of data) {
        try {
          // Converter dados importados para formato correto
          const npcData: CreateEnhancedNPCRequest = {
            campaign_id: campaignId,
            name: item.name || 'NPC Importado',
            description: item.description || '',
            race: item.race || '',
            npc_class: item.npc_class || item.class || '',
            npc_type: item.npc_type || NPCType.NEUTRAL,
            alignment: item.alignment || '',
            location: item.location || '',
            occupation: item.occupation || '',
            faction: item.faction || '',
            stats: {
              armor_class: item.armor_class || item.stats?.armor_class || 10,
              hit_points: item.hit_points || item.stats?.hit_points || 1,
              speed: item.speed || item.stats?.speed || '30 ft',
              attributes: item.stats?.attributes || {
                strength: 10, dexterity: 10, constitution: 10,
                intelligence: 10, wisdom: 10, charisma: 10
              }
            },
            challenge_rating: item.challenge_rating || '0',
            attacks: item.attacks || [],
            spellcasting: item.spellcasting || { is_spellcaster: false },
            abilities: item.abilities || [],
            personality_traits: item.personality_traits || [],
            goals: item.goals || '',
            secrets: item.secrets || '',
            gm_notes: item.gm_notes || ''
          };
          
          const created = await createNPC(npcData);
          importedNPCs.push(created);
        } catch (err) {
          console.warn(`⚠️ Erro ao importar NPC: ${item.name}`, err);
        }
      }
      
      console.log(`✅ ${importedNPCs.length} NPCs importados com sucesso`);
      return importedNPCs;
    } catch (err) {
      console.error('❌ Erro na importação:', err);
      setError(`Erro na importação: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, createNPC]);
  
  // ===========================
  // BACKUP E RESTORE
  // ===========================
  
  const createBackup = useCallback(() => {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      campaign_id: campaignId,
      npcs: npcs,
      filters: filters,
      sort: { sortBy, sortOrder }
    };
  }, [npcs, filters, sortBy, sortOrder, campaignId]);
  
  const restoreFromBackup = useCallback(async (backup: any): Promise<void> => {
    if (!backup.npcs || !Array.isArray(backup.npcs)) {
      throw new Error('Backup inválido');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📦 Restaurando backup de ${backup.npcs.length} NPCs`);
      
      // Limpar NPCs existentes (opcional - pode ser configurável)
      // await bulkDelete(npcs.map(npc => npc.id!));
      
      // Importar NPCs do backup
      await importNPCs(backup.npcs, 'json');
      
      // Restaurar filtros e ordenação se disponível
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
      // Aqui você conectaria ao WebSocket ou similar
      console.log('🔄 Habilitando updates em tempo real para:', campaignId);
      
      return () => {
        console.log('🔄 Desabilitando updates em tempo real');
      };
    }
  }, [enableRealTimeUpdates, campaignId]);
  
  // ===========================
  // RETORNO DO HOOK
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
    
    // Operações de combate
    rollAttack,
    rollDamage,
    castSpell,
    
    // Operações de status
    updateHitPoints,
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