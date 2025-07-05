// ===========================
// src/components/npc/EnhancedNPCModal.tsx
// VERSÃO COMPLETA COM SISTEMA DE DADOS INTEGRADO
// ===========================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Dice6, 
  Heart, 
  Shield, 
  Swords, 
  Brain, 
  Eye, 
  Target, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Download,
  Sparkles,
  Zap,
  Star,
  Calculator,
  TrendingUp,
  Wand2,
  Activity,
  Clock
} from 'lucide-react';

// Importações dos componentes de dados
import { DiceRoller, AttackRoller, SpellRoller, HPManager } from '@/components/DiceComponents';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';
import type { RollResult, NPCFormData, Attack, Spell, NPCAttributes, NPCStats, NPCAbility } from '@/types/enhancedNPC';

// ===========================
// TIPOS E INTERFACES
// ===========================

interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

enum NPCType {
  ALLY = "aliado",
  ENEMY = "inimigo", 
  NEUTRAL = "neutro",
  MERCHANT = "mercador",
  QUEST_GIVER = "missões",
  BACKGROUND = "cenário"
}

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (npcData: NPCFormData) => Promise<void>;
  npc?: NPCFormData | null;
  campaignId: string;
  mode?: 'create' | 'edit' | 'view';
}

interface RollHistoryEntry {
  type: string;
  result: RollResult;
  description: string;
  timestamp: Date;
}

// ===========================
// COMPONENTE PRINCIPAL DO MODAL
// ===========================

export const EnhancedNPCModal: React.FC<NPCModalProps> = ({
  isOpen,
  onClose,
  onSave,
  npc,
  campaignId,
  mode = 'create'
}) => {
  const [currentTab, setCurrentTab] = useState<'basic' | 'stats' | 'attacks' | 'spells' | 'abilities' | 'roleplay'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // ADICIONADO: Estados para sistema de rolagem
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  // ADICIONADO: Hook para NPCs Enhanced
  const {
    rollAttack,
    rollDamage,
    castSpell,
    updateHitPoints,
    healNPC,
    damageNPC
  } = useEnhancedNPCs({ campaignId });

  // ADICIONADO: Estados de HP para gerenciamento em tempo real
  const [currentHP, setCurrentHP] = useState(0);
  const [tempHP, setTempHP] = useState(0);
  
  const [formData, setFormData] = useState<NPCFormData>({
    name: '',
    description: '',
    race: '',
    npc_class: '',
    npc_type: NPCType.NEUTRAL,
    alignment: '',
    location: '',
    occupation: '',
    faction: '',
    stats: {
      armor_class: 10,
      hit_points: 1,
      speed: '30 ft',
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
    },
    challenge_rating: '',
    abilities: [],
    attacks: [],
    spells: [],
    is_spellcaster: false,
    personality_traits: [],
    goals: '',
    secrets: '',
    gm_notes: '',
    is_alive: true,
    is_active: true
  });

  // ATUALIZADO: useEffect existente para incluir HP
  useEffect(() => {
    if (npc) {
      setFormData({
        ...npc,
        stats: {
          ...npc.stats,
          attributes: {
            strength: npc.stats?.attributes?.strength || 10,
            dexterity: npc.stats?.attributes?.dexterity || 10,
            constitution: npc.stats?.attributes?.constitution || 10,
            intelligence: npc.stats?.attributes?.intelligence || 10,
            wisdom: npc.stats?.attributes?.wisdom || 10,
            charisma: npc.stats?.attributes?.charisma || 10
          }
        }
      });
      
      // ADICIONADO: Configurar HP atual
      setCurrentHP(npc.stats?.current_hit_points || npc.stats?.hit_points || 0);
      setTempHP(npc.stats?.temporary_hit_points || 0);
    }
  }, [npc]);

  // ADICIONADO: Funções de rolagem
  const addToRollHistory = (type: string, result: RollResult, description: string) => {
    const entry: RollHistoryEntry = {
      type,
      result,
      description,
      timestamp: new Date()
    };
    setRollHistory(prev => [entry, ...prev.slice(0, 9)]); // Manter 10 entradas
  };

  const rollDice = (roll: DiceRoll, advantage?: boolean, disadvantage?: boolean): RollResult => {
    const rolls: number[] = [];
    for (let i = 0; i < roll.dice_count; i++) {
      rolls.push(Math.floor(Math.random() * roll.dice_sides) + 1);
    }
    
    let total = rolls.reduce((sum, roll) => sum + roll, 0) + roll.modifier;
    
    // Implementar vantagem/desvantagem para d20
    if ((advantage || disadvantage) && roll.dice_sides === 20) {
      const extraRoll = Math.floor(Math.random() * 20) + 1;
      if (advantage) {
        total = Math.max(rolls[0], extraRoll) + roll.modifier;
      } else if (disadvantage) {
        total = Math.min(rolls[0], extraRoll) + roll.modifier;
      }
    }
    
    return {
      total,
      rolls,
      modifier: roll.modifier,
      formula: `${roll.dice_count}d${roll.dice_sides}${roll.modifier !== 0 ? (roll.modifier > 0 ? '+' : '') + roll.modifier : ''}`,
      timestamp: new Date()
    };
  };

  const handleAttackRoll = async (attackId: string, advantage?: boolean, disadvantage?: boolean) => {
    if (!npc?.id || mode === 'create') {
      // Para NPCs não salvos, usar rolagem local
      const attack = formData.attacks?.find(a => a.id === attackId);
      if (attack) {
        const roll = {
          dice_count: 1,
          dice_sides: 20,
          modifier: attack.attack_bonus
        };
        const result = rollDice(roll, advantage, disadvantage);
        addToRollHistory('attack_roll', result, `Ataque: ${attack.name}`);
      }
      return;
    }

    setIsRolling(true);
    try {
      const result = await rollAttack(npc.id, attackId, { advantage, disadvantage });
      const attack = formData.attacks?.find(a => a.id === attackId);
      addToRollHistory('attack_roll', result, `Ataque: ${attack?.name || 'Desconhecido'}`);
    } catch (error) {
      console.error('Erro na rolagem de ataque:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleDamageRoll = async (attackId: string, critical?: boolean) => {
    if (!npc?.id || mode === 'create') {
      // Rolagem local
      const attack = formData.attacks?.find(a => a.id === attackId);
      if (attack) {
        let damageRoll = attack.damage;
        if (critical) {
          damageRoll = { ...attack.damage, dice_count: attack.damage.dice_count * 2 };
        }
        const result = rollDice(damageRoll);
        addToRollHistory('damage_roll', result, `Dano: ${attack.name}${critical ? ' (CRÍTICO)' : ''}`);
      }
      return;
    }

    setIsRolling(true);
    try {
      const result = await rollDamage(npc.id, attackId, { critical });
      const attack = formData.attacks?.find(a => a.id === attackId);
      addToRollHistory('damage_roll', result, `Dano: ${attack?.name || 'Desconhecido'}${critical ? ' (CRÍTICO)' : ''}`);
    } catch (error) {
      console.error('Erro na rolagem de dano:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleSpellCast = async (spellName: string, spellLevel?: number) => {
    if (!npc?.id || mode === 'create') {
      // Apenas adicionar ao histórico local
      addToRollHistory('spell_cast', {
        total: 0,
        rolls: [],
        modifier: 0,
        formula: spellName,
        timestamp: new Date()
      }, `Magia: ${spellName}${spellLevel ? ` (Nível ${spellLevel})` : ''}`);
      return;
    }

    setIsRolling(true);
    try {
      const result = await castSpell(npc.id, spellName, { spellLevel });
      if (result) {
        addToRollHistory('spell_cast', result, `Magia: ${spellName}${spellLevel ? ` (Nível ${spellLevel})` : ''}`);
      }
    } catch (error) {
      console.error('Erro na conjuração:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleHPChange = async (newHP: number, newTempHP?: number) => {
    setCurrentHP(newHP);
    if (newTempHP !== undefined) setTempHP(newTempHP);

    if (npc?.id && mode !== 'create') {
      try {
        await updateHitPoints(npc.id, newHP, newTempHP);
      } catch (error) {
        console.error('Erro ao atualizar HP:', error);
      }
    }
  };

  // ===========================
  // FUNÇÕES AUXILIARES
  // ===========================

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const calculateProficiencyBonus = (cr: string): number => {
    const crNumber = parseFloat(cr) || 0;
    if (crNumber < 1) return 2;
    if (crNumber < 5) return 2;
    if (crNumber < 9) return 3;
    if (crNumber < 13) return 4;
    if (crNumber < 17) return 5;
    return 6;
  };

  // ===========================
  // HANDLERS DE FORMULÁRIO
  // ===========================

  const handleInputChange = (field: keyof NPCFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleStatsChange = (statField: keyof NPCStats, value: any) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statField]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleAttributeChange = (attribute: keyof NPCAttributes, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        attributes: {
          ...prev.stats.attributes,
          [attribute]: Math.max(1, Math.min(30, value))
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  // ===========================
  // HANDLERS DE ATAQUES
  // ===========================

  const addAttack = () => {
    const newAttack: Attack = {
      id: `attack_${Date.now()}`,
      name: '',
      attack_bonus: 0,
      damage: { dice_count: 1, dice_sides: 6, modifier: 0 },
      damage_type: 'cortante',
      range: 'Corpo a corpo',
      description: ''
    };
    
    setFormData(prev => ({
      ...prev,
      attacks: [...prev.attacks, newAttack]
    }));
    setHasUnsavedChanges(true);
  };

  const updateAttack = (index: number, field: keyof Attack, value: any) => {
    setFormData(prev => ({
      ...prev,
      attacks: prev.attacks.map((attack, i) => 
        i === index ? { ...attack, [field]: value } : attack
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeAttack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attacks: prev.attacks.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  // ===========================
  // HANDLERS DE MAGIAS
  // ===========================

  const addSpell = () => {
    const newSpell: Spell = {
      id: `spell_${Date.now()}`,
      name: '',
      level: 0,
      school: 'Evocação',
      range: '30 pés',
      is_attack_spell: false,
      description: ''
    };
    
    setFormData(prev => ({
      ...prev,
      spells: [...prev.spells, newSpell]
    }));
    setHasUnsavedChanges(true);
  };

  const updateSpell = (index: number, field: keyof Spell, value: any) => {
    setFormData(prev => ({
      ...prev,
      spells: prev.spells.map((spell, i) => 
        i === index ? { ...spell, [field]: value } : spell
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeSpell = (index: number) => {
    setFormData(prev => ({
      ...prev,
      spells: prev.spells.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  // ===========================
  // HANDLERS DE HABILIDADES
  // ===========================

  const addAbility = () => {
    const newAbility: NPCAbility = {
      id: `ability_${Date.now()}`,
      name: '',
      description: '',
      usage: ''
    };
    
    setFormData(prev => ({
      ...prev,
      abilities: [...prev.abilities, newAbility]
    }));
    setHasUnsavedChanges(true);
  };

  const updateAbility = (index: number, field: keyof NPCAbility, value: any) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.map((ability, i) => 
        i === index ? { ...ability, [field]: value } : ability
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeAbility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  // ===========================
  // HANDLER DE SUBMIT
  // ===========================

  const handleSubmit = async () => {
    setValidationErrors([]);
    
    // Validação básica
    const errors: string[] = [];
    if (!formData.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar NPC:', error);
      setValidationErrors(['Erro ao salvar NPC. Tente novamente.']);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ===========================
  // CONFIGURAÇÃO DAS ABAS
  // ===========================

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Users },
    { id: 'stats', label: 'Atributos', icon: Calculator },
    { id: 'attacks', label: 'Ataques', icon: Swords },
    { id: 'spells', label: 'Magias', icon: Wand2 },
    { id: 'abilities', label: 'Habilidades', icon: Star },
    { id: 'roleplay', label: 'Roleplay', icon: Brain }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">
              {mode === 'create' ? 'Criar NPC' : mode === 'edit' ? 'Editar NPC' : 'Visualizar NPC'}
            </h2>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Alterações não salvas" />
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar com Tabs */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        currentTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ADICIONADO: Seção de gerenciamento de HP (se for modo edit/view) */}
            {(mode === 'edit' || mode === 'view') && npc && (
              <div className="p-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-white mb-3">Gerenciamento de HP</h4>
                <HPManager
                  currentHP={currentHP}
                  maxHP={formData.stats?.hit_points || 0}
                  tempHP={tempHP}
                  onHPChange={handleHPChange}
                  disabled={mode === 'view' || isRolling}
                  compact={true}
                />
              </div>
            )}

            {/* ADICIONADO: Histórico de rolagens */}
            {rollHistory.length > 0 && (
              <div className="flex-1 p-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Histórico de Rolagens
                </h4>
                <div className="bg-gray-800 rounded-lg max-h-60 overflow-y-auto">
                  {rollHistory.map((entry, index) => (
                    <div key={index} className="p-3 border-b border-gray-700 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">{entry.description}</span>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-bold text-white">{entry.result.total}</span>
                        <span className="text-xs text-gray-400">{entry.result.formula}</span>
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Erros de validação:</span>
                </div>
                <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab: Básico */}
            {currentTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Nome do NPC"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de NPC
                    </label>
                    <select
                      value={formData.npc_type}
                      onChange={(e) => handleInputChange('npc_type', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      disabled={mode === 'view'}
                    >
                      {Object.values(NPCType).map(type => (
                        <option key={type} value={type}>
                          {type === NPCType.ALLY && 'Aliado'}
                          {type === NPCType.ENEMY && 'Inimigo'}
                          {type === NPCType.NEUTRAL && 'Neutro'}
                          {type === NPCType.MERCHANT && 'Mercador'}
                          {type === NPCType.QUEST_GIVER && 'Doador de Missões'}
                          {type === NPCType.BACKGROUND && 'Cenário'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={formData.race}
                      onChange={(e) => handleInputChange('race', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Humano, Elfo, Orc"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Classe
                    </label>
                    <input
                      type="text"
                      value={formData.npc_class}
                      onChange={(e) => handleInputChange('npc_class', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Guerreiro, Mago, Ladino"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alinhamento
                    </label>
                    <input
                      type="text"
                      value={formData.alignment}
                      onChange={(e) => handleInputChange('alignment', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Leal e Bom"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Onde o NPC pode ser encontrado"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ocupação
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Profissão ou função"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facção
                    </label>
                    <input
                      type="text"
                      value={formData.faction}
                      onChange={(e) => handleInputChange('faction', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Grupo ou organização"
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Descrição física e características do NPC..."
                    disabled={mode === 'view'}
                  />
                </div>
              </div>
            )}

            {/* Tab: Atributos */}
            {currentTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Classe de Armadura
                    </label>
                    <input
                      type="number"
                      value={formData.stats.armor_class}
                      onChange={(e) => handleStatsChange('armor_class', parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="30"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pontos de Vida
                    </label>
                    <input
                      type="number"
                      value={formData.stats.hit_points}
                      onChange={(e) => handleStatsChange('hit_points', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      min="1"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Velocidade
                    </label>
                    <input
                      type="text"
                      value={formData.stats.speed}
                      onChange={(e) => handleStatsChange('speed', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: 30 ft"
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Atributos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(formData.stats.attributes).map(([attr, value]) => {
                      const modifier = calculateModifier(value);
                      const labels = {
                        strength: 'Força',
                        dexterity: 'Destreza',
                        constitution: 'Constituição',
                        intelligence: 'Inteligência',
                        wisdom: 'Sabedoria',
                        charisma: 'Carisma'
                      };
                      
                      return (
                        <div key={attr} className="text-center">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {labels[attr as keyof typeof labels]}
                          </label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleAttributeChange(attr as keyof NPCAttributes, parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                            min="1"
                            max="30"
                            disabled={mode === 'view'}
                          />
                          <div className="mt-2 text-sm text-gray-400">
                            Modificador: {modifier >= 0 ? '+' : ''}{modifier}
                          </div>
                          
                          {/* ADICIONADO: Botão de teste rápido */}
                          {mode !== 'create' && mode !== 'view' && (
                            <DiceRoller
                              roll={{ dice_count: 1, dice_sides: 20, modifier }}
                              label={attr.substring(0, 3).toUpperCase()}
                              onRoll={(result) => addToRollHistory('ability_check', result, `Teste de ${labels[attr as keyof typeof labels]}`)}
                              className="mt-2"
                              disabled={isRolling}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nível de Desafio
                  </label>
                  <input
                    type="text"
                    value={formData.challenge_rating}
                    onChange={(e) => handleInputChange('challenge_rating', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 1/4, 1, 2, 5"
                    disabled={mode === 'view'}
                  />
                </div>
              </div>
            )}

            {/* Tab: Ataques */}
            {currentTab === 'attacks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Ataques</h3>
                  {mode !== 'view' && (
                    <button
                      onClick={addAttack}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Ataque</span>
                    </button>
                  )}
                </div>

                {formData.attacks.map((attack, index) => (
                  <div key={attack.id || index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-white">
                        {attack.name || `Ataque ${index + 1}`}
                      </h4>
                      {mode !== 'view' && (
                        <button
                          onClick={() => removeAttack(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={attack.name}
                          onChange={(e) => updateAttack(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: Espada Longa"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Bônus de Ataque
                        </label>
                        <input
                          type="number"
                          value={attack.attack_bonus}
                          onChange={(e) => updateAttack(index, 'attack_bonus', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Dano (dados)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={attack.damage.dice_count}
                            onChange={(e) => updateAttack(index, 'damage', { 
                              ...attack.damage, 
                              dice_count: parseInt(e.target.value) || 1 
                            })}
                            className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                            min="1"
                            disabled={mode === 'view'}
                          />
                          <span className="text-white self-center">d</span>
                          <input
                            type="number"
                            value={attack.damage.dice_sides}
                            onChange={(e) => updateAttack(index, 'damage', { 
                              ...attack.damage, 
                              dice_sides: parseInt(e.target.value) || 6 
                            })}
                            className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                          <span className="text-white self-center">+</span>
                          <input
                            type="number"
                            value={attack.damage.modifier}
                            onChange={(e) => updateAttack(index, 'damage', { 
                              ...attack.damage, 
                              modifier: parseInt(e.target.value) || 0 
                            })}
                            className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Tipo de Dano
                        </label>
                        <input
                          type="text"
                          value={attack.damage_type}
                          onChange={(e) => updateAttack(index, 'damage_type', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: cortante, contundente"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Alcance
                        </label>
                        <input
                          type="text"
                          value={attack.range}
                          onChange={(e) => updateAttack(index, 'range', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: Corpo a corpo, 30/120 ft"
                          disabled={mode === 'view'}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={attack.description || ''}
                        onChange={(e) => updateAttack(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Efeitos especiais do ataque..."
                        disabled={mode === 'view'}
                      />
                    </div>

                    {/* ADICIONADO: Botões de rolagem integrados */}
                    {mode !== 'create' && (
                      <div className="flex items-center space-x-4">
                        <AttackRoller
                          attack={attack}
                          onAttackRoll={(adv, dis) => handleAttackRoll(attack.id!, adv, dis)}
                          onDamageRoll={(crit) => handleDamageRoll(attack.id!, crit)}
                          disabled={isRolling}
                          compact={false}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {formData.attacks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum ataque configurado</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Magias */}
            {currentTab === 'spells' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Magias</h3>
                  <div className="flex items-center space-x-4">
                    {mode !== 'view' && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_spellcaster}
                          onChange={(e) => handleInputChange('is_spellcaster', e.target.checked)}
                          className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">É conjurador</span>
                      </label>
                    )}
                    {mode !== 'view' && formData.is_spellcaster && (
                      <button
                        onClick={addSpell}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Magia</span>
                      </button>
                    )}
                  </div>
                </div>

                {formData.is_spellcaster && (
                  <>
                    {formData.spells.map((spell, index) => (
                      <div key={spell.id || index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-white">
                            {spell.name || `Magia ${index + 1}`}
                          </h4>
                          {mode !== 'view' && (
                            <button
                              onClick={() => removeSpell(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Nome
                            </label>
                            <input
                              type="text"
                              value={spell.name}
                              onChange={(e) => updateSpell(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Bola de Fogo"
                              disabled={mode === 'view'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Nível
                            </label>
                            <input
                              type="number"
                              value={spell.level}
                              onChange={(e) => updateSpell(index, 'level', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                              min="0"
                              max="9"
                              disabled={mode === 'view'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Escola
                            </label>
                            <select
                              value={spell.school}
                              onChange={(e) => updateSpell(index, 'school', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                              disabled={mode === 'view'}
                            >
                              <option value="Abjuração">Abjuração</option>
                              <option value="Conjuração">Conjuração</option>
                              <option value="Adivinhação">Adivinhação</option>
                              <option value="Encantamento">Encantamento</option>
                              <option value="Evocação">Evocação</option>
                              <option value="Ilusão">Ilusão</option>
                              <option value="Necromancia">Necromancia</option>
                              <option value="Transmutação">Transmutação</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Alcance
                            </label>
                            <input
                              type="text"
                              value={spell.range}
                              onChange={(e) => updateSpell(index, 'range', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: 120 pés, Toque"
                              disabled={mode === 'view'}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="flex items-center space-x-2 mb-2">
                            <input
                              type="checkbox"
                              checked={spell.is_attack_spell}
                              onChange={(e) => updateSpell(index, 'is_attack_spell', e.target.checked)}
                              className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                              disabled={mode === 'view'}
                            />
                            <span className="text-gray-300">É magia de ataque</span>
                          </label>

                          {spell.is_attack_spell && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Dano
                                </label>
                                <div className="flex space-x-2">
                                  <input
                                    type="number"
                                    value={spell.damage?.dice_count || 1}
                                    onChange={(e) => updateSpell(index, 'damage', { 
                                      ...spell.damage, 
                                      dice_count: parseInt(e.target.value) || 1 
                                    })}
                                    className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                                    disabled={mode === 'view'}
                                  />
                                  <span className="text-white self-center">d</span>
                                  <input
                                    type="number"
                                    value={spell.damage?.dice_sides || 6}
                                    onChange={(e) => updateSpell(index, 'damage', { 
                                      ...spell.damage, 
                                      dice_sides: parseInt(e.target.value) || 6 
                                    })}
                                    className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                                    disabled={mode === 'view'}
                                  />
                                  <span className="text-white self-center">+</span>
                                  <input
                                    type="number"
                                    value={spell.damage?.modifier || 0}
                                    onChange={(e) => updateSpell(index, 'damage', { 
                                      ...spell.damage, 
                                      modifier: parseInt(e.target.value) || 0 
                                    })}
                                    className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500"
                                    disabled={mode === 'view'}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Tipo de Dano
                                </label>
                                <input
                                  type="text"
                                  value={spell.damage_type || ''}
                                  onChange={(e) => updateSpell(index, 'damage_type', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                                  placeholder="Ex: fogo, frio"
                                  disabled={mode === 'view'}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descrição
                          </label>
                          <textarea
                            value={spell.description || ''}
                            onChange={(e) => updateSpell(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Efeitos da magia..."
                            disabled={mode === 'view'}
                          />
                        </div>

                        {/* ADICIONADO: Botão de conjuração */}
                        {mode !== 'create' && (
                          <div className="mt-4">
                            <SpellRoller
                              spell={spell}
                              onCast={(level) => handleSpellCast(spell.name, level)}
                              disabled={isRolling}
                              compact={false}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {formData.spells.length === 0 && formData.is_spellcaster && (
                      <div className="text-center py-8 text-gray-400">
                        <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma magia configurada</p>
                      </div>
                    )}
                  </>
                )}

                {!formData.is_spellcaster && (
                  <div className="text-center py-8 text-gray-400">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Este NPC não é um conjurador</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Habilidades */}
            {currentTab === 'abilities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Habilidades Especiais</h3>
                  {mode !== 'view' && (
                    <button
                      onClick={addAbility}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Habilidade</span>
                    </button>
                  )}
                </div>

                {formData.abilities.map((ability, index) => (
                  <div key={ability.id || index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-white">
                        {ability.name || `Habilidade ${index + 1}`}
                      </h4>
                      {mode !== 'view' && (
                        <button
                          onClick={() => removeAbility(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={ability.name}
                          onChange={(e) => updateAbility(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: Ataque Furtivo"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Uso
                        </label>
                        <input
                          type="text"
                          value={ability.usage || ''}
                          onChange={(e) => updateAbility(index, 'usage', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: 1/dia, À vontade"
                          disabled={mode === 'view'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={ability.description}
                        onChange={(e) => updateAbility(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Descreva o efeito e como funciona..."
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                ))}

                {formData.abilities.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma habilidade especial configurada</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Roleplay */}
            {currentTab === 'roleplay' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Traços de Personalidade
                  </label>
                  <textarea
                    value={formData.personality_traits.join('\n')}
                    onChange={(e) => handleInputChange('personality_traits', e.target.value.split('\n').filter(t => t.trim()))}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Um traço por linha..."
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="O que este NPC deseja alcançar..."
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Segredos (apenas GM)
                  </label>
                  <textarea
                    value={formData.secrets}
                    onChange={(e) => handleInputChange('secrets', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Informações secretas que apenas o GM conhece..."
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas do GM
                  </label>
                  <textarea
                    value={formData.gm_notes}
                    onChange={(e) => handleInputChange('gm_notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Notas privadas do GM sobre este NPC..."
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_alive}
                      onChange={(e) => handleInputChange('is_alive', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      disabled={mode === 'view'}
                    />
                    <span className="text-gray-300">Está vivo</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      disabled={mode === 'view'}
                    />
                    <span className="text-gray-300">Está ativo na campanha</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Alterações não salvas
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-500 transition-colors"
            >
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </button>
            
            {mode !== 'view' && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{npc ? 'Atualizar NPC' : 'Criar NPC'}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};