// ===========================
// CHARACTER CREATION HOOK - COMPLETO CORRIGIDO
// src/hooks/useCharacterCreation.tsx
// ===========================

"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { 
  CharacterCreationData, 
  CharacterCreationContextType,
  CharacterCreationStep,
  AbilityScores,
  DndRace,
  DndClass,
  DndBackground,
  DndSpell,
  DndSubclass,
  DndSubrace
} from "@/types/characterCreation";
import { useAPIData } from "@/hooks/useAPIData";

// ===========================
// INITIAL DATA & CONSTANTS
// ===========================

const initialCharacterData: CharacterCreationData = {
  // Basic Info
  name: "",
  level: 1,
  experience: 0,
  
  // Character Choices
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  alignment: null,
  
  // Ability Scores
  abilityMethod: "point-buy",
  abilityScores: {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  },
  pointsRemaining: 27,
  
  // Combat Stats
  hitPoints: 0,
  armorClass: 10,
  
  // Skills & Proficiencies
  selectedSkills: [],
  availableSkillChoices: 2,
  proficiencies: [],
  languages: [],
  
  // Equipment - 🔥 CORREÇÃO: Adicionar campo selectedEquipment
  selectedEquipment: [],
  
  // Spellcasting
  isSpellcaster: false,
  spellcastingAbility: null,
  selectedSpells: [],
  knownSpells: 0,
  spellSlots: {},
  
  // Personality
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
  
  // Additional Info
  backstory: "",
  notes: "",
};

const SKILLS = [
  { key: "acrobatics", name: "Acrobacia", ability: "dexterity" as keyof AbilityScores },
  { key: "animal-handling", name: "Adestramento", ability: "wisdom" as keyof AbilityScores },
  { key: "arcana", name: "Arcanismo", ability: "intelligence" as keyof AbilityScores },
  { key: "athletics", name: "Atletismo", ability: "strength" as keyof AbilityScores },
  { key: "deception", name: "Enganação", ability: "charisma" as keyof AbilityScores },
  { key: "history", name: "História", ability: "intelligence" as keyof AbilityScores },
  { key: "insight", name: "Intuição", ability: "wisdom" as keyof AbilityScores },
  { key: "intimidation", name: "Intimidação", ability: "charisma" as keyof AbilityScores },
  { key: "investigation", name: "Investigação", ability: "intelligence" as keyof AbilityScores },
  { key: "medicine", name: "Medicina", ability: "wisdom" as keyof AbilityScores },
  { key: "nature", name: "Natureza", ability: "intelligence" as keyof AbilityScores },
  { key: "perception", name: "Percepção", ability: "wisdom" as keyof AbilityScores },
  { key: "performance", name: "Atuação", ability: "charisma" as keyof AbilityScores },
  { key: "persuasion", name: "Persuasão", ability: "charisma" as keyof AbilityScores },
  { key: "religion", name: "Religião", ability: "intelligence" as keyof AbilityScores },
  { key: "sleight-of-hand", name: "Prestidigitação", ability: "dexterity" as keyof AbilityScores },
  { key: "stealth", name: "Furtividade", ability: "dexterity" as keyof AbilityScores },
  { key: "survival", name: "Sobrevivência", ability: "wisdom" as keyof AbilityScores },
];

const STEPS: CharacterCreationStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "ability-scores",
    title: "Atributos",
    description: "Distribua seus pontos de atributo",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias especializadas",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Armas, armaduras e itens iniciais",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "spells",
    title: "Magias",
    description: "Magias iniciais (se aplicável)",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "personality",
    title: "Personalidade",
    description: "Traços, ideais, vínculos e defeitos",
    isValid: false,
    isCompleted: false,
  },
];

// ===========================
// CONTEXT CREATION
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | undefined>(undefined);

export function useCharacterCreationContext() {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error("useCharacterCreationContext must be used within CharacterCreationProvider");
  }
  return context;
}

// ===========================
// PROVIDER COMPONENT
// ===========================

export function CharacterCreationProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<CharacterCreationStep[]>(STEPS);
  const [characterData, setCharacterData] = useState<CharacterCreationData>(initialCharacterData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search states
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");

  // ===========================
  // API DATA HOOKS
  // ===========================

  const {
    races: racesData,
    classes: classesData,
    backgrounds: backgroundsData,
    spells: spellsData,
    subclasses: subclassesData,
    subraces: subracesData,
    
    isLoading: isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubclasses,
    isLoadingSubraces,
    
    error: racesError,
    error: classesError,
    error: backgroundsError,
  } = useAPIData();

  const isLoading = isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || isLoadingSpells;

  // ===========================
  // FILTERED DATA
  // ===========================

  const filteredRaces = racesData.filter(race =>
    race.name.toLowerCase().includes(raceSearchTerm.toLowerCase())
  );

  const filteredClasses = classesData.filter(dndClass =>
    dndClass.name.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  const filteredSpells = spellsData.filter(spell =>
    spell.name.toLowerCase().includes(spellSearchTerm.toLowerCase())
  );

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // ===========================
  // CHARACTER DATA UPDATES
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCharacterField = useCallback(<K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => {
    setCharacterData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateAbilityScore = useCallback((ability: keyof AbilityScores, value: number) => {
    setCharacterData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: value,
      },
    }));
  }, []);

  const toggleSkill = useCallback((skillKey: string) => {
    setCharacterData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillKey)
        ? prev.selectedSkills.filter(s => s !== skillKey)
        : [...prev.selectedSkills, skillKey],
    }));
  }, []);

  const toggleSpell = useCallback((spellIndex: string) => {
    setCharacterData(prev => ({
      ...prev,
      selectedSpells: prev.selectedSpells.includes(spellIndex)
        ? prev.selectedSpells.filter(s => s !== spellIndex)
        : [...prev.selectedSpells, spellIndex],
    }));
  }, []);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getCombinedAbilityBonuses = useCallback((): Record<keyof AbilityScores, number> => {
    const bonuses: Record<keyof AbilityScores, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Race bonuses
    if (characterData.selectedRace?.ability_bonuses) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityName = bonus.ability_score.index as keyof AbilityScores;
        bonuses[abilityName] += bonus.bonus;
      });
    }

    // Subrace bonuses
    if (characterData.selectedSubrace?.ability_bonuses) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityName = bonus.ability_score.index as keyof AbilityScores;
        bonuses[abilityName] += bonus.bonus;
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) return 0;

    const classHitDie = characterData.selectedClass.hit_die || 8;
    const constitutionModifier = getAbilityModifier(characterData.abilityScores.constitution);
    const racialBonuses = getCombinedAbilityBonuses();
    const totalConstitutionMod = constitutionModifier + racialBonuses.constitution;

    return classHitDie + totalConstitutionMod;
  }, [characterData.selectedClass, characterData.abilityScores.constitution, getAbilityModifier, getCombinedAbilityBonuses]);

  const calculateArmorClass = useCallback((): number => {
    const dexterityModifier = getAbilityModifier(characterData.abilityScores.dexterity);
    const racialBonuses = getCombinedAbilityBonuses();
    const totalDexterityMod = dexterityModifier + racialBonuses.dexterity;

    return 10 + totalDexterityMod;
  }, [characterData.abilityScores.dexterity, getAbilityModifier, getCombinedAbilityBonuses]);

  const getSpellcastingAbility = useCallback((classIndex?: string): keyof AbilityScores | null => {
    const selectedClass = classIndex ? classesData.find(c => c.index === classIndex) : characterData.selectedClass;
    return selectedClass?.spellcasting?.spellcasting_ability?.index as keyof AbilityScores || null;
  }, [characterData.selectedClass, classesData]);

  // ===========================
  // SUBRACE/SUBCLASS FUNCTIONS
  // ===========================

  const getAvailableSubraces = useCallback((raceIndex: string) => {
    return subracesData.filter(subrace => subrace.race?.index === raceIndex);
  }, [subracesData]);

  const getAvailableSubclasses = useCallback((classIndex: string) => {
    return subclassesData.filter(subclass => subclass.class?.index === classIndex);
  }, [subclassesData]);

  const needsSubrace = useCallback((): boolean => {
    if (!characterData.selectedRace) return false;
    const availableSubraces = getAvailableSubraces(characterData.selectedRace.index);
    return availableSubraces.length > 0;
  }, [characterData.selectedRace, getAvailableSubraces]);

  const needsSubclass = useCallback((): boolean => {
    if (!characterData.selectedClass) return false;
    
    const subclassLevels: Record<string, number> = {
      'cleric': 1,
      'sorcerer': 1,
      'warlock': 1,
      'wizard': 2,
      'druid': 2,
      'fighter': 3,
      'monk': 3,
      'paladin': 3,
      'ranger': 3,
      'rogue': 3,
      'barbarian': 3,
      'bard': 3,
    };
    
    const requiredLevel = subclassLevels[characterData.selectedClass.index] || 3;
    return characterData.level >= requiredLevel;
  }, [characterData.selectedClass, characterData.level]);

  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return SKILLS;
    
    const skillOptions = characterData.selectedClass.proficiency_choices?.find(
      choice => choice.type === "proficiencies"
    );
    
    if (!skillOptions) return SKILLS;
    
    const availableSkillIndices = skillOptions.from.options
      .filter(option => option.option_type === "reference")
      .map(option => option.item.index)
      .filter(index => index.startsWith("skill-"));
    
    return SKILLS.filter(skill => 
      availableSkillIndices.includes(`skill-${skill.key}`)
    );
  }, [characterData.selectedClass]);

  const getSkillChoices = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    const skillChoice = characterData.selectedClass.proficiency_choices?.find(
      choice => choice.type === "proficiencies"
    );
    
    return skillChoice?.choose || 2;
  }, [characterData.selectedClass]);

  // ===========================
  // STEP VALIDATION - 🔥 CORREÇÃO 2: Validação do equipment
  // ===========================

  const validateStep = useCallback((stepId: string): boolean => {
    switch (stepId) {
      case "basic-info":
        return !!(
          characterData.name.trim() &&
          characterData.selectedRace &&
          characterData.selectedClass &&
          characterData.selectedBackground
        );

      case "ability-scores":
        const totalPoints = Object.values(characterData.abilityScores).reduce((sum, score) => sum + score, 0);
        return characterData.abilityMethod === "standard" ? totalPoints === 75 : totalPoints >= 60;

      case "skills":
        return characterData.selectedSkills.length === characterData.availableSkillChoices;

      // 🔥 CORREÇÃO: Validar se pelo menos 1 equipamento foi selecionado
      case "equipment":
        return characterData.selectedEquipment && 
               characterData.selectedEquipment.length > 0;

      case "spells":
        if (!characterData.isSpellcaster) return true;
        return characterData.selectedSpells.length > 0;

      case "personality":
        return (
          characterData.personalityTraits.length > 0 &&
          characterData.ideals.length > 0 &&
          characterData.bonds.length > 0 &&
          characterData.flaws.length > 0
        );

      default:
        return false;
    }
  }, [characterData]);

  const validateCurrentStep = useCallback((): boolean => {
    return currentStepData ? validateStep(currentStepData.id) : false;
  }, [currentStep, steps, validateStep]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // ===========================
  // STEP NAVIGATION
  // ===========================

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  // ===========================
  // CHARACTER ACTIONS
  // ===========================

  const resetCharacter = useCallback(() => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
  }, []);

  const createCharacter = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Criando personagem:", characterData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("✅ Personagem criado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData]);

  // ===========================
  // AUTO-CALCULATIONS
  // ===========================

  useEffect(() => {
    const newHitPoints = calculateHitPoints();
    const newArmorClass = calculateArmorClass();
    
    if (newHitPoints !== characterData.hitPoints || newArmorClass !== characterData.armorClass) {
      setCharacterData(prev => ({
        ...prev,
        hitPoints: newHitPoints,
        armorClass: newArmorClass,
      }));
    }
  }, [
    characterData.selectedClass,
    characterData.abilityScores,
    characterData.selectedRace,
    characterData.selectedSubrace,
    calculateHitPoints,
    calculateArmorClass,
  ]);

  useEffect(() => {
    if (characterData.selectedClass && characterData.selectedClass.spellcasting) {
      const isSpellcaster = !!characterData.selectedClass.spellcasting;
      const skillChoices = characterData.selectedClass.proficiency_choices?.[0]?.choose || 2;
      
      setCharacterData(prev => ({
        ...prev,
        isSpellcaster,
        spellcastingAbility: isSpellcaster ? characterData.selectedClass?.spellcasting?.spellcasting_ability?.index as keyof AbilityScores || null : null,
        availableSkillChoices: skillChoices,
        selectedSpells: isSpellcaster ? prev.selectedSpells : [],
      }));
    }
  }, [characterData.selectedClass]);

  // ===========================
  // UPDATE STEP VALIDATION STATUS
  // ===========================

  useEffect(() => {
    setSteps(prev =>
      prev.map(step => ({
        ...step,
        isValid: validateStep(step.id),
        isCompleted: validateStep(step.id),
      }))
    );
  }, [characterData, validateStep]);

  // ===========================
  // ERROR HANDLING
  // ===========================

  useEffect(() => {
    const errors = [];
    const fallbacks = [];
    
    if (racesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR RAÇAS DA API =====");
      console.warn("📋 Detalhes:", racesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("raças");
      fallbacks.push("📋 Raças: dados locais");
    }
    
    if (classesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR CLASSES DA API =====");
      console.warn("📋 Detalhes:", classesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("classes");
      fallbacks.push("📋 Classes: dados locais");
    }
    
    if (backgroundsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR BACKGROUNDS DA API =====");
      console.warn("📋 Detalhes:", backgroundsError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("backgrounds");
      fallbacks.push("📋 Backgrounds: dados locais");
    }

    if (errors.length > 0) {
      setError(`Alguns dados não puderam ser carregados da API: ${errors.join(", ")}. Usando dados locais como fallback.`);
    }
  }, [racesError, classesError, backgroundsError]);

  // ===========================
  // RETURN CONTEXT VALUE
  // ===========================

  return (
    <CharacterCreationContext.Provider value={{
      // Step management
      currentStep,
      steps,
      currentStepData,
      progress,
      nextStep,
      prevStep,
      goToStep,
      canProceed,

      // Character data
      characterData,
      updateCharacterData,
      updateCharacterField,
      updateAbilityScore,
      toggleSkill,
      toggleSpell,

      // Data from API
      races: filteredRaces,
      subraces: subracesData,
      classes: filteredClasses,
      subclasses: subclassesData,
      backgrounds: backgroundsData,
      spells: filteredSpells,

      // Loading states
      isLoading,
      loading,
      isLoadingRaces,
      isLoadingClasses,
      isLoadingBackgrounds,
      isLoadingSpells,
      isLoadingSubclasses,
      isLoadingSubraces,
      error,

      // Search
      raceSearchTerm,
      setRaceSearchTerm,
      classSearchTerm,
      setClassSearchTerm,
      spellSearchTerm,
      setSpellSearchTerm,
      raceSearch: raceSearchTerm,
      setRaceSearch: setRaceSearchTerm,
      classSearch: classSearchTerm,
      setClassSearch: setClassSearchTerm,
      spellSearch: spellSearchTerm,
      setSpellSearch: setSpellSearchTerm,

      // Actions
      resetCharacter,
      createCharacter,

      // Validation
      validateStep,
      validateCurrentStep,
      isStepValid: validateStep,

      // Utility functions
      calculateModifier: (score: number) => Math.floor((score - 10) / 2),
      getCombinedAbilityBonuses: getCombinedAbilityBonuses(),
      getAbilityModifier,
      calculateHitPoints,
      calculateArmorClass,
      getSpellcastingAbility,
      
      // Subrace/Subclass Functions
      getAvailableSubraces,
      getAvailableSubclasses,
      needsSubrace,
      needsSubclass,
      getAvailableSkills,
      getSkillChoices,
      
      // Additional Utility Functions
      getProficiencyBonus: (level: number) => Math.ceil(level / 4) + 1,
      getSkillModifier: (skill: string, scores: AbilityScores, isProficient = false) => {
        const skillInfo = SKILLS.find(s => s.key === skill);
        if (!skillInfo) return 0;
        
        const abilityScore = scores[skillInfo.ability];
        const abilityMod = getAbilityModifier(abilityScore);
        const profBonus = isProficient ? Math.ceil(characterData.level / 4) + 1 : 0;
        
        return abilityMod + profBonus;
      },
    }}>
      {children}
    </CharacterCreationContext.Provider>
  );
}