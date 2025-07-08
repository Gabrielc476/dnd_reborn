// ===========================
// src/components/npc/EnhancedNPCModal.tsx
// VERSÃO COMPLETA COM SISTEMA DE DADOS E IMPORTAÇÃO D&D INTEGRADOS
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
import { DiceRoller, HPManager } from '@/components/DiceComponents';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';
import type { RollResult, NPCFormData, Attack, Spell, NPCAttributes, NPCStats, NPCAbility } from '@/types/enhancedNPC';

// Importação direta do modal de D&D
import { DnDImportModal } from '@/components/campaign-manage/DnDImportModal';

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

// ✅ CORRIGIDO: Interface local para NPCStats
interface LocalNPCStats {
  armor_class: number;
  hit_points: number;
  max_hit_points: number;
  temp_hit_points: number;
  speed: string; // String ao invés de number
  proficiency_bonus: number;
  passive_perception: number;
}

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
// DADOS PADRÃO DOS TIPOS
// ===========================

const DEFAULT_FORM_DATA: NPCFormData = {
  name: '',
  description: '',
  race: '',
  npc_class: '',
  npc_type: NPCType.NEUTRAL,
  alignment: '',
  location: '',
  occupation: '',
  faction: '',
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  stats: {
    armor_class: 10,
    hit_points: 1,
    max_hit_points: 1,
    temp_hit_points: 0,
    speed: '30 ft', // ✅ CORRIGIDO: String ao invés de número
    proficiency_bonus: 2,
    passive_perception: 10
  },
  saving_throws: {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  },
  skills: {},
  challenge_rating: '0', // ✅ CORRIGIDO: String ao invés de número
  attacks: [],
  spells: [],
  abilities: [],
  personality_traits: [],
  goals: '',
  secrets: '',
  gm_notes: '',
  is_alive: true,
  is_active: true
};

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

  // ADICIONADO: Estados para importação D&D
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // ADICIONADO: Hook para NPCs Enhanced
  const {
    rollAttack,
    rollDamage,
    castSpell,
    updateHitPoints,
    healNPC,
    damageNPC
  } = useEnhancedNPCs({
    campaignId,
    autoLoad: false // Não precisamos carregar todos os NPCs aqui
  });

  // Estado do formulário
  const [formData, setFormData] = useState<NPCFormData>(DEFAULT_FORM_DATA);

  // ===========================
  // EFEITOS
  // ===========================

  // Carregar dados do NPC
  useEffect(() => {
    if (npc) {
      setFormData({
        ...DEFAULT_FORM_DATA,
        ...npc,
        attributes: { ...DEFAULT_FORM_DATA.attributes, ...npc.attributes },
        stats: { ...DEFAULT_FORM_DATA.stats, ...npc.stats },
        saving_throws: { ...DEFAULT_FORM_DATA.saving_throws, ...npc.saving_throws }
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
    setValidationErrors([]);
    setHasUnsavedChanges(false);
    setImportSuccess(false);
  }, [npc, isOpen]);

  // ===========================
  // HANDLERS GERAIS
  // ===========================

  const handleInputChange = (field: keyof NPCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Limpar erros de validação quando o usuário corrigir
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleAttributeChange = (attribute: keyof NPCAttributes, value: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attribute]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const handleStatChange = (stat: keyof LocalNPCStats, value: number | string) => {
    let processedValue = value;
    
    // ✅ CORRIGIDO: Tratar speed como string sempre
    if (stat === 'speed') {
      processedValue = typeof value === 'number' ? `${value} ft` : value;
    }
    
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: processedValue }
    }));
    setHasUnsavedChanges(true);
  };

  // ADICIONADO: Handler para importação D&D
  const handleImportFromDnD = (importedData: any) => {
    try {
      console.log('📥 Dados importados da API D&D:', importedData);
      
      // Converter dados importados para o formato Enhanced NPC
      const enhancedNPCData: NPCFormData = {
        ...DEFAULT_FORM_DATA,
        name: importedData.name || '',
        description: importedData.description || '',
        race: importedData.race || '',
        npc_class: importedData.npc_class || '',
        npc_type: importedData.npc_type || NPCType.NEUTRAL,
        alignment: importedData.alignment || '',
        location: importedData.location || '',
        occupation: importedData.occupation || '',
        faction: importedData.faction || '',
        
        // CORRIGIDO: Mapear atributos corretamente da API D&D
        attributes: {
          strength: importedData.abilities?.strength || importedData.strength || 10,
          dexterity: importedData.abilities?.dexterity || importedData.dexterity || 10,
          constitution: importedData.abilities?.constitution || importedData.constitution || 10,
          intelligence: importedData.abilities?.intelligence || importedData.intelligence || 10,
          wisdom: importedData.abilities?.wisdom || importedData.wisdom || 10,
          charisma: importedData.abilities?.charisma || importedData.charisma || 10
        },
        
        // CORRIGIDO: Mapear estatísticas com tipos corretos
        stats: {
          armor_class: importedData.stats?.armor_class || extractArmorClass(importedData.armor_class) || 10,
          hit_points: importedData.stats?.hit_points || importedData.hit_points || 1,
          max_hit_points: importedData.stats?.hit_points || importedData.hit_points || 1,
          temp_hit_points: 0,
          speed: `${extractSpeed(importedData.speed)} ft`, // ✅ CORRIGIDO: String ao invés de número
          proficiency_bonus: importedData.proficiency_bonus || 2,
          passive_perception: 10
        },
        
        // Configurar saving throws básicos
        saving_throws: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        },
        
        challenge_rating: String(parseFloat(importedData.challenge_rating) || 0), // ✅ CORRIGIDO: String ao invés de float
        
        // NOVO: Converter ataques da API D&D
        attacks: convertDnDActionsToAttacks(importedData.actions || []),
        
        // NOVO: Converter magias/habilidades especiais 
        spells: convertDnDAbilitiesToSpells(importedData.special_abilities || []),
        
        // NOVO: Converter habilidades especiais para abilities
        abilities: convertDnDAbilitiesToNPCAbilities(importedData.special_abilities || [], importedData.legendary_actions || []),
        
        personality_traits: importedData.personality_traits || [],
        goals: importedData.goals || '',
        secrets: importedData.secrets || '',
        gm_notes: importedData.gm_notes || '',
        is_alive: true,
        is_active: true
      };
      
      setFormData(enhancedNPCData);
      setHasUnsavedChanges(true);
      setImportSuccess(true);
      
      // Resetar notificação após alguns segundos
      setTimeout(() => {
        setImportSuccess(false);
      }, 5000);
      
      console.log('✅ NPC Enhanced criado a partir da importação D&D');
      
    } catch (error) {
      console.error('❌ Erro ao processar dados importados:', error);
      setValidationErrors(['Erro ao processar dados da importação D&D. Tente novamente.']);
    }
  };

  // NOVO: Função auxiliar para extrair AC
  const extractArmorClass = (ac: any): number => {
    if (typeof ac === 'number') return ac;
    if (Array.isArray(ac) && ac.length > 0) {
      return ac[0].value || 10;
    }
    return 10;
  };

  // NOVO: Função auxiliar para extrair velocidade 
  const extractSpeed = (speed: any): number => {
    if (typeof speed === 'number') return speed;
    if (typeof speed === 'string') {
      const speedMatch = speed.replace(/[^0-9]/g, '');
      return parseInt(speedMatch) || 30;
    }
    if (typeof speed === 'object' && speed.walk) {
      const walkSpeed = speed.walk.replace(/[^0-9]/g, '');
      return parseInt(walkSpeed) || 30;
    }
    return 30;
  };

  // NOVO: Converter ações D&D para ataques Enhanced
  const convertDnDActionsToAttacks = (actions: any[]): Attack[] => {
    const attacks: Attack[] = [];
    
    actions.forEach((action, index) => {
      if (action.attack_bonus !== undefined || action.damage_dice) {
        // Extrair dados de dano
        let diceCount = 1, diceSides = 6, modifier = 0;
        
        if (action.damage_dice) {
          const diceMatch = action.damage_dice.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
          if (diceMatch) {
            diceCount = parseInt(diceMatch[1]) || 1;
            diceSides = parseInt(diceMatch[2]) || 6;
            modifier = parseInt(diceMatch[3]) || action.damage_bonus || 0;
          }
        }

        // Determinar tipo de dano baseado na descrição
        let damageType = 'slashing';
        const desc = (action.desc || '').toLowerCase();
        if (desc.includes('fire') || desc.includes('fogo')) damageType = 'fire';
        else if (desc.includes('cold') || desc.includes('frio')) damageType = 'cold';
        else if (desc.includes('lightning') || desc.includes('elétrico')) damageType = 'lightning';
        else if (desc.includes('piercing') || desc.includes('perfurante')) damageType = 'piercing';
        else if (desc.includes('bludgeoning') || desc.includes('contundente')) damageType = 'bludgeoning';

        attacks.push({
          id: `attack_${index}`,
          name: action.name || `Ataque ${index + 1}`,
          attack_bonus: action.attack_bonus || 0,
          damage: {
            dice_count: diceCount,
            dice_sides: diceSides,
            modifier: modifier
          },
          damage_type: damageType,
          range: desc.includes('ranged') || desc.includes('range') ? 'À distância' : 'Corpo a corpo',
          description: action.desc || ''
        });
      }
    });

    return attacks;
  };

  // NOVO: Converter habilidades especiais para magias
  const convertDnDAbilitiesToSpells = (abilities: any[]): Spell[] => {
    const spells: Spell[] = [];
    
    abilities.forEach((ability, index) => {
      const desc = (ability.desc || '').toLowerCase();
      
      // Verificar se é uma habilidade mágica
      if (desc.includes('spell') || desc.includes('magic') || desc.includes('magia') || 
          desc.includes('dc') || desc.includes('save')) {
        
        // Extrair dados de dano se houver
        let damage = null;
        const diceMatch = ability.desc?.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
        if (diceMatch) {
          damage = {
            dice_count: parseInt(diceMatch[1]) || 1,
            dice_sides: parseInt(diceMatch[2]) || 6,
            modifier: parseInt(diceMatch[3]) || 0
          };
        }

        // Extrair DC se houver
        const dcMatch = ability.desc?.match(/DC\s*(\d+)/i);
        const saveDC = dcMatch ? parseInt(dcMatch[1]) : 12;

        spells.push({
          id: `spell_${index}`,
          name: ability.name || `Habilidade Mágica ${index + 1}`,
          level: desc.includes('cantrip') ? 0 : (damage ? Math.min(Math.floor(damage.dice_count / 2) + 1, 9) : 1),
          school: 'evocation',
          description: ability.desc || '',
          casting_time: '1 ação',
          range: '60 pés',
          components: 'V, S',
          duration: 'Instantâneo',
          is_attack_spell: !!damage,
          damage: damage,
          save_dc: saveDC,
          save_ability: 'dexterity'
        });
      }
    });

    return spells;
  };

  // NOVO: Converter habilidades D&D para NPCAbilities
  const convertDnDAbilitiesToNPCAbilities = (specialAbilities: any[], legendaryActions: any[]): NPCAbility[] => {
    const abilities: NPCAbility[] = [];
    
    // Processar habilidades especiais
    specialAbilities.forEach((ability, index) => {
      abilities.push({
        id: `ability_${index}`,
        name: ability.name || `Habilidade ${index + 1}`,
        description: ability.desc || '',
        type: 'passive',
        uses_per_day: null,
        recharge_on: null
      });
    });

    // Processar ações lendárias
    legendaryActions.forEach((action, index) => {
      abilities.push({
        id: `legendary_${index}`,
        name: action.name || `Ação Lendária ${index + 1}`,
        description: action.desc || '',
        type: 'legendary',
        uses_per_day: 3, // Ações lendárias padrão
        recharge_on: null
      });
    });

    return abilities;
  };

  // ===========================
  // HANDLERS DE ATAQUES
  // ===========================

  const addAttack = () => {
    const newAttack: Attack = {
      id: Date.now().toString(),
      name: 'Novo Ataque',
      attack_bonus: 0,
      damage: {
        dice_count: 1,
        dice_sides: 6,
        modifier: 0
      },
      damage_type: 'slashing',
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
      id: Date.now().toString(),
      name: 'Nova Magia',
      level: 0,
      school: 'evocation',
      casting_time: '1 ação',
      range: '60 pés',
      components: 'V, S',
      duration: 'Instantâneo',
      description: '',
      is_attack_spell: false,
      damage: {
        dice_count: 1,
        dice_sides: 6,
        modifier: 0
      },
      save_dc: 10,
      save_ability: 'dexterity'
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
      id: Date.now().toString(),
      name: 'Nova Habilidade',
      description: '',
      type: 'passive',
      uses_per_day: null,
      recharge_on: null
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
  // HANDLERS DE ROLAGEM INTEGRADA
  // ===========================

  const handleAttackRoll = async (attackId: string, advantage: boolean = false, disadvantage: boolean = false) => {
    if (!formData.id) return;
    
    setIsRolling(true);
    try {
      const result = await rollAttack(formData.id, attackId, advantage, disadvantage);
      
      const historyEntry: RollHistoryEntry = {
        type: 'attack',
        result,
        description: `Rolagem de Ataque`,
        timestamp: new Date()
      };
      
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Erro ao rolar ataque:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleDamageRoll = async (attackId: string, critical: boolean = false) => {
    if (!formData.id) return;
    
    setIsRolling(true);
    try {
      const result = await rollDamage(formData.id, attackId, critical);
      
      const historyEntry: RollHistoryEntry = {
        type: 'damage',
        result,
        description: `Rolagem de Dano${critical ? ' (Crítico)' : ''}`,
        timestamp: new Date()
      };
      
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Erro ao rolar dano:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleSpellCast = async (spellId: string) => {
    if (!formData.id) return;
    
    setIsRolling(true);
    try {
      const result = await castSpell(formData.id, spellId);
      
      const historyEntry: RollHistoryEntry = {
        type: 'spell',
        result,
        description: `Lançamento de Magia`,
        timestamp: new Date()
      };
      
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Erro ao lançar magia:', error);
    } finally {
      setIsRolling(false);
    }
  };

  // ===========================
  // VALIDAÇÃO E SALVAMENTO
  // ===========================

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (!formData.npc_type) {
      errors.push('Tipo de NPC é obrigatório');
    }
    
    if (formData.stats.hit_points < 1) {
      errors.push('Pontos de vida devem ser pelo menos 1');
    }
    
    if (formData.stats.armor_class < 1) {
      errors.push('Classe de armadura deve ser pelo menos 1');
    }

    // ✅ ADICIONADO: Validar se speed é uma string
    if (typeof formData.stats.speed !== 'string') {
      errors.push('Velocidade deve ser uma string (ex: "30 ft")');
    }

    // ✅ ADICIONADO: Validar se challenge_rating é uma string
    if (typeof formData.challenge_rating !== 'string') {
      errors.push('Nível de desafio deve ser uma string (ex: "1", "0.25", "1/4")');
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      // ✅ ADICIONADO: Sanitizar dados antes de enviar
      const sanitizedData = {
        ...formData,
        // Garantir que speed seja string
        stats: {
          ...formData.stats,
          speed: typeof formData.stats.speed === 'string' 
            ? formData.stats.speed 
            : `${formData.stats.speed} ft`
        },
        // Garantir que challenge_rating seja string
        challenge_rating: typeof formData.challenge_rating === 'string' 
          ? formData.challenge_rating 
          : String(formData.challenge_rating)
      };

      console.log('📤 Dados sendo enviados para API:', sanitizedData);

      await onSave(sanitizedData);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar NPC:', error);
      setValidationErrors([`Erro ao salvar NPC: ${error.message || error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges && mode !== 'view') {
      if (confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
        onClose();
      }
    } else {
      onClose();
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'create' ? 'Criar NPC Enhanced' : mode === 'edit' ? 'Editar NPC' : 'Visualizar NPC'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {mode === 'create' ? 'Criar um novo NPC com funcionalidades avançadas' : 
                   mode === 'edit' ? 'Modificar informações do NPC' : 
                   'Visualizar detalhes do NPC'}
                </p>
              </div>
              {hasUnsavedChanges && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Alterações não salvas" />
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botão de Importação D&D - apenas para novos NPCs */}
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-lg shadow-purple-500/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Importar D&D</span>
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Notificação de Importação Bem-sucedida */}
          {importSuccess && (
            <div className="mx-6 mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">NPC importado com sucesso da API D&D!</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Os dados foram carregados automaticamente. Você pode editá-los antes de salvar.
              </p>
            </div>
          )}

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
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Histórico de Rolagens */}
              {rollHistory.length > 0 && mode !== 'create' && (
                <div className="flex-1 p-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Últimas Rolagens
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rollHistory.slice(0, 5).map((entry, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-purple-400">{entry.description}</span>
                          <span className="text-green-400 font-bold">{entry.result.total}</span>
                        </div>
                        {entry.result.rolls && (
                          <span className="text-xs text-gray-500">
                            [{entry.result.rolls.join(', ')}]
                          </span>
                        )}
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
                        Tipo de NPC *
                      </label>
                      <select
                        value={formData.npc_type}
                        onChange={(e) => handleInputChange('npc_type', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        disabled={mode === 'view'}
                      >
                        <option value={NPCType.ALLY}>Aliado</option>
                        <option value={NPCType.ENEMY}>Inimigo</option>
                        <option value={NPCType.NEUTRAL}>Neutro</option>
                        <option value={NPCType.MERCHANT}>Mercador</option>
                        <option value={NPCType.QUEST_GIVER}>Dador de Missões</option>
                        <option value={NPCType.BACKGROUND}>Cenário</option>
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
                        placeholder="Ex: Humano, Elfo..."
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
                        placeholder="Ex: Guerreiro, Mago..."
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
                        placeholder="Ex: Neutro Bom"
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
                        placeholder="Profissão ou papel"
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
                      placeholder="Aparência e descrição geral do NPC..."
                      disabled={mode === 'view'}
                    />
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
                      placeholder="Ex: 0, 1/4, 1/2, 1, 2..."
                      disabled={mode === 'view'}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Formatos aceitos: 0, 0.25, 1/4, 1/2, 1, 2, etc.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Atributos */}
              {currentTab === 'stats' && (
                <div className="space-y-6">
                  
                  {/* Atributos Básicos */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Atributos Básicos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(formData.attributes).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                            {key === 'strength' ? 'Força' :
                             key === 'dexterity' ? 'Destreza' :
                             key === 'constitution' ? 'Constituição' :
                             key === 'intelligence' ? 'Inteligência' :
                             key === 'wisdom' ? 'Sabedoria' : 'Carisma'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={value}
                            onChange={(e) => handleAttributeChange(key as keyof NPCAttributes, parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            Modificador: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estatísticas de Combate */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Estatísticas de Combate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Classe de Armadura
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={formData.stats.armor_class}
                          onChange={(e) => handleStatChange('armor_class', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pontos de Vida Atuais
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stats.hit_points}
                          onChange={(e) => handleStatChange('hit_points', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pontos de Vida Máximos
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.stats.max_hit_points}
                          onChange={(e) => handleStatChange('max_hit_points', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pontos de Vida Temporários
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stats.temp_hit_points}
                          onChange={(e) => handleStatChange('temp_hit_points', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
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
                          onChange={(e) => handleStatChange('speed', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: 30 ft, fly 60 ft"
                          disabled={mode === 'view'}
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          Formato: "30 ft" ou "30 ft, fly 60 ft"
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bônus de Proficiência
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="9"
                          value={formData.stats.proficiency_bonus}
                          onChange={(e) => handleStatChange('proficiency_bonus', parseInt(e.target.value) || 2)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                          disabled={mode === 'view'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* HP Manager Component */}
                  {mode !== 'create' && formData.id && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Gerenciamento de HP</h3>
                      <HPManager
                        currentHP={formData.stats.hit_points}
                        maxHP={formData.stats.max_hit_points}
                        tempHP={formData.stats.temp_hit_points}
                        onHPChange={(newHP, newTempHP) => {
                          handleStatChange('hit_points', newHP);
                          if (newTempHP !== undefined) {
                            handleStatChange('temp_hit_points', newTempHP);
                          }
                        }}
                        disabled={mode === 'view'}
                        showQuickActions={true}
                        showTempHP={true}
                      />
                    </div>
                  )}
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
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Ataque</span>
                      </button>
                    )}
                  </div>

                  {formData.attacks.map((attack, index) => (
                    <div key={attack.id || index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Ataque #{index + 1}</h4>
                        {mode !== 'view' && (
                          <button
                            onClick={() => removeAttack(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nome do Ataque
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
                            Dados de Dano (qtd)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={attack.damage.dice_count}
                            onChange={(e) => updateAttack(index, 'damage', {
                              ...attack.damage,
                              dice_count: parseInt(e.target.value) || 1
                            })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Lados do Dado
                          </label>
                          <select
                            value={attack.damage.dice_sides}
                            onChange={(e) => updateAttack(index, 'damage', {
                              ...attack.damage,
                              dice_sides: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            <option value={4}>d4</option>
                            <option value={6}>d6</option>
                            <option value={8}>d8</option>
                            <option value={10}>d10</option>
                            <option value={12}>d12</option>
                            <option value={20}>d20</option>
                            <option value={100}>d100</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Modificador de Dano
                          </label>
                          <input
                            type="number"
                            value={attack.damage.modifier}
                            onChange={(e) => updateAttack(index, 'damage', {
                              ...attack.damage,
                              modifier: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            Fórmula: {attack.damage.dice_count}d{attack.damage.dice_sides}{attack.damage.modifier !== 0 ? (attack.damage.modifier > 0 ? `+${attack.damage.modifier}` : attack.damage.modifier) : ''}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Tipo de Dano
                          </label>
                          <select
                            value={attack.damage_type}
                            onChange={(e) => updateAttack(index, 'damage_type', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            <option value="slashing">Cortante</option>
                            <option value="piercing">Perfurante</option>
                            <option value="bludgeoning">Contundente</option>
                            <option value="fire">Fogo</option>
                            <option value="cold">Frio</option>
                            <option value="lightning">Elétrico</option>
                            <option value="acid">Ácido</option>
                            <option value="poison">Veneno</option>
                            <option value="psychic">Psíquico</option>
                            <option value="necrotic">Necrótico</option>
                            <option value="radiant">Radiante</option>
                            <option value="force">Força</option>
                            <option value="thunder">Trovão</option>
                          </select>
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

                      {/* Botões de rolagem integrados - versão simplificada */}
                      {mode !== 'create' && attack.id && (
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleAttackRoll(attack.id!, false, false)}
                            disabled={isRolling}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Target className="w-4 h-4" />
                            <span>Atacar</span>
                          </button>
                          <button
                            onClick={() => handleDamageRoll(attack.id!, false)}
                            disabled={isRolling}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Swords className="w-4 h-4" />
                            <span>Dano</span>
                          </button>
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
                    {mode !== 'view' && (
                      <button
                        onClick={addSpell}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Magia</span>
                      </button>
                    )}
                  </div>

                  {formData.spells.map((spell, index) => (
                    <div key={spell.id || index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Magia #{index + 1}</h4>
                        {mode !== 'view' && (
                          <button
                            onClick={() => removeSpell(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nome da Magia
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
                          <select
                            value={spell.level}
                            onChange={(e) => updateSpell(index, 'level', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            {[0,1,2,3,4,5,6,7,8,9].map(level => (
                              <option key={level} value={level}>
                                {level === 0 ? 'Truque' : `${level}º nível`}
                              </option>
                            ))}
                          </select>
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
                            <option value="evocation">Evocação</option>
                            <option value="enchantment">Encantamento</option>
                            <option value="illusion">Ilusão</option>
                            <option value="necromancy">Necromancia</option>
                            <option value="conjuration">Conjuração</option>
                            <option value="abjuration">Abjuração</option>
                            <option value="divination">Adivinhação</option>
                            <option value="transmutation">Transmutação</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Tempo de Conjuração
                          </label>
                          <input
                            type="text"
                            value={spell.casting_time}
                            onChange={(e) => updateSpell(index, 'casting_time', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 1 ação"
                            disabled={mode === 'view'}
                          />
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
                            placeholder="Ex: 150 pés"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Duração
                          </label>
                          <input
                            type="text"
                            value={spell.duration}
                            onChange={(e) => updateSpell(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Instantâneo"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Componentes
                          </label>
                          <input
                            type="text"
                            value={spell.components}
                            onChange={(e) => updateSpell(index, 'components', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: V, S, M"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            É Magia de Ataque?
                          </label>
                          <select
                            value={spell.is_attack_spell ? 'true' : 'false'}
                            onChange={(e) => updateSpell(index, 'is_attack_spell', e.target.value === 'true')}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                          </select>
                        </div>

                        {spell.is_attack_spell && spell.damage && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Dados de Dano (qtd)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={spell.damage.dice_count}
                                onChange={(e) => updateSpell(index, 'damage', {
                                  ...spell.damage!,
                                  dice_count: parseInt(e.target.value) || 1
                                })}
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                                disabled={mode === 'view'}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Lados do Dado
                              </label>
                              <select
                                value={spell.damage.dice_sides}
                                onChange={(e) => updateSpell(index, 'damage', {
                                  ...spell.damage!,
                                  dice_sides: parseInt(e.target.value)
                                })}
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                                disabled={mode === 'view'}
                              >
                                <option value={4}>d4</option>
                                <option value={6}>d6</option>
                                <option value={8}>d8</option>
                                <option value={10}>d10</option>
                                <option value={12}>d12</option>
                                <option value={20}>d20</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Modificador de Dano
                              </label>
                              <input
                                type="number"
                                value={spell.damage.modifier}
                                onChange={(e) => updateSpell(index, 'damage', {
                                  ...spell.damage!,
                                  modifier: parseInt(e.target.value) || 0
                                })}
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                                disabled={mode === 'view'}
                              />
                              <div className="text-xs text-gray-400 mt-1">
                                Fórmula: {spell.damage.dice_count}d{spell.damage.dice_sides}{spell.damage.modifier !== 0 ? (spell.damage.modifier > 0 ? `+${spell.damage.modifier}` : spell.damage.modifier) : ''}
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            DC de Resistência
                          </label>
                          <input
                            type="number"
                            min="8"
                            max="30"
                            value={spell.save_dc}
                            onChange={(e) => updateSpell(index, 'save_dc', parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Atributo de Resistência
                          </label>
                          <select
                            value={spell.save_ability}
                            onChange={(e) => updateSpell(index, 'save_ability', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            <option value="strength">Força</option>
                            <option value="dexterity">Destreza</option>
                            <option value="constitution">Constituição</option>
                            <option value="intelligence">Inteligência</option>
                            <option value="wisdom">Sabedoria</option>
                            <option value="charisma">Carisma</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={spell.description}
                          onChange={(e) => updateSpell(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Efeitos da magia..."
                          disabled={mode === 'view'}
                        />
                      </div>

                      {/* Botões de rolagem integrados - versão simplificada */}
                      {mode !== 'create' && spell.id && (
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleSpellCast(spell.id!)}
                            disabled={isRolling}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Wand2 className="w-4 h-4" />
                            <span>Lançar Magia</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.spells.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma magia configurada</p>
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
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Habilidade</span>
                      </button>
                    )}
                  </div>

                  {formData.abilities.map((ability, index) => (
                    <div key={ability.id || index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Habilidade #{index + 1}</h4>
                        {mode !== 'view' && (
                          <button
                            onClick={() => removeAbility(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nome da Habilidade
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
                            Tipo
                          </label>
                          <select
                            value={ability.type}
                            onChange={(e) => updateAbility(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          >
                            <option value="passive">Passiva</option>
                            <option value="action">Ação</option>
                            <option value="bonus_action">Ação Bônus</option>
                            <option value="reaction">Reação</option>
                            <option value="legendary">Lendária</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Usos por Dia
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ability.uses_per_day || ''}
                            onChange={(e) => updateAbility(index, 'uses_per_day', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Deixe vazio para uso ilimitado"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Recarrega em (d6)
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="6"
                            value={ability.recharge_on || ''}
                            onChange={(e) => updateAbility(index, 'recharge_on', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 5-6"
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
                          placeholder="Efeitos e regras da habilidade..."
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
                      Notas do Mestre
                    </label>
                    <textarea
                      value={formData.gm_notes}
                      onChange={(e) => handleInputChange('gm_notes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Notas e lembretes para o GM..."
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {mode !== 'view' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">NPC Ativo</span>
                  </label>
                )}
                
                {mode !== 'view' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_alive}
                      onChange={(e) => handleInputChange('is_alive', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">NPC Vivo</span>
                  </label>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  {mode === 'view' ? 'Fechar' : 'Cancelar'}
                </button>
                
                {mode !== 'view' && (
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>{mode === 'edit' ? 'Atualizar NPC' : 'Criar NPC'}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Importação D&D */}
      {showImportModal && (
        <React.Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="text-white">Carregando importador D&D...</span>
              </div>
            </div>
          </div>
        }>
          <DnDImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportFromDnD}
          />
        </React.Suspense>
      )}
    </>
  );
};