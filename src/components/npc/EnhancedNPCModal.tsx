// ===========================
// src/components/npc/EnhancedNPCModal.tsx
// VERSÃO COMPLETA COM SISTEMA DE LOGS DE DEBUG INTEGRADOS
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
import { DnDImportModal } from '@/components/campaign-manage/gm/DnDImportModal';

// ===========================
// MAPEAMENTO DE TIPOS DE DANO: INGLÊS → PORTUGUÊS
// ===========================

const DAMAGE_TYPE_MAPPING = {
  // Inglês → Português (conforme aceito pela API)
  'acid': 'ácido',
  'bludgeoning': 'contundente',
  'cold': 'frio',
  'fire': 'fogo',
  'force': 'força',
  'lightning': 'elétrico',
  'necrotic': 'necrótico',
  'piercing': 'perfurante',
  'poison': 'venenoso',
  'psychic': 'psíquico',
  'radiant': 'radiante',
  'slashing': 'cortante',
  'thunder': 'sônico'
};

// Função para traduzir tipo de dano
const translateDamageType = (englishType: string): string => {
  const translated = DAMAGE_TYPE_MAPPING[englishType.toLowerCase()];
  const result = translated || 'cortante'; // Default para cortante se não encontrar
  console.log(`🔄 Traduzindo tipo de dano: "${englishType}" → "${result}"`);
  return result;
};

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
  const [hasImportedData, setHasImportedData] = useState(false); // 🔥 NOVO: Controla se há dados importados

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
  // EFEITOS COM LOGS DE DEBUG
  // ===========================

  // Carregar dados do NPC com logs detalhados - CORRIGIDO para importação
  useEffect(() => {
    console.group('🔄 DEBUG: useEffect - Inicialização do Formulário');
    console.log('- isOpen:', isOpen);
    console.log('- npc prop recebido:', npc);
    console.log('- importSuccess atual:', importSuccess);
    console.log('- hasImportedData atual:', hasImportedData);
    console.log('- formData.name atual:', formData.name);
    
    if (isOpen) {
      if (npc) {
        console.log('📝 Modo: EDIÇÃO');
        console.log('- NPC para edição:', npc);
        
        const mergedData = {
          ...DEFAULT_FORM_DATA,
          ...npc,
          attributes: { ...DEFAULT_FORM_DATA.attributes, ...npc.attributes },
          stats: { ...DEFAULT_FORM_DATA.stats, ...npc.stats },
          saving_throws: { ...DEFAULT_FORM_DATA.saving_throws, ...npc.saving_throws }
        };
        
        console.log('- Dados mesclados para edição:', mergedData);
        setFormData(mergedData);
        setHasImportedData(false); // Reset para modo edição
      } else if (!hasImportedData) {
        // 🔥 CORREÇÃO: Só resetar para padrão se não há dados importados
        console.log('📝 Modo: CRIAÇÃO (sem dados importados)');
        console.log('- Usando dados padrão:', DEFAULT_FORM_DATA);
        setFormData(DEFAULT_FORM_DATA);
      } else {
        console.log('📝 Modo: CRIAÇÃO (preservando dados importados)');
        console.log('- Dados importados preservados');
      }
      
      // Só resetar erros se não for importação
      if (!importSuccess && !hasImportedData) {
        setValidationErrors([]);
        setHasUnsavedChanges(false);
      }
    } else {
      // 🔥 NOVO: Reset ao fechar modal
      setHasImportedData(false);
      setImportSuccess(false);
    }
    
    console.groupEnd();
  }, [npc, isOpen, hasImportedData]); // 🔥 Adicionado hasImportedData como dependência

  // Adicione este useEffect para monitorar mudanças no formData
  useEffect(() => {
    console.log('📊 ESTADO DO FORMULÁRIO ATUALIZADO:');
    console.log('- FormData atual:', formData);
    console.log('- Quantidade de ataques:', formData.attacks?.length || 0);
    console.log('- Quantidade de magias:', formData.spells?.length || 0);
    console.log('- Quantidade de habilidades:', formData.abilities?.length || 0);
    console.log('- Atributos atuais:', formData.attributes);
  }, [formData]);

  // ===========================
  // FUNÇÕES DE DEBUG PARA RENDERIZAÇÃO
  // ===========================

  // LOG para renderização de ataques
  const debugAttacksRender = () => {
    console.log('🎯 RENDERIZAÇÃO DE ATAQUES:');
    console.log('- Ataques disponíveis:', formData.attacks);
    console.log('- Quantidade:', formData.attacks?.length || 0);
    formData.attacks?.forEach((attack, index) => {
      console.log(`  - Ataque ${index}:`, attack);
    });
  };

  // LOG para renderização de magias
  const debugSpellsRender = () => {
    console.log('🔮 RENDERIZAÇÃO DE MAGIAS:');
    console.log('- Magias disponíveis:', formData.spells);
    console.log('- Quantidade:', formData.spells?.length || 0);
    formData.spells?.forEach((spell, index) => {
      console.log(`  - Magia ${index}:`, spell);
    });
  };

  // LOG para renderização de habilidades
  const debugAbilitiesRender = () => {
    console.log('✨ RENDERIZAÇÃO DE HABILIDADES:');
    console.log('- Habilidades disponíveis:', formData.abilities);
    console.log('- Quantidade:', formData.abilities?.length || 0);
    formData.abilities?.forEach((ability, index) => {
      console.log(`  - Habilidade ${index}:`, ability);
    });
  };

  // LOG para renderização de atributos
  const debugAttributesRender = () => {
    console.log('📊 RENDERIZAÇÃO DE ATRIBUTOS:');
    console.log('- Atributos atuais:', formData.attributes);
    Object.entries(formData.attributes || {}).forEach(([attr, value]) => {
      console.log(`  - ${attr}: ${value}`);
    });
  };

  // ===========================
  // FUNÇÕES AUXILIARES COM LOGS
  // ===========================

  const extractArmorClass = (ac: any): number => {
    console.log('🔍 extractArmorClass - Entrada:', ac);
    
    let result = 10;
    
    if (typeof ac === 'number') {
      result = ac;
    } else if (Array.isArray(ac) && ac.length > 0) {
      // 🔥 CORREÇÃO: Melhor handling do array armor_class da API D&D
      const firstAC = ac[0];
      if (typeof firstAC === 'number') {
        result = firstAC;
        console.log('🔍 AC extraído de array (número direto):', firstAC);
      } else if (typeof firstAC === 'object' && firstAC.value) {
        result = firstAC.value;
        console.log('🔍 AC extraído de array (objeto.value):', firstAC.value);
      } else if (typeof firstAC === 'object' && firstAC.ac) {
        result = firstAC.ac;
        console.log('🔍 AC extraído de array (objeto.ac):', firstAC.ac);
      } else {
        console.log('🔍 AC extraído de array (estrutura desconhecida):', firstAC);
        // Tentar extrair qualquer número do primeiro elemento
        const acString = JSON.stringify(firstAC);
        const acMatch = acString.match(/\d+/);
        if (acMatch) {
          result = parseInt(acMatch[0]);
          console.log('🔍 AC extraído por regex:', result);
        }
      }
    } else if (typeof ac === 'object' && ac) {
      if (ac.value) {
        result = ac.value;
        console.log('🔍 AC extraído de objeto.value:', ac.value);
      } else if (ac.ac) {
        result = ac.ac;
        console.log('🔍 AC extraído de objeto.ac:', ac.ac);
      }
    }
    
    console.log('🔍 extractArmorClass - Saída:', result);
    return result;
  };

  const extractSpeed = (speed: any): number => {
    console.log('🔍 extractSpeed - Entrada:', speed);
    
    let result = 30;
    
    if (typeof speed === 'number') {
      result = speed;
    } else if (typeof speed === 'string') {
      const speedMatch = speed.replace(/[^0-9]/g, '');
      result = parseInt(speedMatch) || 30;
      console.log('🔍 Speed extraído de string:', speedMatch);
    } else if (typeof speed === 'object' && speed) {
      // 🔥 CORREÇÃO: Melhor handling do objeto speed da API D&D
      if (speed.walk) {
        if (typeof speed.walk === 'string') {
          const walkSpeed = speed.walk.replace(/[^0-9]/g, '');
          result = parseInt(walkSpeed) || 30;
          console.log('🔍 Speed extraído de objeto.walk (string):', walkSpeed);
        } else if (typeof speed.walk === 'number') {
          result = speed.walk;
          console.log('🔍 Speed extraído de objeto.walk (number):', speed.walk);
        }
      } else if (speed.value) {
        result = speed.value;
        console.log('🔍 Speed extraído de objeto.value:', speed.value);
      } else {
        // Tentar pegar o primeiro valor do objeto
        const firstValue = Object.values(speed)[0];
        if (typeof firstValue === 'string') {
          const speedMatch = firstValue.replace(/[^0-9]/g, '');
          result = parseInt(speedMatch) || 30;
          console.log('🔍 Speed extraído do primeiro valor do objeto:', speedMatch);
        } else if (typeof firstValue === 'number') {
          result = firstValue;
          console.log('🔍 Speed extraído do primeiro valor numérico:', firstValue);
        }
      }
    }
    
    console.log('🔍 extractSpeed - Saída:', result);
    return result;
  };

  // ===========================
  // FUNÇÕES DE CONVERSÃO COM LOGS DETALHADOS
  // ===========================

  const convertDnDActionsToAttacks = (actions: any[]): Attack[] => {
    console.log('🔍 convertDnDActionsToAttacks - Entrada:', actions);
    const attacks: Attack[] = [];
    
    actions.forEach((action, index) => {
      console.log(`🔍 Processando ação ${index}:`, action);
      
      if (action.attack_bonus !== undefined || action.damage_dice) {
        // Extrair dados de dano
        let diceCount = 1, diceSides = 6, modifier = 0;
        
        if (action.damage_dice) {
          const diceMatch = action.damage_dice.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
          console.log(`🎲 Regex de dano para "${action.damage_dice}":`, diceMatch);
          
          if (diceMatch) {
            diceCount = parseInt(diceMatch[1]) || 1;
            diceSides = parseInt(diceMatch[2]) || 6;
            modifier = parseInt(diceMatch[3]) || action.damage_bonus || 0;
          }
        }

        // Determinar tipo de dano baseado na descrição
        let damageType = 'slashing';
        const desc = (action.desc || '').toLowerCase();
        console.log(`🔍 Analisando descrição para tipo de dano: "${desc}"`);
        
        if (desc.includes('fire') || desc.includes('fogo')) damageType = 'fire';
        else if (desc.includes('cold') || desc.includes('frio')) damageType = 'cold';
        else if (desc.includes('lightning') || desc.includes('elétrico')) damageType = 'lightning';
        else if (desc.includes('piercing') || desc.includes('perfurante')) damageType = 'piercing';
        else if (desc.includes('bludgeoning') || desc.includes('contundente')) damageType = 'bludgeoning';
        else if (desc.includes('acid') || desc.includes('ácido')) damageType = 'acid';
        else if (desc.includes('poison') || desc.includes('veneno')) damageType = 'poison';
        else if (desc.includes('necrotic') || desc.includes('necrótico')) damageType = 'necrotic';
        else if (desc.includes('radiant') || desc.includes('radiante')) damageType = 'radiant';
        else if (desc.includes('psychic') || desc.includes('psíquico')) damageType = 'psychic';
        else if (desc.includes('thunder') || desc.includes('trovão')) damageType = 'thunder';
        else if (desc.includes('force') || desc.includes('força')) damageType = 'force';

        const newAttack = {
          id: `attack_${index}`,
          name: action.name || `Ataque ${index + 1}`,
          attack_bonus: action.attack_bonus || 0,
          damage: {
            dice_count: diceCount,
            dice_sides: diceSides,
            modifier: modifier
          },
          damage_type: translateDamageType(damageType), // 🔥 APLICAR TRADUÇÃO
          range: desc.includes('ranged') || desc.includes('range') ? 'À distância' : 'Corpo a corpo',
          description: action.desc || ''
        };
        
        console.log(`✅ Ataque ${index} criado:`, newAttack);
        attacks.push(newAttack);
      } else {
        console.log(`⚠️ Ação ${index} ignorada (sem attack_bonus ou damage_dice):`, action);
      }
    });

    console.log('🔍 convertDnDActionsToAttacks - Saída:', attacks);
    return attacks;
  };

  const convertDnDAbilitiesToSpells = (abilities: any[]): Spell[] => {
    console.log('🔍 convertDnDAbilitiesToSpells - Entrada:', abilities);
    const spells: Spell[] = [];
    
    abilities.forEach((ability, index) => {
      console.log(`🔍 Processando habilidade ${index}:`, ability);
      
      const desc = (ability.desc || '').toLowerCase();
      console.log(`🔍 Descrição para análise mágica: "${desc}"`);
      
      // Verificar se é uma habilidade mágica
      const isMagical = desc.includes('spell') || desc.includes('magic') || desc.includes('magia') || 
                       desc.includes('dc') || desc.includes('save');
      
      console.log(`🔮 É habilidade mágica? ${isMagical}`);
      
      if (isMagical) {
        // Extrair dados de dano se houver
        let damage = null;
        const diceMatch = ability.desc?.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
        console.log(`🎲 Regex de dano para magia "${ability.desc}":`, diceMatch);
        
        if (diceMatch) {
          damage = {
            dice_count: parseInt(diceMatch[1]) || 1,
            dice_sides: parseInt(diceMatch[2]) || 6,
            modifier: parseInt(diceMatch[3]) || 0
          };
          console.log(`💥 Dano extraído:`, damage);
        }

        // Extrair DC se houver
        const dcMatch = ability.desc?.match(/DC\s*(\d+)/i);
        const saveDC = dcMatch ? parseInt(dcMatch[1]) : 12;
        console.log(`🛡️ DC extraído: ${saveDC} (match: ${dcMatch})`);

        const newSpell = {
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
        };
        
        console.log(`✅ Magia ${index} criada:`, newSpell);
        spells.push(newSpell);
      } else {
        console.log(`⚠️ Habilidade ${index} ignorada (não é mágica):`, ability);
      }
    });

    console.log('🔍 convertDnDAbilitiesToSpells - Saída:', spells);
    return spells;
  };

  const convertDnDAbilitiesToNPCAbilities = (specialAbilities: any[], legendaryActions: any[]): NPCAbility[] => {
    console.log('🔍 convertDnDAbilitiesToNPCAbilities - Entradas:');
    console.log('- Habilidades especiais:', specialAbilities);
    console.log('- Ações lendárias:', legendaryActions);
    
    const abilities: NPCAbility[] = [];
    
    // Processar habilidades especiais
    specialAbilities.forEach((ability, index) => {
      console.log(`🔍 Processando habilidade especial ${index}:`, ability);
      
      const newAbility = {
        id: `ability_${index}`,
        name: ability.name || `Habilidade ${index + 1}`,
        description: ability.desc || '',
        type: 'passive',
        uses_per_day: null,
        recharge_on: null
      };
      
      console.log(`✅ Habilidade especial ${index} criada:`, newAbility);
      abilities.push(newAbility);
    });

    // Processar ações lendárias
    legendaryActions.forEach((action, index) => {
      console.log(`🔍 Processando ação lendária ${index}:`, action);
      
      const newAbility = {
        id: `legendary_${index}`,
        name: action.name || `Ação Lendária ${index + 1}`,
        description: action.desc || '',
        type: 'legendary',
        uses_per_day: 3, // Ações lendárias padrão
        recharge_on: null
      };
      
      console.log(`✅ Ação lendária ${index} criada:`, newAbility);
      abilities.push(newAbility);
    });

    console.log('🔍 convertDnDAbilitiesToNPCAbilities - Saída:', abilities);
    return abilities;
  };

  // 🔥 NOVAS FUNÇÕES: Processar abilities já processadas pela API
  const convertProcessedAbilitiesToAttacks = (processedAbilities: any[]): Attack[] => {
    console.log('🔍 convertProcessedAbilitiesToAttacks - Entrada:', processedAbilities);
    const attacks: Attack[] = [];
    
    processedAbilities.forEach((ability, index) => {
      console.log(`🔍 Analisando ability ${index} para ataques:`, ability);
      
      // Verificar se é um ataque (tipo 'action' e tem dados de ataque)
      if (ability.type === 'action' && ability.description) {
        const desc = ability.description.toLowerCase();
        
        // Procurar por padrões de ataque
        if (desc.includes('weapon attack') || desc.includes('to hit') || desc.includes('damage')) {
          console.log(`🎯 Ability ${index} identificada como ataque`);
          
          // Extrair bônus de ataque
          const attackMatch = desc.match(/([+-]?\d+)\s*to\s*hit/i);
          const attackBonus = attackMatch ? parseInt(attackMatch[1]) : 0;
          
          // Extrair dados de dano
          const diceMatch = desc.match(/(\d+)\s*\((\d+)d(\d+)(?:\s*[+-]\s*(\d+))?\)\s*(\w+)/i);
          let damage = { dice_count: 1, dice_sides: 6, modifier: 0 };
          let damageType = 'bludgeoning';
          
          if (diceMatch) {
            damage = {
              dice_count: parseInt(diceMatch[2]) || 1,
              dice_sides: parseInt(diceMatch[3]) || 6,
              modifier: parseInt(diceMatch[4]) || 0
            };
            // Detectar tipo de dano da descrição em inglês
            const damageTypeFromDesc = diceMatch[5]?.toLowerCase() || 'bludgeoning';
            console.log(`🔍 Tipo de dano detectado na descrição: "${damageTypeFromDesc}"`);
            damageType = damageTypeFromDesc;
          }
          
          // Análise adicional da descrição para tipos de dano
          if (desc.includes('fire')) damageType = 'fire';
          else if (desc.includes('cold')) damageType = 'cold';
          else if (desc.includes('lightning')) damageType = 'lightning';
          else if (desc.includes('piercing')) damageType = 'piercing';
          else if (desc.includes('slashing')) damageType = 'slashing';
          else if (desc.includes('acid')) damageType = 'acid';
          else if (desc.includes('poison')) damageType = 'poison';
          else if (desc.includes('necrotic')) damageType = 'necrotic';
          else if (desc.includes('radiant')) damageType = 'radiant';
          else if (desc.includes('psychic')) damageType = 'psychic';
          else if (desc.includes('thunder')) damageType = 'thunder';
          else if (desc.includes('force')) damageType = 'force';
          
          const newAttack = {
            id: `processed_attack_${index}`,
            name: ability.name || `Ataque ${index + 1}`,
            attack_bonus: attackBonus,
            damage: damage,
            damage_type: translateDamageType(damageType), // 🔥 APLICAR TRADUÇÃO
            range: desc.includes('ranged') ? 'À distância' : 'Corpo a corpo',
            description: ability.description || ''
          };
          
          console.log(`✅ Ataque processado ${index} criado:`, newAttack);
          attacks.push(newAttack);
        } else {
          console.log(`⚠️ Ability ${index} não é um ataque reconhecido`);
        }
      }
    });

    console.log('🔍 convertProcessedAbilitiesToAttacks - Saída:', attacks);
    return attacks;
  };

  const convertProcessedAbilitiesToSpells = (processedAbilities: any[]): Spell[] => {
    console.log('🔍 convertProcessedAbilitiesToSpells - Entrada:', processedAbilities);
    const spells: Spell[] = [];
    
    processedAbilities.forEach((ability, index) => {
      console.log(`🔍 Analisando ability ${index} para magias:`, ability);
      
      // Verificar se é uma habilidade de conjuração
      if (ability.type === 'special' && ability.description) {
        const desc = ability.description.toLowerCase();
        
        if (desc.includes('spellcaster') || desc.includes('spell') || desc.includes('cantrip')) {
          console.log(`🔮 Ability ${index} identificada como conjuração`);
          
          // Extrair magias específicas mencionadas
          const spellMatches = desc.match(/(\w+(?:\s+\w+)*?)(?=,|\sand\s|\.|$)/g);
          
          if (spellMatches) {
            spellMatches.forEach((spellName, spellIndex) => {
              // Filtrar palavras comuns que não são magias
              if (spellName.length > 3 && !['the', 'and', 'its', 'can', 'has', 'may'].includes(spellName.trim())) {
                const newSpell = {
                  id: `processed_spell_${index}_${spellIndex}`,
                  name: spellName.trim(),
                  level: desc.includes('cantrip') ? 0 : 1,
                  school: 'evocation',
                  description: `Magia extraída de: ${ability.description}`,
                  casting_time: '1 ação',
                  range: '60 pés',
                  components: 'V, S',
                  duration: 'Instantâneo',
                  is_attack_spell: false,
                  damage: null,
                  save_dc: 12,
                  save_ability: 'wisdom'
                };
                
                console.log(`✅ Magia processada criada: ${spellName.trim()}`);
                spells.push(newSpell);
              }
            });
          }
        }
      }
    });

    console.log('🔍 convertProcessedAbilitiesToSpells - Saída:', spells);
    return spells;
  };

  const convertProcessedAbilitiesToNPCAbilities = (processedAbilities: any[]): NPCAbility[] => {
    console.log('🔍 convertProcessedAbilitiesToNPCAbilities - Entrada:', processedAbilities);
    const abilities: NPCAbility[] = [];
    
    processedAbilities.forEach((ability, index) => {
      console.log(`🔍 Processando ability ${index}:`, ability);
      
      // Todas as abilities viram NPCAbilities, mas filtramos ataques que já foram processados
      if (ability.type !== 'action' || !ability.description?.toLowerCase().includes('weapon attack')) {
        const newAbility = {
          id: `processed_ability_${index}`,
          name: ability.name || `Habilidade ${index + 1}`,
          description: ability.description || '',
          type: ability.type === 'special' ? 'passive' : ability.type,
          uses_per_day: null,
          recharge_on: null
        };
        
        console.log(`✅ Habilidade processada ${index} criada:`, newAbility);
        abilities.push(newAbility);
      } else {
        console.log(`⚠️ Ability ${index} ignorada (já processada como ataque)`);
      }
    });

    console.log('🔍 convertProcessedAbilitiesToNPCAbilities - Saída:', abilities);
    return abilities;
  };

  // ===========================
  // HANDLER DE IMPORTAÇÃO D&D COM LOGS DETALHADOS
  // ===========================

  const handleImportFromDnD = (importedData: any) => {
    try {
      console.group('🔍 DEBUG: Importação de NPC D&D');
      console.log('📥 Dados brutos recebidos da API:', importedData);
      
      // 🔥 CORREÇÃO: Acessar dados do objeto correto
      const originalMonster = importedData.__originalMonster__ || {};
      const processedAbilities = importedData.abilities || [];
      
      // LOG 1: Verificar estrutura dos dados originais
      console.log('🔎 Estrutura dos dados importantes:');
      console.log('- Nome:', importedData.name);
      console.log('- Original Monster:', originalMonster);
      console.log('- Abilities processadas:', processedAbilities);
      console.log('- Ações brutas (originalMonster):', originalMonster.actions);
      console.log('- Habilidades especiais brutas (originalMonster):', originalMonster.special_abilities);
      console.log('- Ações lendárias brutas (originalMonster):', originalMonster.legendary_actions);
      console.log('- HP bruto (originalMonster):', originalMonster.hit_points);
      console.log('- AC bruto (originalMonster):', originalMonster.armor_class);
      
      // LOG 2: Mapear atributos com logs detalhados - USANDO ORIGINAL MONSTER
      console.log('\n📊 PROCESSANDO ATRIBUTOS:');
      const processedAttributes = {
        strength: originalMonster.strength || 10,
        dexterity: originalMonster.dexterity || 10,
        constitution: originalMonster.constitution || 10,
        intelligence: originalMonster.intelligence || 10,
        wisdom: originalMonster.wisdom || 10,
        charisma: originalMonster.charisma || 10
      };
      console.log('- Atributos processados:', processedAttributes);
      
      // LOG 3: Processar estatísticas com logs - USANDO ORIGINAL MONSTER
      console.log('\n📈 PROCESSANDO ESTATÍSTICAS:');
      const extractedAC = extractArmorClass(originalMonster.armor_class) || 10;
      const extractedHP = originalMonster.hit_points || 1;
      const extractedSpeed = `${extractSpeed(originalMonster.speed)} ft`;
      
      console.log('- AC extraído:', extractedAC, 'de:', originalMonster.armor_class);
      console.log('- HP extraído:', extractedHP, 'de:', originalMonster.hit_points);
      console.log('- Velocidade extraída:', extractedSpeed, 'de:', originalMonster.speed);
      
      // LOG 4: Converter ataques - USANDO ORIGINAL MONSTER E PROCESSED ABILITIES
      console.log('\n⚔️ PROCESSANDO ATAQUES:');
      console.log('- Ações brutas (originalMonster) para conversão:', originalMonster.actions || []);
      console.log('- Abilities processadas para análise:', processedAbilities);
      
      // 🔥 NOVA ESTRATÉGIA: Usar ambas as fontes
      let convertedAttacks = convertDnDActionsToAttacks(originalMonster.actions || []);
      
      // Adicionar ataques das abilities processadas
      const attacksFromAbilities = convertProcessedAbilitiesToAttacks(processedAbilities);
      convertedAttacks = [...convertedAttacks, ...attacksFromAbilities];
      
      console.log('- Ataques convertidos (original):', convertedAttacks.slice(0, convertedAttacks.length - attacksFromAbilities.length));
      console.log('- Ataques das abilities:', attacksFromAbilities);
      console.log('- Ataques finais combinados:', convertedAttacks);
      console.log('- Quantidade total de ataques:', convertedAttacks.length);
      
      // LOG 5: Converter magias - USANDO ORIGINAL MONSTER E PROCESSED ABILITIES
      console.log('\n🔮 PROCESSANDO MAGIAS:');
      console.log('- Habilidades especiais brutas (originalMonster):', originalMonster.special_abilities || []);
      console.log('- Abilities processadas para análise:', processedAbilities);
      
      let convertedSpells = convertDnDAbilitiesToSpells(originalMonster.special_abilities || []);
      
      // Adicionar magias das abilities processadas
      const spellsFromAbilities = convertProcessedAbilitiesToSpells(processedAbilities);
      convertedSpells = [...convertedSpells, ...spellsFromAbilities];
      
      console.log('- Magias convertidas (original):', convertedSpells.slice(0, convertedSpells.length - spellsFromAbilities.length));
      console.log('- Magias das abilities:', spellsFromAbilities);
      console.log('- Magias finais combinadas:', convertedSpells);
      console.log('- Quantidade total de magias:', convertedSpells.length);
      
      // LOG 6: Converter habilidades - USANDO ORIGINAL MONSTER E PROCESSED ABILITIES
      console.log('\n✨ PROCESSANDO HABILIDADES:');
      let convertedAbilities = convertDnDAbilitiesToNPCAbilities(
        originalMonster.special_abilities || [], 
        originalMonster.legendary_actions || []
      );
      
      // Adicionar habilidades das abilities processadas
      const abilitiesFromProcessed = convertProcessedAbilitiesToNPCAbilities(processedAbilities);
      convertedAbilities = [...convertedAbilities, ...abilitiesFromProcessed];
      
      console.log('- Habilidades convertidas (original):', convertedAbilities.slice(0, convertedAbilities.length - abilitiesFromProcessed.length));
      console.log('- Habilidades das processed abilities:', abilitiesFromProcessed);
      console.log('- Habilidades finais combinadas:', convertedAbilities);
      console.log('- Quantidade total de habilidades:', convertedAbilities.length);
      
      // LOG 7: Montar dados finais do NPC Enhanced
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
        
        attributes: processedAttributes,
        
        stats: {
          armor_class: extractedAC,
          hit_points: extractedHP,
          max_hit_points: extractedHP,
          temp_hit_points: 0,
          speed: extractedSpeed,
          proficiency_bonus: originalMonster.proficiency_bonus || 2,
          passive_perception: originalMonster.senses?.passive_perception || 10
        },
        
        saving_throws: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        },
        
        challenge_rating: String(originalMonster.challenge_rating || 0),
        
        attacks: convertedAttacks,
        spells: convertedSpells,
        abilities: convertedAbilities,
        
        personality_traits: importedData.personality_traits || [],
        goals: importedData.goals || '',
        secrets: importedData.secrets || '',
        gm_notes: importedData.gm_notes || '',
        is_alive: true,
        is_active: true
      };
      
      // LOG 8: Dados finais antes de setar no estado
      console.log('\n🎯 DADOS FINAIS DO NPC ENHANCED:');
      console.log('- NPC Enhanced completo:', enhancedNPCData);
      console.log('- Ataques finais:', enhancedNPCData.attacks);
      console.log('- Magias finais:', enhancedNPCData.spells);
      console.log('- Habilidades finais:', enhancedNPCData.abilities);
      console.log('- Atributos finais:', enhancedNPCData.attributes);
      
      // LOG 9: Estado anterior do formulário
      console.log('\n📋 ESTADO ANTERIOR DO FORMULÁRIO:');
      console.log('- FormData anterior:', formData);
      
      // Atualizar estado
      setFormData(enhancedNPCData);
      setHasUnsavedChanges(true);
      setImportSuccess(true);
      setHasImportedData(true); // 🔥 NOVO: Marcar que há dados importados
      
      // 🔥 NOVO: Forçar correção de tipos de dano após importação
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          attacks: prev.attacks.map(attack => ({
            ...attack,
            damage_type: Object.values(DAMAGE_TYPE_MAPPING).includes(attack.damage_type) 
              ? attack.damage_type 
              : translateDamageType(attack.damage_type)
          }))
        }));
        console.log('🔄 Tipos de dano corrigidos após importação');
      }, 50);
      
      // LOG 10: Confirmar atualização de estado
      console.log('\n✅ ESTADO ATUALIZADO');
      console.log('- hasImportedData definido como true');
      
      // LOG após delay para verificar se o estado foi atualizado
      setTimeout(() => {
        console.log('🔄 VERIFICAÇÃO APÓS ATUALIZAÇÃO:');
        console.log('- FormData atual (após 100ms):', formData);
        console.log('- hasImportedData:', hasImportedData);
      }, 100);
      
      // Resetar notificação após alguns segundos
      setTimeout(() => {
        setImportSuccess(false);
      }, 5000);
      
      console.log('✅ NPC Enhanced criado a partir da importação D&D');
      console.groupEnd();
      
    } catch (error) {
      console.groupEnd();
      console.error('❌ Erro ao processar dados importados:', error);
      console.error('❌ Stack trace:', error.stack);
      setValidationErrors(['Erro ao processar dados da importação D&D. Tente novamente.']);
    }
  };

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
      damage_type: 'cortante', // 🔥 CORRIGIDO: Usar português
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
    // 🔥 NOVO: Se estiver atualizando damage_type, garantir que seja em português
    let processedValue = value;
    if (field === 'damage_type' && typeof value === 'string') {
      processedValue = Object.values(DAMAGE_TYPE_MAPPING).includes(value) 
        ? value 
        : translateDamageType(value);
      console.log(`🔄 Atualizando tipo de dano: "${value}" → "${processedValue}"`);
    }
    
    setFormData(prev => ({
      ...prev,
      attacks: prev.attacks.map((attack, i) => 
        i === index ? { ...attack, [field]: processedValue } : attack
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
  // HANDLERS DE ROLAGEM
  // ===========================

  const handleAttackRoll = async (attackId: string) => {
    // Implementation for attack rolling
    console.log('🎲 Rolando ataque:', attackId);
  };

  const handleSpellCast = async (spellId: string) => {
    // Implementation for spell casting
    console.log('🔮 Lançando magia:', spellId);
  };

  // ===========================
  // HANDLERS DE SALVAMENTO
  // ===========================

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validar dados básicos
      const errors: string[] = [];
      
      if (!formData.name.trim()) {
        errors.push('Nome é obrigatório');
      }
      
      if (formData.name.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Sanitizar dados antes do envio
      const sanitizedData = {
        ...formData,
        // Garantir que speed seja uma string
        stats: {
          ...formData.stats,
          speed: typeof formData.stats.speed === 'string' 
            ? formData.stats.speed 
            : `${formData.stats.speed} ft`
        },
        // Garantir que challenge_rating seja string
        challenge_rating: typeof formData.challenge_rating === 'string' 
          ? formData.challenge_rating 
          : String(formData.challenge_rating),
        // 🔥 NOVO: Garantir que tipos de dano estejam em português
        attacks: formData.attacks.map(attack => ({
          ...attack,
          damage_type: Object.values(DAMAGE_TYPE_MAPPING).includes(attack.damage_type) 
            ? attack.damage_type 
            : translateDamageType(attack.damage_type)
        }))
      };

      console.log('📤 Dados sendo enviados para API:', sanitizedData);
      console.log('🔍 Tipos de dano dos ataques:', sanitizedData.attacks.map(a => a.damage_type));

      await onSave(sanitizedData);
      setHasUnsavedChanges(false);
      setHasImportedData(false); // 🔥 NOVO: Reset após salvar
      setImportSuccess(false);
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
        // Reset estados de importação
        setHasImportedData(false);
        setImportSuccess(false);
        onClose();
      }
    } else {
      // Reset estados de importação
      setHasImportedData(false);
      setImportSuccess(false);
      onClose();
    }
  };

  // ===========================
  // FUNÇÕES DE DEBUG MANUAL
  // ===========================

  // Torne as funções disponíveis globalmente para debug manual
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugNPCModal = () => {
        console.group('🐛 DEBUG MANUAL - Estado Atual do Modal');
        console.log('- FormData:', formData);
        console.log('- isOpen:', isOpen);
        console.log('- mode:', mode);
        console.log('- hasUnsavedChanges:', hasUnsavedChanges);
        console.log('- validationErrors:', validationErrors);
        console.log('- importSuccess:', importSuccess);
        console.log('- hasImportedData:', hasImportedData); // 🔥 NOVO
        console.groupEnd();
      };

      window.printNPCDebugReport = () => {
        console.group('📋 RELATÓRIO COMPLETO DE DEBUG');
        
        console.group('📊 Estado do Formulário');
        console.log('FormData completo:', formData);
        console.groupEnd();
        
        console.group('⚔️ Ataques');
        console.log('Quantidade:', formData.attacks?.length || 0);
        console.log('Lista:', formData.attacks);
        console.groupEnd();
        
        console.group('🔮 Magias');
        console.log('Quantidade:', formData.spells?.length || 0);
        console.log('Lista:', formData.spells);
        console.groupEnd();
        
        console.group('✨ Habilidades');
        console.log('Quantidade:', formData.abilities?.length || 0);
        console.log('Lista:', formData.abilities);
        console.groupEnd();
        
        console.group('📊 Atributos');
        console.log('Atributos:', formData.attributes);
        console.groupEnd();
        
        console.group('📈 Estatísticas');
        console.log('Stats:', formData.stats);
        console.groupEnd();
        
        console.groupEnd();
      };
    }
  }, [formData, isOpen, mode, hasUnsavedChanges, validationErrors, importSuccess, hasImportedData]);

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
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Erros de Validação */}
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
                          <option value={NPCType.QUEST_GIVER}>Missões</option>
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
                          placeholder="Raça do NPC"
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
                          placeholder="Classe do NPC"
                          disabled={mode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tendência
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
                          placeholder="Onde encontrar o NPC"
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
                        placeholder="Descrição física e personalidade do NPC"
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Atributos */}
                {currentTab === 'stats' && (
                  <div className="space-y-6">
                    {(() => { debugAttributesRender(); return null; })()}
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Atributos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(formData.attributes).map(([attr, value]) => (
                          <div key={attr} className="bg-gray-700 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                              {attr === 'strength' ? 'Força' : 
                               attr === 'dexterity' ? 'Destreza' :
                               attr === 'constitution' ? 'Constituição' :
                               attr === 'intelligence' ? 'Inteligência' :
                               attr === 'wisdom' ? 'Sabedoria' : 'Carisma'}
                            </label>
                            <input
                              type="number"
                              min={3}
                              max={30}
                              value={value}
                              onChange={(e) => handleAttributeChange(attr as keyof NPCAttributes, parseInt(e.target.value) || 10)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                              disabled={mode === 'view'}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              Modificador: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Estatísticas de Combate</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Classe de Armadura
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formData.stats.armor_class}
                            onChange={(e) => handleStatChange('armor_class', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Pontos de Vida
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formData.stats.hit_points}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) || 1;
                              handleStatChange('hit_points', newValue);
                              handleStatChange('max_hit_points', newValue);
                            }}
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
                            placeholder="30 ft"
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
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="1/4, 1/2, 1, 2..."
                            disabled={mode === 'view'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Ataques */}
                {currentTab === 'attacks' && (
                  <div className="space-y-6">
                    {(() => { debugAttacksRender(); return null; })()}
                    
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
                              Dano (Dados)
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                min={1}
                                value={attack.damage.dice_count}
                                onChange={(e) => updateAttack(index, 'damage', {
                                  ...attack.damage,
                                  dice_count: parseInt(e.target.value) || 1
                                })}
                                className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center"
                                disabled={mode === 'view'}
                              />
                              <span className="text-white self-center">d</span>
                              <input
                                type="number"
                                min={2}
                                value={attack.damage.dice_sides}
                                onChange={(e) => updateAttack(index, 'damage', {
                                  ...attack.damage,
                                  dice_sides: parseInt(e.target.value) || 6
                                })}
                                className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center"
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
                                className="w-16 px-2 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center"
                                disabled={mode === 'view'}
                              />
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
                              <option value="cortante">Cortante</option>
                              <option value="perfurante">Perfurante</option>
                              <option value="contundente">Contundente</option>
                              <option value="fogo">Fogo</option>
                              <option value="frio">Frio</option>
                              <option value="elétrico">Elétrico</option>
                              <option value="sônico">Sônico</option>
                              <option value="ácido">Ácido</option>
                              <option value="venenoso">Venenoso</option>
                              <option value="psíquico">Psíquico</option>
                              <option value="necrótico">Necrótico</option>
                              <option value="radiante">Radiante</option>
                              <option value="força">Força</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descrição
                          </label>
                          <textarea
                            value={attack.description}
                            onChange={(e) => updateAttack(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Descrição do ataque..."
                            disabled={mode === 'view'}
                          />
                        </div>

                        {/* Botões de rolagem integrados */}
                        {mode !== 'create' && attack.id && (
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleAttackRoll(attack.id!)}
                              disabled={isRolling}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <Target className="w-4 h-4" />
                              <span>Rolar Ataque</span>
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
                    {(() => { debugSpellsRender(); return null; })()}
                    
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
                                  {level === 0 ? 'Truque' : `Nível ${level}`}
                                </option>
                              ))}
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

                        {/* Botões de rolagem integrados */}
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
                    {(() => { debugAbilitiesRender(); return null; })()}
                    
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
                              <option value="lair">Covil</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descrição
                          </label>
                          <textarea
                            value={ability.description}
                            onChange={(e) => updateAbility(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Descrição da habilidade..."
                            disabled={mode === 'view'}
                          />
                        </div>
                      </div>
                    ))}

                    {formData.abilities.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma habilidade configurada</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Roleplay */}
                {currentTab === 'roleplay' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Objetivos
                      </label>
                      <textarea
                        value={formData.goals}
                        onChange={(e) => handleInputChange('goals', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Quais são os objetivos e motivações do NPC?"
                        disabled={mode === 'view'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Segredos
                      </label>
                      <textarea
                        value={formData.secrets}
                        onChange={(e) => handleInputChange('secrets', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Informações secretas sobre o NPC (visível apenas para o GM)"
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
                        placeholder="Anotações especiais para o Game Master"
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {mode !== 'view' && (
                <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{mode === 'create' ? 'Criar NPC' : 'Salvar Alterações'}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Importação D&D */}
      {showImportModal && (
        <DnDImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportFromDnD}
          importType="npc"
        />
      )}
    </>
  );
};