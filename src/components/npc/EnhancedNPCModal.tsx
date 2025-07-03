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
  Wand2
} from 'lucide-react';

// ===========================
// TIPOS E INTERFACES
// ===========================

interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

interface Attack {
  name: string;
  attack_bonus: number;
  damage: DiceRoll;
  damage_type: string;
  range: string;
  description?: string;
}

interface Spell {
  name: string;
  level: number;
  school: string;
  description?: string;
  is_attack_spell: boolean;
  attack_bonus?: number;
  damage?: DiceRoll;
  damage_type?: string;
  save_dc?: number;
  save_ability?: string;
  range: string;
}

interface NPCAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface NPCStats {
  armor_class: number;
  hit_points: number;
  speed: string;
  attributes: NPCAttributes;
}

interface NPCAbility {
  name: string;
  description: string;
  usage?: string;
}

enum NPCType {
  ALLY = "aliado",
  ENEMY = "inimigo", 
  NEUTRAL = "neutro",
  MERCHANT = "mercador",
  QUEST_GIVER = "missões",
  BACKGROUND = "cenário"
}

interface NPCFormData {
  name: string;
  description: string;
  race: string;
  npc_class: string;
  npc_type: NPCType;
  alignment: string;
  location: string;
  occupation: string;
  faction: string;
  stats: NPCStats;
  challenge_rating: string;
  abilities: NPCAbility[];
  attacks: Attack[];
  spells: Spell[];
  is_spellcaster: boolean;
  spellcasting_ability?: keyof NPCAttributes;
  spell_save_dc?: number;
  personality_traits: string[];
  goals: string;
  secrets: string;
  gm_notes: string;
  is_alive: boolean;
  is_active: boolean;
}

// ===========================
// COMPONENTE DE ROLAGEM DE DADOS
// ===========================

interface DiceRollerProps {
  roll: DiceRoll;
  label: string;
  onRoll?: (result: number) => void;
  className?: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ roll, label, onRoll, className = "" }) => {
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    
    // Simular animação de rolagem
    setTimeout(() => {
      let total = 0;
      for (let i = 0; i < roll.dice_count; i++) {
        total += Math.floor(Math.random() * roll.dice_sides) + 1;
      }
      total += roll.modifier;
      
      setLastRoll(total);
      setIsRolling(false);
      onRoll?.(total);
    }, 600);
  };

  const formatDiceString = () => {
    const base = `${roll.dice_count}d${roll.dice_sides}`;
    if (roll.modifier === 0) return base;
    if (roll.modifier > 0) return `${base}+${roll.modifier}`;
    return `${base}${roll.modifier}`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={rollDice}
        disabled={isRolling}
        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 flex items-center space-x-1 ${
          isRolling 
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 cursor-not-allowed'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:scale-105'
        }`}
      >
        <Dice6 className={`w-3 h-3 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{formatDiceString()}</span>
      </button>
      
      <span className="text-xs text-gray-400">{label}</span>
      
      {lastRoll !== null && (
        <span className="text-sm font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30">
          {lastRoll}
        </span>
      )}
    </div>
  );
};

// ===========================
// COMPONENTE PRINCIPAL DO MODAL
// ===========================

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (npcData: NPCFormData) => Promise<void>;
  npc?: NPCFormData | null;
  campaignId: string;
}

export const EnhancedNPCModal: React.FC<NPCModalProps> = ({
  isOpen,
  onClose,
  onSave,
  npc,
  campaignId
}) => {
  const [currentTab, setCurrentTab] = useState<'basic' | 'stats' | 'attacks' | 'spells' | 'abilities' | 'roleplay'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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

  const getSpellcastingModifier = (): number => {
    if (!formData.spellcasting_ability) return 0;
    return calculateModifier(formData.stats.attributes[formData.spellcasting_ability]);
  };

  const calculateSpellSaveDC = (): number => {
    const profBonus = calculateProficiencyBonus(formData.challenge_rating);
    const spellMod = getSpellcastingModifier();
    return 8 + profBonus + spellMod;
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

  const updateAttackDamage = (index: number, field: keyof DiceRoll, value: number) => {
    setFormData(prev => ({
      ...prev,
      attacks: prev.attacks.map((attack, i) => 
        i === index ? { 
          ...attack, 
          damage: { ...attack.damage, [field]: value }
        } : attack
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
      name: '',
      level: 0,
      school: 'Evocação',
      description: '',
      is_attack_spell: false,
      range: 'Toque'
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

  const updateSpellDamage = (index: number, field: keyof DiceRoll, value: number) => {
    setFormData(prev => ({
      ...prev,
      spells: prev.spells.map((spell, i) => 
        i === index && spell.damage ? { 
          ...spell, 
          damage: { ...spell.damage, [field]: value }
        } : spell
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
  // HANDLER DE SUBMIT
  // ===========================

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    // Calcular spell save DC automaticamente se for conjurador
    if (formData.is_spellcaster) {
      formData.spell_save_dc = calculateSpellSaveDC();
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar NPC:', error);
      alert('Erro ao salvar NPC. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Há alterações não salvas. Deseja realmente fechar?');
      if (!confirm) return;
    }
    
    setHasUnsavedChanges(false);
    setValidationErrors([]);
    onClose();
  };

  // ===========================
  // INICIALIZAÇÃO
  // ===========================

  useEffect(() => {
    if (npc) {
      setFormData({
        ...npc,
        attacks: npc.attacks || [],
        spells: npc.spells || [],
        is_spellcaster: npc.is_spellcaster || false,
        stats: {
          ...npc.stats,
          attributes: npc.stats.attributes || {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        }
      });
    } else {
      // Reset para novo NPC mantém dados padrão
    }
    setHasUnsavedChanges(false);
  }, [npc, isOpen]);

  if (!isOpen) return null;

  // ===========================
  // DADOS PARA TABS
  // ===========================

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Users },
    { id: 'stats', label: 'Atributos', icon: TrendingUp },
    { id: 'attacks', label: 'Ataques', icon: Swords },
    { id: 'spells', label: 'Magias', icon: Wand2 },
    { id: 'abilities', label: 'Habilidades', icon: Star },
    { id: 'roleplay', label: 'Roleplay', icon: Brain }
  ];

  const attributeLabels = {
    strength: 'Força',
    dexterity: 'Destreza',
    constitution: 'Constituição',
    intelligence: 'Inteligência',
    wisdom: 'Sabedoria',
    charisma: 'Carisma'
  };

  const damageTypes = [
    'ácido', 'cortante', 'frio', 'fogo', 'força', 'necrótico', 'perfurante', 
    'psíquico', 'radiante', 'sônico', 'venenoso', 'elétrico'
  ];

  const spellSchools = [
    'Abjuração', 'Adivinhação', 'Conjuração', 'Encantamento', 
    'Evocação', 'Ilusão', 'Necromancia', 'Transmutação'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-700">
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {npc ? 'Editar NPC' : 'Criar Novo NPC'}
                  </h3>
                  <p className="text-gray-400">
                    {npc ? 'Modificar personagem não-jogável' : 'Adicionar novo personagem não-jogável'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex space-x-1 bg-gray-700/50 rounded-xl p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
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
                    />
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
                    >
                      <option value={NPCType.ALLY}>Aliado</option>
                      <option value={NPCType.ENEMY}>Inimigo</option>
                      <option value={NPCType.NEUTRAL}>Neutro</option>
                      <option value={NPCType.MERCHANT}>Mercador</option>
                      <option value={NPCType.QUEST_GIVER}>Quest Giver</option>
                      <option value={NPCType.BACKGROUND}>Background</option>
                    </select>
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
                    placeholder="Descrição física e comportamento do NPC..."
                  />
                </div>
              </div>
            )}

            {/* Tab: Atributos */}
            {currentTab === 'stats' && (
              <div className="space-y-6">
                {/* Estatísticas de Combate */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Estatísticas de Combate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Challenge Rating
                      </label>
                      <input
                        type="text"
                        value={formData.challenge_rating}
                        onChange={(e) => handleInputChange('challenge_rating', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: 1/4, 1, 5"
                      />
                    </div>
                  </div>
                </div>

                {/* Atributos Básicos */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Atributos Básicos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(Object.keys(attributeLabels) as Array<keyof NPCAttributes>).map((attr) => {
                      const value = formData.stats.attributes[attr];
                      const modifier = calculateModifier(value);
                      
                      return (
                        <div key={attr} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                          <div className="text-center">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {attributeLabels[attr]}
                            </label>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <button
                                type="button"
                                onClick={() => handleAttributeChange(attr, value - 1)}
                                className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value) || 10)}
                                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                min="1"
                                max="30"
                              />
                              <button
                                type="button"
                                onClick={() => handleAttributeChange(attr, value + 1)}
                                className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm"
                              >
                                +
                              </button>
                            </div>
                            <div className={`text-sm font-medium ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {modifier >= 0 ? '+' : ''}{modifier}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conjuração */}
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="is_spellcaster"
                      checked={formData.is_spellcaster}
                      onChange={(e) => handleInputChange('is_spellcaster', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="is_spellcaster" className="text-lg font-semibold text-white">
                      É Conjurador
                    </label>
                  </div>

                  {formData.is_spellcaster && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Atributo de Conjuração
                        </label>
                        <select
                          value={formData.spellcasting_ability || ''}
                          onChange={(e) => handleInputChange('spellcasting_ability', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Selecione...</option>
                          {(Object.keys(attributeLabels) as Array<keyof NPCAttributes>).map((attr) => (
                            <option key={attr} value={attr}>
                              {attributeLabels[attr]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          CD de Magia (Calculado)
                        </label>
                        <div className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300">
                          {calculateSpellSaveDC()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Ataques */}
            {currentTab === 'attacks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Ataques</h4>
                  <button
                    type="button"
                    onClick={addAttack}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Ataque</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.attacks.map((attack, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-medium">Ataque {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeAttack(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome do Ataque
                          </label>
                          <input
                            type="text"
                            value={attack.name}
                            onChange={(e) => updateAttack(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Espada Longa, Garra"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bônus de Ataque
                          </label>
                          <input
                            type="number"
                            value={attack.attack_bonus}
                            onChange={(e) => updateAttack(index, 'attack_bonus', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tipo de Dano
                          </label>
                          <select
                            value={attack.damage_type}
                            onChange={(e) => updateAttack(index, 'damage_type', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          >
                            {damageTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Alcance
                          </label>
                          <input
                            type="text"
                            value={attack.range}
                            onChange={(e) => updateAttack(index, 'range', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Corpo a corpo, 30 ft"
                          />
                        </div>
                      </div>

                      {/* Configuração de Dano */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Dano
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={attack.damage.dice_count}
                            onChange={(e) => updateAttackDamage(index, 'dice_count', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                            min="1"
                            max="20"
                          />
                          <span className="text-gray-400">d</span>
                          <select
                            value={attack.damage.dice_sides}
                            onChange={(e) => updateAttackDamage(index, 'dice_sides', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            <option value={4}>4</option>
                            <option value={6}>6</option>
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                            <option value={12}>12</option>
                            <option value={20}>20</option>
                          </select>
                          <span className="text-gray-400">+</span>
                          <input
                            type="number"
                            value={attack.damage.modifier}
                            onChange={(e) => updateAttackDamage(index, 'modifier', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                          />
                        </div>
                      </div>

                      {/* Botões de Rolagem */}
                      <div className="flex items-center space-x-4 mb-4">
                        <DiceRoller
                          roll={{ dice_count: 1, dice_sides: 20, modifier: attack.attack_bonus }}
                          label="Ataque"
                          onRoll={(result) => console.log(`Ataque: ${result}`)}
                        />
                        <DiceRoller
                          roll={attack.damage}
                          label="Dano"
                          onRoll={(result) => console.log(`Dano: ${result}`)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={attack.description || ''}
                          onChange={(e) => updateAttack(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Efeitos especiais ou notas sobre o ataque..."
                        />
                      </div>
                    </div>
                  ))}

                  {formData.attacks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum ataque configurado</p>
                      <p className="text-sm">Clique em "Adicionar Ataque" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Magias */}
            {currentTab === 'spells' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Magias</h4>
                  <button
                    type="button"
                    onClick={addSpell}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Magia</span>
                  </button>
                </div>

                {!formData.is_spellcaster && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Configure este NPC como conjurador na aba "Atributos" para usar magias efetivamente.</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.spells.map((spell, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-medium">Magia {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeSpell(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome da Magia
                          </label>
                          <input
                            type="text"
                            value={spell.name}
                            onChange={(e) => updateSpell(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Mísseis Mágicos"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nível
                          </label>
                          <select
                            value={spell.level}
                            onChange={(e) => updateSpell(index, 'level', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          >
                            {Array.from({length: 10}, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0 ? 'Truque' : `${i}º Nível`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Escola
                          </label>
                          <select
                            value={spell.school}
                            onChange={(e) => updateSpell(index, 'school', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          >
                            {spellSchools.map(school => (
                              <option key={school} value={school}>{school}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Magia de Ataque */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`spell_attack_${index}`}
                            checked={spell.is_attack_spell}
                            onChange={(e) => updateSpell(index, 'is_attack_spell', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`spell_attack_${index}`} className="text-sm font-medium text-gray-300">
                            É magia de ataque
                          </label>
                        </div>

                        {spell.is_attack_spell && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Bônus de Ataque
                                </label>
                                <input
                                  type="number"
                                  value={spell.attack_bonus || 0}
                                  onChange={(e) => updateSpell(index, 'attack_bonus', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Tipo de Dano
                                </label>
                                <select
                                  value={spell.damage_type || 'força'}
                                  onChange={(e) => updateSpell(index, 'damage_type', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                                >
                                  {damageTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Alcance
                                </label>
                                <input
                                  type="text"
                                  value={spell.range}
                                  onChange={(e) => updateSpell(index, 'range', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                                  placeholder="Ex: 120 ft, Toque"
                                />
                              </div>
                            </div>

                            {/* Configuração de Dano da Magia */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Dano da Magia
                              </label>
                              <div className="flex items-center space-x-2 mb-4">
                                <input
                                  type="number"
                                  value={spell.damage?.dice_count || 1}
                                  onChange={(e) => {
                                    const newDamage = spell.damage || { dice_count: 1, dice_sides: 6, modifier: 0 };
                                    updateSpell(index, 'damage', { ...newDamage, dice_count: parseInt(e.target.value) || 1 });
                                  }}
                                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                  min="1"
                                  max="20"
                                />
                                <span className="text-gray-400">d</span>
                                <select
                                  value={spell.damage?.dice_sides || 6}
                                  onChange={(e) => {
                                    const newDamage = spell.damage || { dice_count: 1, dice_sides: 6, modifier: 0 };
                                    updateSpell(index, 'damage', { ...newDamage, dice_sides: parseInt(e.target.value) });
                                  }}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                                >
                                  <option value={4}>4</option>
                                  <option value={6}>6</option>
                                  <option value={8}>8</option>
                                  <option value={10}>10</option>
                                  <option value={12}>12</option>
                                  <option value={20}>20</option>
                                </select>
                                <span className="text-gray-400">+</span>
                                <input
                                  type="number"
                                  value={spell.damage?.modifier || 0}
                                  onChange={(e) => {
                                    const newDamage = spell.damage || { dice_count: 1, dice_sides: 6, modifier: 0 };
                                    updateSpell(index, 'damage', { ...newDamage, modifier: parseInt(e.target.value) || 0 });
                                  }}
                                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                />
                              </div>

                              {/* Botões de Rolagem da Magia */}
                              {spell.damage && (
                                <div className="flex items-center space-x-4">
                                  {spell.attack_bonus !== undefined && (
                                    <DiceRoller
                                      roll={{ dice_count: 1, dice_sides: 20, modifier: spell.attack_bonus }}
                                      label="Ataque Mágico"
                                      onRoll={(result) => console.log(`Ataque Mágico: ${result}`)}
                                    />
                                  )}
                                  <DiceRoller
                                    roll={spell.damage}
                                    label="Dano Mágico"
                                    onRoll={(result) => console.log(`Dano Mágico: ${result}`)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={spell.description || ''}
                          onChange={(e) => updateSpell(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Efeito da magia, duração, componentes..."
                        />
                      </div>
                    </div>
                  ))}

                  {formData.spells.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma magia configurada</p>
                      <p className="text-sm">Clique em "Adicionar Magia" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Habilidades */}
            {currentTab === 'abilities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Habilidades Especiais</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        abilities: [...prev.abilities, { name: '', description: '', usage: '' }]
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Habilidade</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.abilities.map((ability, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-medium">Habilidade {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              abilities: prev.abilities.filter((_, i) => i !== index)
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={ability.name}
                            onChange={(e) => {
                              const newAbilities = [...formData.abilities];
                              newAbilities[index] = { ...ability, name: e.target.value };
                              setFormData(prev => ({ ...prev, abilities: newAbilities }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Ataque Furtivo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Uso
                          </label>
                          <input
                            type="text"
                            value={ability.usage || ''}
                            onChange={(e) => {
                              const newAbilities = [...formData.abilities];
                              newAbilities[index] = { ...ability, usage: e.target.value };
                              setFormData(prev => ({ ...prev, abilities: newAbilities }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 1/dia, À vontade"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={ability.description}
                          onChange={(e) => {
                            const newAbilities = [...formData.abilities];
                            newAbilities[index] = { ...ability, description: e.target.value };
                            setFormData(prev => ({ ...prev, abilities: newAbilities }));
                            setHasUnsavedChanges(true);
                          }}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Descreva o efeito e como funciona..."
                        />
                      </div>
                    </div>
                  ))}

                  {formData.abilities.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma habilidade especial</p>
                      <p className="text-sm">Clique em "Adicionar Habilidade" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Roleplay */}
            {currentTab === 'roleplay' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Onde este NPC pode ser encontrado"
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
                      placeholder="Profissão ou papel do NPC"
                    />
                  </div>
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
                    placeholder="O que este NPC quer alcançar?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Segredos (Apenas GM)
                  </label>
                  <textarea
                    value={formData.secrets}
                    onChange={(e) => handleInputChange('secrets', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Informações secretas sobre este NPC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas do Mestre
                  </label>
                  <textarea
                    value={formData.gm_notes}
                    onChange={(e) => handleInputChange('gm_notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Notas pessoais sobre como interpretar este NPC"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Alterações não salvas</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.name.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};