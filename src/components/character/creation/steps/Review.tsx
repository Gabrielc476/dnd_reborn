//components/character/creation/steps/Review.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DndRace, DndSubrace, DndClass, DndSubclass, DndBackground, AbilityScores } from '@/types/characterCreation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Info, Eye, EyeOff, User, Globe, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Shield, Zap, Target, Wand2, Package, Heart, Download, Save, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ===========================
// INTERFACES
// ===========================

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

// ===========================
// STORAGE KEYS
// ===========================

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

// ===========================
// UTILITY FUNCTIONS
// ===========================

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
    'barbarian': 12,
    'fighter': 10,
    'paladin': 10,
    'ranger': 10,
    'bard': 8,
    'cleric': 8,
    'druid': 8,
    'monk': 8,
    'rogue': 8,
    'warlock': 8,
    'sorcerer': 6,
    'wizard': 6
  };
  
  const hitDie = hitDieByClass[selectedClass.index] || 8;
  return hitDie + conModifier;
};

const calculateBaseAC = (dexModifier: number): number => {
  return 10 + dexModifier;
};

// ===========================
// JWT HELPER FUNCTIONS
// ===========================

const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }
    
    const payload = parts[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao decodificar JWT:', error);
    return null;
  }
};

const getUserIdFromJWT = (token: string): string | null => {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    const userId = payload.user_id || payload.userId || payload.id || payload.sub;
    return userId;
  } catch (error) {
    console.error('💥 [DEBUG] Erro ao extrair user_id do JWT:', error);
    return null;
  }
};

// ===========================
// VALIDATION FUNCTIONS
// ===========================

const validateCharacterData = (data: ConsolidatedData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const token = getAuthToken();
  if (!token) {
    errors.push('Token de autorização não encontrado - faça login novamente');
  }

  const userId = (() => {
    try {
      if (!token) return null;
      
      const userIdFromJWT = getUserIdFromJWT(token);
      if (userIdFromJWT) return userIdFromJWT;
      
      const authData = localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user_id || parsed.userId || parsed.id;
      }
      return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    } catch (error) {
      console.error('❌ [DEBUG] Erro na validação ao buscar user_id:', error);
      return null;
    }
  })();

  if (!userId) {
    errors.push('Usuário não identificado - faça login novamente');
  }

  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!data.selectedRace) {
    errors.push('Raça é obrigatória');
  }

  if (!data.selectedClass) {
    errors.push('Classe é obrigatória');
  }

  if (!data.selectedBackground) {
    errors.push('Background é obrigatório');
  }

  if (!data.finalAbilityScores) {
    errors.push('Atributos são obrigatórios');
  } else {
    Object.entries(data.finalAbilityScores).forEach(([ability, score]) => {
      if (score < 8 || score > 20) {
        warnings.push(`${ability}: ${score} (recomendado: 8-15 para level 1)`);
      }
    });
  }

  if (data.selectedSkills.length === 0) {
    warnings.push('Nenhuma perícia selecionada');
  }

  if (data.personalityTraits.length === 0) {
    warnings.push('Nenhum traço de personalidade definido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ===========================
// DATA CONSOLIDATION
// ===========================

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

// ===========================
// BACKEND PAYLOAD GENERATION
// ===========================

const generateBackendPayload = (data: ConsolidatedData, userId: string | null) => {
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

  const campaignId = getCampaignId();

  const getAbilityBonuses = (): Record<string, number> => {
    const bonuses: Record<string, number> = {};
    
    if (data.selectedRace?.ability_bonuses) {
      data.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index;
        bonuses[abilityKey] = (bonuses[abilityKey] || 0) + bonus.bonus;
      });
    }
    
    if (data.selectedSubrace?.ability_bonuses) {
      data.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index;
        bonuses[abilityKey] = (bonuses[abilityKey] || 0) + bonus.bonus;
      });
    }
    
    return bonuses;
  };

  const getRacialTraits = (): string[] => {
    const traits: string[] = [];
    
    if (data.selectedRace?.traits) {
      traits.push(...data.selectedRace.traits.map(trait => trait.name));
    }
    
    if (data.selectedSubrace?.racial_traits) {
      traits.push(...data.selectedSubrace.racial_traits.map(trait => trait.name));
    }
    
    return traits;
  };

  const getLanguages = (): string[] => {
    const languages: string[] = [];
    
    if (data.selectedRace?.languages) {
      languages.push(...data.selectedRace.languages.map(lang => lang.name));
    }
    
    if (data.selectedSubrace?.languages) {
      languages.push(...data.selectedSubrace.languages.map(lang => lang.name));
    }
    
    return languages;
  };

  const getProficiencies = (): string[] => {
    const proficiencies: string[] = [];
    
    if (data.selectedRace?.starting_proficiencies) {
      proficiencies.push(...data.selectedRace.starting_proficiencies.map(prof => prof.name));
    }
    
    if (data.selectedSubrace?.starting_proficiencies) {
      proficiencies.push(...data.selectedSubrace.starting_proficiencies.map(prof => prof.name));
    }
    
    return proficiencies;
  };

  return {
    user_id: userId,
    campaign_id: campaignId,
    basic_info: {
      name: data.name,
      race_info: {
        race_name: data.selectedRace?.name || '',
        race_index: data.selectedRace?.index || '',
        subrace_name: data.selectedSubrace?.name || null,
        subrace_index: data.selectedSubrace?.index || null,
        speed: data.selectedRace?.speed || 30,
        size: data.selectedRace?.size || 'Medium',
        ability_bonuses: getAbilityBonuses(),
        racial_traits: getRacialTraits(),
        languages: getLanguages(),
        proficiencies: getProficiencies(),
      },
      character_class: data.selectedClass?.index || '',
      level: 1,
      background: data.selectedBackground?.index || '',
      alignment: null,
    },
    attributes: data.finalAbilityScores || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: {
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
    },
    stats: {
      hit_points: calculateBaseHP(data.selectedClass, conModifier),
      armor_class: calculateBaseAC(dexModifier),
      experience_points: 0,
    },
    combat: {
      attacks: [],
    },
    magic: {
      spellcaster: data.selectedSpells.length > 0,
      spellcasting_ability: getSpellcastingAbility(data.selectedClass),
      known_spells: data.selectedSpells.map(spellIndex => ({
        name: spellIndex,
        level: 0,
        school: '',
        description: null,
        is_attack_spell: false,
        attack_bonus: null,
        damage: null,
        damage_type: null,
        save_dc: null,
        save_ability: null,
        range: 'Toque',
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
    },
    personality_traits: data.personalityTraits,
    ideals: data.ideals,
    bonds: data.bonds,
    flaws: data.flaws,
    backstory: data.backstory,
    notes: data.notes,
  };
};

// ===========================
// HELPER FUNCTIONS
// ===========================

const getSpellcastingAbility = (selectedClass: DndClass | null): string | null => {
  if (!selectedClass) return null;
  
  const spellcastingAbilities: Record<string, string> = {
    'wizard': 'intelligence',
    'sorcerer': 'charisma',
    'warlock': 'charisma',
    'bard': 'charisma',
    'cleric': 'wisdom',
    'druid': 'wisdom',
    'paladin': 'charisma',
    'ranger': 'wisdom',
  };
  
  return spellcastingAbilities[selectedClass.index] || null;
};

const getLevel1SpellSlots = (selectedClass: DndClass | null): number => {
  if (!selectedClass) return 0;
  
  const level1SpellSlots: Record<string, number> = {
    'wizard': 2,
    'sorcerer': 2,
    'warlock': 1,
    'bard': 2,
    'cleric': 2,
    'druid': 2,
    'paladin': 0,
    'ranger': 0,
  };
  
  return level1SpellSlots[selectedClass.index] || 0;
};

// ===========================
// API FUNCTIONS
// ===========================

const getAuthToken = (): string | null => {
  try {
    const authDataLocal = localStorage.getItem('auth_data');
    const authDataSession = sessionStorage.getItem('auth_data');
    
    if (authDataLocal || authDataSession) {
      const authData = authDataLocal || authDataSession;
      try {
        const parsed = JSON.parse(authData!);
        const token = parsed.token || parsed.access_token || parsed.jwt;
        if (token) return token;
      } catch (parseError) {
        console.error('Erro ao parsear auth_data para token:', parseError);
      }
    }
    
    const tokenLocal = localStorage.getItem('token');
    const tokenSession = sessionStorage.getItem('token');
    const authTokenLocal = localStorage.getItem('auth_token');
    const authTokenSession = sessionStorage.getItem('auth_token');
    
    return tokenLocal || tokenSession || authTokenLocal || authTokenSession;
  } catch (error) {
    console.error('Erro ao buscar token:', error);
    return null;
  }
};

const createCharacterInBackend = async (payload: any): Promise<BackendCreateCharacterResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autorização não encontrado. Faça login novamente.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/characters`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.character_id) {
        return {
          success: true,
          character_id: result.character_id,
          message: result.message || 'Personagem criado com sucesso'
        };
      }
      
      console.warn('⚠️ Resposta sem character_id:', result);
      return {
        success: true,
        message: 'Personagem criado (resposta incompleta)',
        character_id: 'N/A'
      };
    }

    let errorMessage = `HTTP ${response.status}`;
    let errorDetails = '';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorDetails = errorData.details || '';
      
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta de erro:', parseError);
    }
    
    throw new Error(`${errorMessage} ${errorDetails ? `| ${errorDetails}` : ''}`);

  } catch (error) {
    console.error('💥 Erro na requisição:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Erro desconhecido ao criar personagem',
    };
  }
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const clearAllCharacterCreationData = () => {
  if (typeof window === 'undefined') return;
  
  const keysToRemove = [
    'character_creation_race',
    'character_creation_subrace',
    'character_creation_races_cache',
    'character_creation_class',
    'character_creation_subclass',
    'character_creation_background',
    'character_creation_classes_cache',
    'character_creation_subclasses_cache',
    'character_creation_backgrounds_cache',
    'character_creation_ability_method',
    'character_creation_ability_scores',
    'character_creation_final_ability_scores',
    'character_creation_points_remaining',
    'character_creation_standard_assignments',
    'character_creation_rolled_arrays',
    'character_creation_selected_rolled',
    'standard_array_values',
    'character_creation_selected_skills',
    'character_creation_available_skill_choices',
    'character_creation_class_skill_options',
    'character_creation_background_skills',
    'character_creation_selected_equipment',
    'character_creation_equipment_cache',
    'character_creation_equipment_search',
    'character_creation_selected_spells',
    'character_creation_spells_cache',
    'character_creation_spells_validation',
    'character_creation_name',
    'character_creation_personality_traits',
    'character_creation_ideals',
    'character_creation_bonds',
    'character_creation_flaws',
    'character_creation_backstory',
    'character_creation_notes',
    'character_wizard_current_step',
    'character_wizard_completed_steps',
    'character_wizard_validations'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// ===========================
// REVIEW SECTION COMPONENT
// ===========================

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
                {isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
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

// ===========================
// MAIN COMPONENT
// ===========================

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
      setCreateResult({
        success: false,
        error: 'Por favor, corrija os erros antes de criar o personagem.',
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setCreateResult({
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.',
      });
      return;
    }

    const userId = getUserIdFromJWT(token);
    if (!userId) {
      setCreateResult({
        success: false,
        error: 'Não foi possível identificar o usuário a partir do token. Faça login novamente.',
      });
      return;
    }

    const backendPayload = generateBackendPayload(data, userId);
    
    if (!backendPayload.user_id) {
      console.error('💥 ERRO CRÍTICO: payload.user_id está null/undefined');
      setCreateResult({
        success: false,
        error: 'Erro interno: não foi possível definir o user_id no payload. Tente fazer login novamente.',
      });
      return;
    }

    setIsCreating(true);
    setCreateResult(null);

    try {
      const result = await createCharacterInBackend(backendPayload);
      
      if (result.success) {
        setCreateResult({
          success: true,
          message: result.message || 'Personagem criado com sucesso!',
          characterId: result.character_id,
        });
        
        onCreateCharacter?.();
        
        setTimeout(() => {
          clearAllCharacterCreationData();
          
          const campaignId = backendPayload.campaign_id;
          if (campaignId && campaignId !== 'Não definido (personagem independente)') {
            window.location.href = `/campaign/${campaignId}`;
          } else {
            window.location.href = '/characters';
          }
        }, 2000);
        
      } else {
        setCreateResult({
          success: false,
          error: result.error || 'Erro ao criar personagem',
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setCreateResult({
        success: false,
        error: 'Erro inesperado. Verifique sua conexão e tente novamente.',
      });
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

  // Validações por seção
  const sectionValidations = {
    basic: !!data.name?.trim() && !!data.selectedRace && !!data.selectedClass && !!data.selectedBackground,
    attributes: !!data.finalAbilityScores,
    skills: data.selectedSkills.length > 0,
    personality: data.personalityTraits.length > 0,
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5" />
              Revisão do Personagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300">
                  Revise todas as informações do seu personagem antes de finalizar a criação.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={validation.isValid ? "default" : "destructive"}
                  className={validation.isValid ? "bg-green-600 text-green-100" : "bg-red-600 text-red-100"}
                >
                  {validation.isValid ? "Válido" : "Incompleto"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status geral */}
        {!validation.isValid && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              Alguns passos ainda precisam ser completados antes de finalizar o personagem.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações de Sistema */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-blue-200">Informações do Sistema</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="w-4 h-4 text-blue-400 mr-2" />
              <span className="font-medium text-slate-300">User ID:</span>
              <span className="ml-2 font-mono text-sm bg-slate-700 px-2 py-1 rounded border border-slate-600">
                {(() => {
                  try {
                    const token = getAuthToken();
                    if (token) {
                      return getUserIdFromJWT(token) || 'Não encontrado no token';
                    }
                    return 'Token não encontrado';
                  } catch (error) {
                    return 'Erro ao carregar';
                  }
                })()}
              </span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-blue-400 mr-2" />
              <span className="font-medium text-slate-300">Campaign ID:</span>
              <span className="ml-2 font-mono text-sm bg-slate-700 px-2 py-1 rounded border border-slate-600">
                {(() => {
                  try {
                    if (typeof window !== 'undefined') {
                      const urlParams = new URLSearchParams(window.location.search);
                      const campaignFromUrl = urlParams.get('campaign_id');
                      if (campaignFromUrl) return campaignFromUrl;
                      
                      const pathMatch = window.location.pathname.match(/\/campaign\/([^\/]+)/);
                      if (pathMatch) return pathMatch[1];
                    }
                    
                    return localStorage.getItem('current_campaign_id') || 
                          sessionStorage.getItem('current_campaign_id') || 
                          'Não definido';
                  } catch (error) {
                    return 'Erro ao carregar';
                  }
                })()}
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
              <span className="font-medium text-slate-300">Autenticação:</span>
              <span className={`ml-2 text-sm px-2 py-1 rounded border ${(() => {
                const token = getAuthToken();
                const userId = token ? getUserIdFromJWT(token) : null;
                return (token && userId)
                  ? 'bg-green-800/20 text-green-400 border-green-600/30' 
                  : 'bg-red-800/20 text-red-400 border-red-600/30';
              })()}`}>
                {(() => {
                  const token = getAuthToken();
                  const userId = token ? getUserIdFromJWT(token) : null;
                  
                  if (token && userId) {
                    return '✅ Token e User ID válidos';
                  } else if (token && !userId) {
                    return '⚠️ Token válido, mas User ID não encontrado';
                  } else {
                    return '❌ Token não encontrado';
                  }
                })()}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-400">
            <Info className="w-4 h-4 inline mr-1" />
            Estas informações serão enviadas automaticamente com o personagem.
          </div>
        </Card>

        {/* Resultado da Criação */}
        {createResult && (
          <Card className={`p-6 border-2 ${
            createResult.success 
              ? 'border-green-500/30 bg-green-900/20' 
              : 'border-red-500/30 bg-red-900/20'
          }`}>
            <div className="flex items-center mb-4">
              {createResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 mr-2" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 mr-2" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {createResult.success ? 'Personagem Criado!' : 'Erro na Criação'}
              </h3>
            </div>
            
            <div className="mb-4">
              <p className={createResult.success ? 'text-green-300' : 'text-red-300'}>
                {createResult.message || createResult.error}
              </p>
              
              {createResult.characterId && (
                <p className="text-sm text-green-400 mt-2">
                  ID do Personagem: <code className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{createResult.characterId}</code>
                </p>
              )}

              {createResult.success && (
                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-300">
                    🎉 <strong>Personagem criado com sucesso!</strong>
                  </p>
                  <p className="text-sm text-blue-300 mt-1">
                    Você será redirecionado em alguns segundos...
                  </p>
                </div>
              )}
            </div>

            {createResult.success && (
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    const campaignId = (() => {
                      try {
                        if (typeof window !== 'undefined') {
                          const pathMatch = window.location.pathname.match(/\/campaign\/([^\/]+)/);
                          if (pathMatch) return pathMatch[1];
                        }
                        return null;
                      } catch (error) {
                        return null;
                      }
                    })();
                    
                    if (campaignId) {
                      window.location.href = `/campaign/${campaignId}`;
                    } else {
                      window.location.href = '/characters';
                    }
                  }}
                >
                  {(() => {
                    const campaignId = (() => {
                      try {
                        if (typeof window !== 'undefined') {
                          const pathMatch = window.location.pathname.match(/\/campaign\/([^\/]+)/);
                          if (pathMatch) return pathMatch[1];
                        }
                        return null;
                      } catch (error) {
                        return null;
                      }
                    })();
                    
                    return campaignId 
                      ? 'Ir para Campanha' 
                      : 'Ver Meus Personagens';
                  })()}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    clearAllCharacterCreationData();
                    window.location.reload();
                  }}
                >
                  Criar Outro Personagem
                </Button>
              </div>
            )}
            
            {!createResult.success && (
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setCreateResult(null)}
                >
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    const token = getAuthToken();
                    const userId = token ? getUserIdFromJWT(token) : null;
                    const debugPayload = generateBackendPayload(data, userId);
                    console.log('🔍 Payload enviado:', debugPayload);
                    alert('Dados enviados foram logados no console para debug.');
                  }}
                >
                  Ver Dados Enviados
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Seções de revisão */}
        <div className="space-y-4">
          {/* Informações Básicas */}
          <ReviewSection
            title="Informações Básicas"
            icon={<User className="w-5 h-5 text-blue-400" />}
            isValid={sectionValidations.basic}
            defaultOpen={!sectionValidations.basic}
          >
            {data.name || data.selectedRace || data.selectedClass || data.selectedBackground ? (
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-slate-300">Nome:</span>
                  <span className="ml-2 text-white">{data.name || 'Não definido'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-300">Raça:</span>
                  <span className="ml-2 text-white">
                    {data.selectedRace?.name || 'Não selecionada'}
                    {data.selectedSubrace && ` (${data.selectedSubrace.name})`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-300">Classe:</span>
                  <span className="ml-2 text-white">
                    {data.selectedClass?.name || 'Não selecionada'}
                    {data.selectedSubclass && ` (${data.selectedSubclass.name})`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-300">Background:</span>
                  <span className="ml-2 text-white">{data.selectedBackground?.name || 'Não selecionado'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-300">Nível:</span>
                  <span className="ml-2 text-white">1</span>
                </div>
              </div>
            ) : (
              <p className="text-red-300 text-sm">
                Informações básicas incompletas. Volte aos passos iniciais.
              </p>
            )}
          </ReviewSection>

          {/* Atributos */}
          <ReviewSection
            title="Atributos"
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            isValid={sectionValidations.attributes}
            defaultOpen={!sectionValidations.attributes}
          >
            {data.finalAbilityScores ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(data.finalAbilityScores).map(([ability, score]) => (
                  <div key={ability} className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-lg font-bold text-white">{score}</div>
                    <div className="text-sm text-slate-300 capitalize">{ability.substring(0, 3)}</div>
                    <div className="text-xs text-slate-400">
                      {formatModifier(calculateModifier(score))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-300 text-sm">
                Atributos não definidos. Complete a distribuição de pontos de atributo.
              </p>
            )}
          </ReviewSection>

          {/* Perícias */}
          <ReviewSection
            title="Perícias"
            icon={<Target className="w-5 h-5 text-green-400" />}
            isValid={sectionValidations.skills}
            defaultOpen={!sectionValidations.skills}
          >
            {data.selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.selectedSkills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="bg-green-800/30 text-green-300 border-green-600 capitalize"
                  >
                    {skill.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-red-300 text-sm">
                Nenhuma perícia selecionada. Volte ao passo de seleção de perícias.
              </p>
            )}
          </ReviewSection>

          {/* Magias */}
          <ReviewSection 
            title="Magias" 
            icon={<Wand2 className="w-5 h-5 text-purple-400" />} 
            isValid={true}
          >
            {data.selectedSpells.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.selectedSpells.map((spell) => (
                  <Badge 
                    key={spell} 
                    variant="outline" 
                    className="border-purple-600 text-purple-300 bg-purple-900/20"
                  >
                    {spell}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Esta classe não requer magias ou nenhuma magia foi selecionada.
              </p>
            )}
          </ReviewSection>

          {/* Personalidade */}
          <ReviewSection
            title="Personalidade"
            icon={<Heart className="w-5 h-5 text-pink-400" />}
            isValid={sectionValidations.personality}
            defaultOpen={!sectionValidations.personality}
          >
            {(data.personalityTraits.length > 0 || data.ideals.length > 0 || data.bonds.length > 0 || data.flaws.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.personalityTraits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Traços de Personalidade:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {data.personalityTraits.map((trait, index) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.ideals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Ideais:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {data.ideals.map((ideal, index) => (
                        <li key={index}>{ideal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.bonds.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Vínculos:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {data.bonds.map((bond, index) => (
                        <li key={index}>{bond}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.flaws.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Defeitos:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {data.flaws.map((flaw, index) => (
                        <li key={index}>{flaw}</li>
                      ))}
                    </ul>
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
              <p className="text-red-300 text-sm">
                Personalidade não definida. Complete as informações de personalidade.
              </p>
            )}
          </ReviewSection>

          {/* Dados para Backend */}
          <ReviewSection
            title="Dados para o Backend"
            icon={<Globe className="w-5 h-5 text-blue-400" />}
            isValid={true}
          >
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowBackendPayload(!showBackendPayload)}
                className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {showBackendPayload ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBackendPayload ? 'Ocultar' : 'Mostrar'} Payload
              </Button>
            </div>
            
            {showBackendPayload && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {(() => {
                    const token = getAuthToken();
                    const userId = token ? getUserIdFromJWT(token) : null;
                    const payload = generateBackendPayload(data, userId);
                    return JSON.stringify(payload, null, 2);
                  })()}
                </pre>
              </div>
            )}
            
            <div className="mt-4 text-sm text-slate-400">
              <Info className="w-4 h-4 inline mr-1" />
              Este é o formato de dados que será enviado para o backend ao criar o personagem.
            </div>
          </ReviewSection>
        </div>

        {/* Ações finais */}
        {validation.isValid && !createResult?.success && (
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
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
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleCreateCharacter}
                  disabled={isCreating}
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando Personagem...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Finalizar Personagem
                    </>
                  )}
                </Button>
              </div>
              
              {isCreating && (
                <p className="text-sm text-slate-400 mt-4 text-center">
                  Enviando dados para o servidor...
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Review;