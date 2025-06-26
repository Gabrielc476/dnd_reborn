// ===========================
// USE SPELLS HOOK - SEM REACT QUERY
// ===========================
"use client";

import { useState, useCallback, useMemo } from "react";
import { DndSpell } from "@/types/characterCreation";

// ===========================
// TYPES
// ===========================

interface SpellFilters {
  classIndex?: string;
  maxLevel?: number;
  school?: string;
  searchTerm?: string;
}

interface UseSpellsOptions {
  enabled?: boolean;
  autoFetch?: boolean;
  staleTime?: number;
}

interface UseSpellsReturn {
  spells: DndSpell[];
  isLoading: boolean;
  error: Error | null;
  fetchSpells: (filters: SpellFilters) => void;
  clearSpells: () => void;
  hasSpells: boolean;
  filteredSpells: DndSpell[];
}

// ===========================
// DADOS HARDCODED DE MAGIAS POR CLASSE
// ===========================

const SPELL_DATA: Record<string, DndSpell[]> = {
  wizard: [
    {
      index: "light",
      name: "Luz",
      level: 0,
      desc: ["Você toca um objeto que não seja maior que 3 metros em qualquer dimensão. Até a magia acabar, o objeto emite luz plena num raio de 6 metros e penumbra por mais 6 metros."],
      higher_level: [],
      range: "Toque",
      components: ["V", "M"],
      material: "Um vaga-lume ou musgo fosforescente",
      ritual: false,
      duration: "1 hora",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/light"
    },
    {
      index: "mage-hand",
      name: "Mão Mágica",
      level: 0,
      desc: ["Uma mão espectral e flutuante aparece num ponto que você escolher, dentro do alcance."],
      higher_level: [],
      range: "9 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "1 minuto",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "conjuration", name: "Conjuração", url: "/api/magic-schools/conjuration" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/mage-hand"
    },
    {
      index: "prestidigitation",
      name: "Prestidigitação",
      level: 0,
      desc: ["Esta magia é um truque menor usado por conjuradores novatos para praticar."],
      higher_level: [],
      range: "3 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "Até 1 hora",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "transmutation", name: "Transmutação", url: "/api/magic-schools/transmutation" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/prestidigitation"
    },
    {
      index: "magic-missile",
      name: "Mísseis Mágicos",
      level: 1,
      desc: ["Você cria três dardos brilhantes de força mágica. Cada dardo atinge uma criatura, à sua escolha, que você possa ver dentro do alcance."],
      higher_level: ["Quando você conjurar essa magia usando um espaço de magia de 2º nível ou superior, a magia cria mais um dardo para cada nível do espaço acima do 1º."],
      range: "36 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/magic-missile"
    },
    {
      index: "shield",
      name: "Escudo",
      level: 1,
      desc: ["Uma barreira invisível de força mágica aparece e o protege."],
      higher_level: [],
      range: "Pessoal",
      components: ["V", "S"],
      ritual: false,
      duration: "1 rodada",
      concentration: false,
      casting_time: "1 reação",
      school: { index: "abjuration", name: "Abjuração", url: "/api/magic-schools/abjuration" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/shield"
    },
    {
      index: "detect-magic",
      name: "Detectar Magia",
      level: 1,
      desc: ["Pela duração, você sente a presença de magia a até 9 metros de você."],
      higher_level: [],
      range: "Pessoal",
      components: ["V", "S"],
      ritual: true,
      duration: "10 minutos",
      concentration: true,
      casting_time: "1 ação",
      school: { index: "divination", name: "Adivinhação", url: "/api/magic-schools/divination" },
      classes: [{ index: "wizard", name: "Mago", url: "/api/classes/wizard" }],
      subclasses: [],
      url: "/api/spells/detect-magic"
    }
  ],
  cleric: [
    {
      index: "guidance",
      name: "Orientação",
      level: 0,
      desc: ["Você toca uma criatura voluntária. Uma vez, antes da magia acabar, o alvo pode rolar um d4 e adicionar o resultado a um teste de habilidade, à escolha dele."],
      higher_level: [],
      range: "Toque",
      components: ["V", "S"],
      ritual: false,
      duration: "1 minuto",
      concentration: true,
      casting_time: "1 ação",
      school: { index: "divination", name: "Adivinhação", url: "/api/magic-schools/divination" },
      classes: [{ index: "cleric", name: "Clérico", url: "/api/classes/cleric" }],
      subclasses: [],
      url: "/api/spells/guidance"
    },
    {
      index: "sacred-flame",
      name: "Chama Sagrada",
      level: 0,
      desc: ["Uma chama parecida com radiância desce sobre uma criatura que você possa ver, dentro do alcance."],
      higher_level: [],
      range: "18 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "cleric", name: "Clérico", url: "/api/classes/cleric" }],
      subclasses: [],
      url: "/api/spells/sacred-flame"
    },
    {
      index: "thaumaturgy",
      name: "Taumaturgia",
      level: 0,
      desc: ["Você manifesta uma maravilha menor, um sinal de poder sobrenatural, dentro do alcance."],
      higher_level: [],
      range: "9 metros",
      components: ["V"],
      ritual: false,
      duration: "Até 1 minuto",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "transmutation", name: "Transmutação", url: "/api/magic-schools/transmutation" },
      classes: [{ index: "cleric", name: "Clérico", url: "/api/classes/cleric" }],
      subclasses: [],
      url: "/api/spells/thaumaturgy"
    },
    {
      index: "cure-wounds",
      name: "Curar Ferimentos",
      level: 1,
      desc: ["Uma criatura que você tocar recupera pontos de vida iguais a 1d8 + seu modificador de habilidade de conjuração."],
      higher_level: ["Quando você conjurar essa magia usando um espaço de magia de 2º nível ou superior, a cura aumenta em 1d8 para cada nível do espaço acima do 1º."],
      range: "Toque",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "cleric", name: "Clérico", url: "/api/classes/cleric" }],
      subclasses: [],
      url: "/api/spells/cure-wounds"
    },
    {
      index: "bless",
      name: "Bênção",
      level: 1,
      desc: ["Você abençoa até três criaturas, à sua escolha, dentro do alcance."],
      higher_level: ["Quando você conjurar essa magia usando um espaço de magia de 2º nível ou superior, você pode mirar uma criatura adicional para cada nível do espaço acima do 1º."],
      range: "9 metros",
      components: ["V", "S", "M"],
      material: "Um pouco de água benta",
      ritual: false,
      duration: "1 minuto",
      concentration: true,
      casting_time: "1 ação",
      school: { index: "enchantment", name: "Encantamento", url: "/api/magic-schools/enchantment" },
      classes: [{ index: "cleric", name: "Clérico", url: "/api/classes/cleric" }],
      subclasses: [],
      url: "/api/spells/bless"
    }
  ],
  sorcerer: [
    {
      index: "fire-bolt",
      name: "Projétil de Fogo",
      level: 0,
      desc: ["Você arremessa um cisco de fogo em direção a uma criatura ou objeto dentro do alcance."],
      higher_level: [],
      range: "36 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" }],
      subclasses: [],
      url: "/api/spells/fire-bolt"
    },
    {
      index: "minor-illusion",
      name: "Ilusão Menor",
      level: 0,
      desc: ["Você cria um som ou uma imagem de um objeto, dentro do alcance, que permanece pela duração."],
      higher_level: [],
      range: "9 metros",
      components: ["S", "M"],
      material: "Um pouco de lã ou uma pequena vareta",
      ritual: false,
      duration: "1 minuto",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "illusion", name: "Ilusão", url: "/api/magic-schools/illusion" },
      classes: [{ index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" }],
      subclasses: [],
      url: "/api/spells/minor-illusion"
    }
  ],
  bard: [
    {
      index: "vicious-mockery",
      name: "Zombaria Cruel",
      level: 0,
      desc: ["Você libera uma enxurrada de insultos impregnados com sutis encantamentos numa criatura que você possa ver, dentro do alcance."],
      higher_level: [],
      range: "18 metros",
      components: ["V"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "enchantment", name: "Encantamento", url: "/api/magic-schools/enchantment" },
      classes: [{ index: "bard", name: "Bardo", url: "/api/classes/bard" }],
      subclasses: [],
      url: "/api/spells/vicious-mockery"
    },
    {
      index: "healing-word",
      name: "Palavra de Cura",
      level: 1,
      desc: ["Uma criatura, à sua escolha, que você possa ver dentro do alcance, recupera pontos de vida iguais a 1d4 + seu modificador de habilidade de conjuração."],
      higher_level: ["Quando você conjurar essa magia usando um espaço de magia de 2º nível ou superior, a cura aumenta em 1d4 para cada nível do espaço acima do 1º."],
      range: "18 metros",
      components: ["V"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação bônus",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "bard", name: "Bardo", url: "/api/classes/bard" }],
      subclasses: [],
      url: "/api/spells/healing-word"
    }
  ],
  warlock: [
    {
      index: "eldritch-blast",
      name: "Rajada Sobrenatural",
      level: 0,
      desc: ["Um raio de energia crepitante ricocheteia em direção a uma criatura dentro do alcance."],
      higher_level: [],
      range: "36 metros",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantânea",
      concentration: false,
      casting_time: "1 ação",
      school: { index: "evocation", name: "Evocação", url: "/api/magic-schools/evocation" },
      classes: [{ index: "warlock", name: "Bruxo", url: "/api/classes/warlock" }],
      subclasses: [],
      url: "/api/spells/eldritch-blast"
    },
    {
      index: "hex",
      name: "Maldição",
      level: 1,
      desc: ["Você coloca uma maldição numa criatura que você possa ver dentro do alcance."],
      higher_level: ["Quando você conjurar essa magia usando um espaço de magia de 3º ou 4º nível, você pode manter sua concentração na magia por até 8 horas."],
      range: "27 metros",
      components: ["V", "S", "M"],
      material: "O olho petrificado de um tritão",
      ritual: false,
      duration: "1 hora",
      concentration: true,
      casting_time: "1 ação bônus",
      school: { index: "enchantment", name: "Encantamento", url: "/api/magic-schools/enchantment" },
      classes: [{ index: "warlock", name: "Bruxo", url: "/api/classes/warlock" }],
      subclasses: [],
      url: "/api/spells/hex"
    }
  ]
};

// ===========================
// HOOK PRINCIPAL
// ===========================

export const useSpells = (
  filters: SpellFilters = {},
  options: UseSpellsOptions = {}
): UseSpellsReturn => {
  const [currentFilters, setCurrentFilters] = useState<SpellFilters>(filters);
  const [isLoading, setIsLoading] = useState(false);

  // Obter magias da classe
  const spells = useMemo(() => {
    if (!currentFilters.classIndex) return [];
    
    const classSpells = SPELL_DATA[currentFilters.classIndex] || [];
    
    // Filtrar por nível máximo
    return classSpells.filter(spell => {
      if (currentFilters.maxLevel !== undefined) {
        return spell.level <= currentFilters.maxLevel;
      }
      return true;
    });
  }, [currentFilters.classIndex, currentFilters.maxLevel]);

  // Filtros adicionais
  const filteredSpells = useMemo(() => {
    let filtered = spells;

    // Filtro por escola de magia
    if (currentFilters.school) {
      filtered = filtered.filter(spell => 
        spell.school.index === currentFilters.school
      );
    }

    // Filtro por termo de busca
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(spell =>
        spell.name.toLowerCase().includes(searchLower) ||
        spell.desc.some(desc => desc.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [spells, currentFilters.school, currentFilters.searchTerm]);

  // Função para buscar magias
  const fetchSpells = useCallback((newFilters: SpellFilters) => {
    console.log("🎯 Atualizando filtros de magias:", newFilters);
    setCurrentFilters(newFilters);
  }, []);

  // Função para limpar magias
  const clearSpells = useCallback(() => {
    setCurrentFilters({});
  }, []);

  return {
    spells: filteredSpells,
    isLoading: false, // Sempre false pois os dados são instantâneos
    error: null, // Nunca há erro com dados hardcoded
    fetchSpells,
    clearSpells,
    hasSpells: filteredSpells.length > 0,
    filteredSpells,
  };
};

// ===========================
// HOOK ESPECÍFICO PARA CRIAÇÃO DE PERSONAGEM
// ===========================

export const useCharacterSpells = (characterData: {
  selectedClass?: { index: string } | null;
  level: number;
  isSpellcaster: boolean;
}) => {
  const maxSpellLevel = useMemo(() => {
    if (!characterData.isSpellcaster || !characterData.selectedClass) return 0;
    
    const classIndex = characterData.selectedClass.index;
    const level = characterData.level;

    // Lógica para calcular nível máximo de magia
    switch (classIndex) {
      case "wizard":
      case "sorcerer":
      case "cleric":
      case "druid":
      case "bard":
        // Conjuradores completos
        return Math.min(9, Math.ceil(level / 2));
      
      case "paladin":
      case "ranger":
        // Meio-conjuradores
        if (level < 2) return 0;
        return Math.min(5, Math.ceil((level - 1) / 4) + 1);
      
      case "warlock":
        // Warlock tem progressão especial
        if (level >= 9) return 5;
        if (level >= 7) return 4;
        if (level >= 5) return 3;
        if (level >= 3) return 2;
        return 1;
      
      default:
        return 0;
    }
  }, [characterData.selectedClass, characterData.level, characterData.isSpellcaster]);

  const spellsHook = useSpells({
    classIndex: characterData.selectedClass?.index,
    maxLevel: maxSpellLevel,
  }, {
    enabled: characterData.isSpellcaster,
    autoFetch: false,
  });

  return {
    ...spellsHook,
    maxSpellLevel,
    canCastSpells: characterData.isSpellcaster && maxSpellLevel > 0,
  };
};