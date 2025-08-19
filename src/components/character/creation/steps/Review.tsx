// components/character/creation/steps/Review.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndRace, 
  DndSubrace, 
  DndClass, 
  DndSubclass, 
  DndBackground, 
  AbilityScores 
} from '@/types/characterCreation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff, 
  User, 
  Globe, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Target, 
  Wand2, 
  Heart, 
  Download, 
  Save 
} from 'lucide-react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Character,
  Attributes,
  RaceInfo,
  BasicInfo,
  Skills,
  Stats,
  Combat,
  Magic,
  CharacterDetails,
  DnDClass,
  Spell,
  EquipmentItem
} from '@/types/character';

// INTERFACES
interface ReviewProps {
  onValidationChange?: (isValid: boolean) => void;
  onCreateCharacter?: () => Promise<void>;
}

interface BackendCreateCharacterResponse {
  success: boolean;
  character_id?: string;
  message?: string;
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ConsolidatedData {
  name: string;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  abilityMethod: string;
  abilityScores: AbilityScores | null;
  finalAbilityScores: AbilityScores | null;
  selectedSkills: string[];
  selectedEquipment: string[];
  selectedSpells: string[];
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  backstory: string;
  notes: string;
}

// STORAGE KEYS
const STORAGE_KEYS = {
  SELECTED_RACE: 'character_creation_race',
  SELECTED_SUBRACE: 'character_creation_subrace',
  SELECTED_CLASS: 'character_creation_class',
  SELECTED_SUBCLASS: 'character_creation_subclass',
  SELECTED_BACKGROUND: 'character_creation_background',
  ABILITY_METHOD: 'character_creation_ability_method',
  ABILITY_SCORES: 'character_creation_ability_scores',
  FINAL_ABILITY_SCORES: 'character_creation_final_ability_scores',
  SELECTED_SKILLS: 'character_creation_selected_skills',
  SELECTED_EQUIPMENT: 'character_creation_selected_equipment',
  SELECTED_SPELLS: 'character_creation_selected_spells',
  CHARACTER_NAME: 'character_creation_name',
  PERSONALITY_TRAITS: 'character_creation_personality_traits',
  IDEALS: 'character_creation_ideals',
  BONDS: 'character_creation_bonds',
  FLAWS: 'character_creation_flaws',
  BACKSTORY: 'character_creation_backstory',
  NOTES: 'character_creation_notes'
};

// UTILITY FUNCTIONS
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar ${key} do storage:`, error);
    return defaultValue;
  }
};

const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

const calculateBaseHP = (selectedClass: DndClass | null, conModifier: number): number => {
  if (!selectedClass) return 8 + conModifier;
  const hitDieByClass: Record<string, number> = {
    'barbarian': 12, 'fighter': 10, 'paladin': 10, 'ranger': 10,
    'bard': 8, 'cleric': 8, 'druid': 8, 'monk': 8, 'rogue': 8, 'warlock': 8,
    'sorcerer': 6, 'wizard': 6
  };
  const hitDie = hitDieByClass[selectedClass.index] || 8;
  return hitDie + conModifier;
};

const calculateBaseAC = (dexModifier: number): number => {
  return 10 + dexModifier;
};

// JWT HELPER FUNCTIONS
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token JWT inválido');
    const payload = parts[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
};

const getUserIdFromJWT = (token: string): string | null => {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;
    return payload.user_id || payload.userId || payload.id || payload.sub;
  } catch (error) {
    console.error('Erro ao extrair user_id do JWT:', error);
    return null;
  }
};

// VALIDATION FUNCTIONS
const validateCharacterData = (data: ConsolidatedData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const token = getAuthToken();
  if (!token) errors.push('Token de autorização não encontrado - faça login novamente');

  const userId = token ? getUserIdFromJWT(token) : null;
  if (!userId) errors.push('Usuário não identificado - faça login novamente');

  if (!data.name?.trim()) errors.push('Nome é obrigatório');
  if (!data.selectedRace) errors.push('Raça é obrigatória');
  if (!data.selectedClass) errors.push('Classe é obrigatória');
  if (!data.selectedBackground) errors.push('Background é obrigatório');
  if (!data.finalAbilityScores) errors.push('Atributos são obrigatórios');
  else {
    Object.entries(data.finalAbilityScores).forEach(([ability, score]) => {
      if (score < 8 || score > 20) {
        warnings.push(`${ability}: ${score} (recomendado: 8-15 para level 1)`);
      }
    });
  }

  if (data.selectedSkills.length === 0) warnings.push('Nenhuma perícia selecionada');
  if (data.personalityTraits.length === 0) warnings.push('Nenhum traço de personalidade definido');

  return { isValid: errors.length === 0, errors, warnings };
};

// DATA CONSOLIDATION
const getConsolidatedData = (): ConsolidatedData => {
  return {
    name: loadFromStorage(STORAGE_KEYS.CHARACTER_NAME, ''),
    selectedRace: loadFromStorage<DndRace | null>(STORAGE_KEYS.SELECTED_RACE, null),
    selectedSubrace: loadFromStorage<DndSubrace | null>(STORAGE_KEYS.SELECTED_SUBRACE, null),
    selectedClass: loadFromStorage<DndClass | null>(STORAGE_KEYS.SELECTED_CLASS, null),
    selectedSubclass: loadFromStorage<DndSubclass | null>(STORAGE_KEYS.SELECTED_SUBCLASS, null),
    selectedBackground: loadFromStorage<DndBackground | null>(STORAGE_KEYS.SELECTED_BACKGROUND, null),
    abilityMethod: loadFromStorage(STORAGE_KEYS.ABILITY_METHOD, ''),
    abilityScores: loadFromStorage<AbilityScores | null>(STORAGE_KEYS.ABILITY_SCORES, null),
    finalAbilityScores: loadFromStorage<AbilityScores | null>(STORAGE_KEYS.FINAL_ABILITY_SCORES, null),
    selectedSkills: loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_SKILLS, []),
    selectedEquipment: loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_EQUIPMENT, []),
    selectedSpells: loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_SPELLS, []),
    personalityTraits: loadFromStorage<string[]>(STORAGE_KEYS.PERSONALITY_TRAITS, []),
    ideals: loadFromStorage<string[]>(STORAGE_KEYS.IDEALS, []),
    bonds: loadFromStorage<string[]>(STORAGE_KEYS.BONDS, []),
    flaws: loadFromStorage<string[]>(STORAGE_KEYS.FLAWS, []),
    backstory: loadFromStorage(STORAGE_KEYS.BACKSTORY, ''),
    notes: loadFromStorage(STORAGE_KEYS.NOTES, '')
  };
};

// BACKEND PAYLOAD GENERATION
const generateBackendPayload = (data: ConsolidatedData, userId: string | null): Character => {
  const conModifier = data.finalAbilityScores ? calculateModifier(data.finalAbilityScores.constitution) : 0;
  const dexModifier = data.finalAbilityScores ? calculateModifier(data.finalAbilityScores.dexterity) : 0;

  const getCampaignId = (): string | null => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignFromUrl = urlParams.get('campaign_id');
        if (campaignFromUrl) return campaignFromUrl;
        const pathMatch = window.location.pathname.match(/\/campaign\/([^\/]+)/);
        if (pathMatch) return pathMatch[1];
      }
      return localStorage.getItem('current_campaign_id') || sessionStorage.getItem('current_campaign_id');
    } catch (error) {
      console.error('Erro ao buscar campaign_id:', error);
      return null;
    }
  };

  const getAbilityBonuses = (): Record<string, number> => {
    const bonuses: Record<string, number> = {};
    if (data.selectedRace?.ability_bonuses) {
      data.selectedRace.ability_bonuses.forEach(bonus => {
        const ability = bonus.ability_score.index;
        bonuses[ability] = (bonuses[ability] || 0) + bonus.bonus;
      });
    }
    if (data.selectedSubrace?.ability_bonuses) {
      data.selectedSubrace.ability_bonuses.forEach(bonus => {
        const ability = bonus.ability_score.index;
        bonuses[ability] = (bonuses[ability] || 0) + bonus.bonus;
      });
    }
    return bonuses;
  };

  const getRacialTraits = (): string[] => {
    const traits: string[] = [];
    if (data.selectedRace?.traits) traits.push(...data.selectedRace.traits.map(trait => trait.name));
    if (data.selectedSubrace?.racial_traits) traits.push(...data.selectedSubrace.racial_traits.map(trait => trait.name));
    return traits;
  };

  const getLanguages = (): string[] => {
    const languages: string[] = [];
    if (data.selectedRace?.languages) languages.push(...data.selectedRace.languages.map(lang => lang.name));
    if (data.selectedSubrace?.languages) languages.push(...data.selectedSubrace.languages.map(lang => lang.name));
    return languages;
  };

  const getProficiencies = (): string[] => {
    const proficiencies: string[] = [];
    if (data.selectedRace?.starting_proficiencies) proficiencies.push(...data.selectedRace.starting_proficiencies.map(prof => prof.name));
    if (data.selectedSubrace?.starting_proficiencies) proficiencies.push(...data.selectedSubrace.starting_proficiencies.map(prof => prof.name));
    return proficiencies;
  };

  const raceInfo: RaceInfo = {
    race_name: data.selectedRace?.name || '',
    race_index: data.selectedRace?.index || '',
    subrace_name: data.selectedSubrace?.name,
    subrace_index: data.selectedSubrace?.index,
    speed: data.selectedRace?.speed || 30,
    size: data.selectedRace?.size || 'Medium',
    ability_bonuses: getAbilityBonuses(),
    racial_traits: getRacialTraits(),
    languages: getLanguages(),
    proficiencies: getProficiencies(),
  };

  const basicInfo: BasicInfo = {
    name: data.name,
    race_info: raceInfo,
    character_class: data.selectedClass || {
      index: '',
      name: '',
      url: '',
      hit_die: 0,
      proficiency_choices: [],
      proficiencies: [],
      saving_throws: [],
      starting_equipment: [],
      starting_equipment_options: [],
      class_levels: '',
      subclasses: [],
    },
    level: 1,
    background: data.selectedBackground?.index || '',
    alignment: undefined,
  };

  const attributes: Attributes = data.finalAbilityScores || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const skills: Skills = {
    athletics: data.selectedSkills.includes('athletics'),
    acrobatics: data.selectedSkills.includes('acrobatics'),
    sleight_of_hand: data.selectedSkills.includes('sleight-of-hand'),
    stealth: data.selectedSkills.includes('stealth'),
    arcana: data.selectedSkills.includes('arcana'),
    history: data.selectedSkills.includes('history'),
    investigation: data.selectedSkills.includes('investigation'),
    nature: data.selectedSkills.includes('nature'),
    religion: data.selectedSkills.includes('religion'),
    animal_handling: data.selectedSkills.includes('animal-handling'),
    insight: data.selectedSkills.includes('insight'),
    medicine: data.selectedSkills.includes('medicine'),
    perception: data.selectedSkills.includes('perception'),
    survival: data.selectedSkills.includes('survival'),
    deception: data.selectedSkills.includes('deception'),
    intimidation: data.selectedSkills.includes('intimidation'),
    performance: data.selectedSkills.includes('performance'),
    persuasion: data.selectedSkills.includes('persuasion'),
  };

  const stats: Stats = {
    hit_points: calculateBaseHP(data.selectedClass, conModifier),
    armor_class: calculateBaseAC(dexModifier),
    experience_points: 0,
  };

  const combat: Combat = {
    attacks: [],
  };

  const magic: Magic = {
    spellcaster: data.selectedSpells.length > 0,
    spellcasting_ability: getSpellcastingAbility(data.selectedClass),
    known_spells: data.selectedSpells.map(spellIndex => ({
      name: spellIndex,
      level: 0,
      school: '',
      description: '',
      is_attack_spell: false,
      attack_bonus: undefined,
      damage: undefined,
      damage_type: undefined,
      save_dc: undefined,
      save_ability: undefined,
      range: '',
    })),
    spell_slots_1: data.selectedSpells.length > 0 ? getLevel1SpellSlots(data.selectedClass) : 0,
    spell_slots_2: 0,
    spell_slots_3: 0,
    spell_slots_4: 0,
    spell_slots_5: 0,
    spell_slots_6: 0,
    spell_slots_7: 0,
    spell_slots_8: 0,
    spell_slots_9: 0,
  };

  const details: CharacterDetails = {
    background: data.selectedBackground?.index || '',
    alignment: undefined,
    personality_traits: data.personalityTraits.join(', '),
    ideals: data.ideals.join(', '),
    bonds: data.bonds.join(', '),
    flaws: data.flaws.join(', '),
    backstory: data.backstory,
    appearance: undefined,
  };

  const equipment: EquipmentItem[] = data.selectedEquipment.map(item => ({
    index: item,
    name: item,
    url: '',
    equipment_category: {
      index: '',
      name: '',
      url: '',
    },
    cost: {
      quantity: 0,
      unit: 'gp',
    },
  }));

  return {
    id: '',
    campaign_id: getCampaignId() || undefined,
    user_id: userId || '',
    basic_info: basicInfo,
    attributes: attributes,
    skills: skills,
    stats: stats,
    combat: combat,
    magic: magic,
    details: details,
    equipment: equipment,
    features: [],
    languages: raceInfo.languages,
    proficiencies: raceInfo.proficiencies,
    player_name: undefined,
    is_active: true,
    created_at: undefined,
    updated_at: undefined,
    avatar_url: undefined,
    calculated_stats: undefined,
    chosen_subclass: data.selectedSubclass ? {
      index: data.selectedSubclass.index,
      name: data.selectedSubclass.name,
      class: {
        index: data.selectedClass?.index || '',
        name: data.selectedClass?.name || '',
        url: data.selectedClass?.url || '',
      },
      desc: data.selectedSubclass.desc,
      subclass_flavor: data.selectedSubclass.subclass_flavor,
      subclass_levels: data.selectedSubclass.subclass_levels,
      url: data.selectedSubclass.url,
    } : undefined,
  };
};

// HELPER FUNCTIONS
const getSpellcastingAbility = (selectedClass: DndClass | null): string | undefined => {
  if (!selectedClass) return undefined;
  const spellcastingAbilities: Record<string, string> = {
    'wizard': 'intelligence', 'sorcerer': 'charisma', 'warlock': 'charisma', 'bard': 'charisma',
    'cleric': 'wisdom', 'druid': 'wisdom', 'paladin': 'charisma', 'ranger': 'wisdom',
  };
  return spellcastingAbilities[selectedClass.index];
};

const getLevel1SpellSlots = (selectedClass: DndClass | null): number => {
  if (!selectedClass) return 0;
  const level1SpellSlots: Record<string, number> = {
    'wizard': 2, 'sorcerer': 2, 'warlock': 1, 'bard': 2, 'cleric': 2, 'druid': 2, 'paladin': 0, 'ranger': 0,
  };
  return level1SpellSlots[selectedClass.index] || 0;
};

// API FUNCTIONS
const getAuthToken = (): string | null => {
  try {
    const authData = localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || parsed.access_token || parsed.jwt;
    }
    return localStorage.getItem('token') || sessionStorage.getItem('token') ||
           localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  } catch (error) {
    console.error('Erro ao buscar token:', error);
    return null;
  }
};

const createCharacterInBackend = async (payload: Character): Promise<BackendCreateCharacterResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Token de autorização não encontrado. Faça login novamente.');
    
    const response = await fetch(`${API_BASE_URL}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        character_id: result.character_id || 'N/A',
        message: result.message || 'Personagem criado com sucesso',
      };
    }

    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) errorMessage = 'Sessão expirada. Faça login novamente.';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Erro na requisição:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar personagem',
    };
  }
};

// UTILITY FUNCTIONS
const clearAllCharacterCreationData = () => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// REVIEW SECTION COMPONENT
const ReviewSection = ({
  title,
  icon,
  isValid,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  isValid: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-700/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {icon}
                {title}
                {isValid ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// MAIN COMPONENT
const Review: React.FC<ReviewProps> = ({ onValidationChange, onCreateCharacter }) => {
  const [data, setData] = useState<ConsolidatedData>(getConsolidatedData());
  const [showBackendPayload, setShowBackendPayload] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    characterId?: string;
  } | null>(null);

  useEffect(() => {
    setData(getConsolidatedData());
    setIsHydrated(true);
  }, []);

  const validation = validateCharacterData(data);

  useEffect(() => {
    onValidationChange?.(validation.isValid);
  }, [validation.isValid, onValidationChange]);

  const handleCreateCharacter = async () => {
    if (!validation.isValid) {
      setCreateResult({ success: false, error: 'Por favor, corrija os erros antes de criar o personagem.' });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setCreateResult({ success: false, error: 'Token de autorização não encontrado. Faça login novamente.' });
      return;
    }

    const userId = getUserIdFromJWT(token);
    if (!userId) {
      setCreateResult({ success: false, error: 'Não foi possível identificar o usuário. Faça login novamente.' });
      return;
    }

    const backendPayload = generateBackendPayload(data, userId);
    setIsCreating(true);
    setCreateResult(null);

    try {
      const result = await createCharacterInBackend(backendPayload);
      if (result.success) {
        setCreateResult({ success: true, message: result.message, characterId: result.character_id });
        onCreateCharacter?.();
        setTimeout(() => {
          clearAllCharacterCreationData();
          window.location.href = backendPayload.campaign_id ? `/campaign/${backendPayload.campaign_id}` : '/characters';
        }, 2000);
      } else {
        setCreateResult({ success: false, error: result.error });
      }
    } catch (error) {
      setCreateResult({ success: false, error: 'Erro inesperado. Verifique sua conexão e tente novamente.' });
    } finally {
      setIsCreating(false);
    }
  };

  const stats = data.finalAbilityScores ? {
    hitPoints: calculateBaseHP(data.selectedClass, calculateModifier(data.finalAbilityScores.constitution)),
    armorClass: calculateBaseAC(calculateModifier(data.finalAbilityScores.dexterity)),
  } : { hitPoints: 8, armorClass: 10 };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do personagem...</p>
        </div>
      </div>
    );
  }

  const sectionValidations = {
    basic: !!data.name?.trim() && !!data.selectedRace && !!data.selectedClass && !!data.selectedBackground,
    attributes: !!data.finalAbilityScores,
    skills: data.selectedSkills.length > 0,
    personality: data.personalityTraits.length > 0,
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5" />
              Revisão do Personagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">Revise todas as informações do seu personagem antes de finalizar a criação.</p>
              <Badge variant={validation.isValid ? "default" : "destructive"} className={validation.isValid ? "bg-green-600" : "bg-red-600"}>
                {validation.isValid ? "Válido" : "Incompleto"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {!validation.isValid && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              Alguns passos ainda precisam ser completados antes de finalizar o personagem.
            </AlertDescription>
          </Alert>
        )}

        {createResult && (
          <Card className={`p-6 border-2 ${createResult.success ? 'border-green-500/30 bg-green-900/20' : 'border-red-500/30 bg-red-900/20'}`}>
            <div className="flex items-center mb-4">
              {createResult.success ? <CheckCircle2 className="w-6 h-6 text-green-400 mr-2" /> : <XCircle className="w-6 h-6 text-red-400 mr-2" />}
              <h3 className="text-lg font-semibold text-white">{createResult.success ? 'Personagem Criado!' : 'Erro na Criação'}</h3>
            </div>
            <p className={createResult.success ? 'text-green-300' : 'text-red-300'}>{createResult.message || createResult.error}</p>
            {createResult.characterId && (
              <p className="text-sm text-green-400 mt-2">ID do Personagem: <code>{createResult.characterId}</code></p>
            )}
          </Card>
        )}

        <div className="space-y-4">
          <ReviewSection title="Informações Básicas" icon={<User className="w-5 h-5 text-blue-400" />} isValid={sectionValidations.basic} defaultOpen={!sectionValidations.basic}>
            {data.name || data.selectedRace || data.selectedClass || data.selectedBackground ? (
              <div className="space-y-4">
                <div><span className="font-medium text-slate-300">Nome:</span> <span className="ml-2 text-white">{data.name || 'Não definido'}</span></div>
                <div><span className="font-medium text-slate-300">Raça:</span> <span className="ml-2 text-white">{data.selectedRace?.name || 'Não selecionada'} {data.selectedSubrace && `(${data.selectedSubrace.name})`}</span></div>
                <div><span className="font-medium text-slate-300">Classe:</span> <span className="ml-2 text-white">{data.selectedClass?.name || 'Não selecionada'} {data.selectedSubclass && `(${data.selectedSubclass.name})`}</span></div>
                <div><span className="font-medium text-slate-300">Background:</span> <span className="ml-2 text-white">{data.selectedBackground?.name || 'Não selecionado'}</span></div>
                <div><span className="font-medium text-slate-300">Nível:</span> <span className="ml-2 text-white">1</span></div>
              </div>
            ) : (
              <p className="text-red-300 text-sm">Informações básicas incompletas. Volte aos passos iniciais.</p>
            )}
          </ReviewSection>

          <ReviewSection title="Atributos" icon={<Zap className="w-5 h-5 text-yellow-400" />} isValid={sectionValidations.attributes} defaultOpen={!sectionValidations.attributes}>
            {data.finalAbilityScores ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(data.finalAbilityScores).map(([ability, score]) => (
                  <div key={ability} className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-lg font-bold text-white">{score}</div>
                    <div className="text-sm text-slate-300 capitalize">{ability.substring(0, 3)}</div>
                    <div className="text-xs text-slate-400">{formatModifier(calculateModifier(score))}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-300 text-sm">Atributos não definidos. Complete a distribuição de pontos de atributo.</p>
            )}
          </ReviewSection>

          <ReviewSection title="Perícias" icon={<Target className="w-5 h-5 text-green-400" />} isValid={sectionValidations.skills} defaultOpen={!sectionValidations.skills}>
            {data.selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-green-800/30 text-green-300 border-green-600 capitalize">{skill.replace('-', ' ')}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-red-300 text-sm">Nenhuma perícia selecionada. Volte ao passo de seleção de perícias.</p>
            )}
          </ReviewSection>

          <ReviewSection title="Magias" icon={<Wand2 className="w-5 h-5 text-purple-400" />} isValid={true}>
            {data.selectedSpells.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.selectedSpells.map(spell => (
                  <Badge key={spell} variant="outline" className="border-purple-600 text-purple-300 bg-purple-900/20">{spell}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Esta classe não requer magias ou nenhuma magia foi selecionada.</p>
            )}
          </ReviewSection>

          <ReviewSection title="Personalidade" icon={<Heart className="w-5 h-5 text-pink-400" />} isValid={sectionValidations.personality} defaultOpen={!sectionValidations.personality}>
            {(data.personalityTraits.length > 0 || data.ideals.length > 0 || data.bonds.length > 0 || data.flaws.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.personalityTraits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Traços de Personalidade:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">{data.personalityTraits.map((trait, index) => <li key={index}>{trait}</li>)}</ul>
                  </div>
                )}
                {data.ideals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Ideais:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">{data.ideals.map((ideal, index) => <li key={index}>{ideal}</li>)}</ul>
                  </div>
                )}
                {data.bonds.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Vínculos:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">{data.bonds.map((bond, index) => <li key={index}>{bond}</li>)}</ul>
                  </div>
                )}
                {data.flaws.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Defeitos:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">{data.flaws.map((flaw, index) => <li key={index}>{flaw}</li>)}</ul>
                  </div>
                )}
                {data.backstory && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-slate-300 mb-2">História:</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{data.backstory}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-300 text-sm">Personalidade não definida. Complete as informações de personalidade.</p>
            )}
          </ReviewSection>

          <ReviewSection title="Dados para o Backend" icon={<Globe className="w-5 h-5 text-blue-400" />} isValid={true}>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => setShowBackendPayload(!showBackendPayload)} className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                {showBackendPayload ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBackendPayload ? 'Ocultar' : 'Mostrar'} Payload
              </Button>
            </div>
            {showBackendPayload && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">{JSON.stringify(generateBackendPayload(data, getUserIdFromJWT(getAuthToken() || '')), null, 2)}</pre>
              </div>
            )}
            <div className="mt-4 text-sm text-slate-400">
              <Info className="w-4 h-4 inline mr-1" /> Este é o formato de dados que será enviado para o backend ao criar o personagem.
            </div>
          </ReviewSection>
        </div>

        {validation.isValid && !createResult?.success && (
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => {
                  const token = getAuthToken();
                  const userId = token ? getUserIdFromJWT(token) : null;
                  const backendPayload = generateBackendPayload(data, userId);
                  const dataStr = JSON.stringify(backendPayload, null, 2);
                  const dataBlob = new Blob([dataStr], { type: "application/json" });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "character_payload.json";
                  link.click();
                  URL.revokeObjectURL(url);
                }} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="w-4 h-4 mr-2" /> Exportar JSON
                </Button>
                <Button size="lg" onClick={handleCreateCharacter} disabled={isCreating} className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando Personagem...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Finalizar Personagem
                    </>
                  )}
                </Button>
              </div>
              {isCreating && <p className="text-sm text-slate-400 mt-4 text-center">Enviando dados para o servidor...</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Review;