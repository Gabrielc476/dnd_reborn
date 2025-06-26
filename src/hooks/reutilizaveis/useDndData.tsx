// ===========================
// USE DND DATA HOOK - SEM REACT QUERY
// ===========================
"use client";

import { useState, useEffect, useMemo } from "react";
import { CharacterCreationData } from "@/types/characterCreation";
import { useCharacterSpells } from "@/hooks/reutilizaveis/useSpells";

// ===========================
// DADOS HARDCODED PARA GARANTIR QUE FUNCIONEM
// ===========================

const RACES_DATA = [
  {
    index: "human",
    name: "Humano",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "str", name: "Força", url: "" }, bonus: 1 },
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 1 },
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
      { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
      { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
    ],
    alignment: "Humanos tendem para nenhum alinhamento em particular.",
    age: "Os humanos vivem menos de um século.",
    size: "Medium",
    size_description: "Tamanho Médio.",
    starting_proficiencies: [],
    languages: [{ index: "common", name: "Comum", url: "" }],
    language_desc: "Você pode falar, ler e escrever Comum.",
    traits: [],
    subraces: [],
    url: "/api/races/human",
  },
  {
    index: "elf",
    name: "Elfo",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
    ],
    alignment: "Os elfos se inclinam para o caos.",
    age: "Os elfos vivem até 750 anos.",
    size: "Medium",
    size_description: "Tamanho Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    language_desc: "Você pode falar Comum e Élfico.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "keen-senses", name: "Sentidos Aguçados", url: "" }
    ],
    subraces: [],
    url: "/api/races/elf",
  },
  {
    index: "dwarf",
    name: "Anão",
    speed: 25,
    ability_bonuses: [
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 2 },
    ],
    alignment: "Os anões tendem para o bem.",
    age: "Os anões vivem até 400 anos.",
    size: "Medium",
    size_description: "Tamanho Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "dwarvish", name: "Anão", url: "" }
    ],
    language_desc: "Você pode falar Comum e Anão.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "dwarven-resilience", name: "Resistência Anã", url: "" }
    ],
    subraces: [],
    url: "/api/races/dwarf",
  },
  {
    index: "halfling",
    name: "Halfling",
    speed: 25,
    ability_bonuses: [
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
    ],
    alignment: "Os halflings são bondosos.",
    age: "Os halflings vivem até 150 anos.",
    size: "Small",
    size_description: "Tamanho Pequeno.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "halfling", name: "Halfling", url: "" }
    ],
    language_desc: "Você pode falar Comum e Halfling.",
    traits: [
      { index: "lucky", name: "Sortudo", url: "" },
      { index: "brave", name: "Corajoso", url: "" }
    ],
    subraces: [],
    url: "/api/races/halfling",
  }
];

const CLASSES_DATA = [
  {
    index: "fighter",
    name: "Guerreiro",
    hit_die: 10,
    proficiencies: [
      { index: "all-armor", name: "Todas as armaduras", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "martial-weapons", name: "Armas marciais", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas perícias dentre Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "acrobatics", name: "Acrobacia", url: "" } },
            { option_type: "reference", item: { index: "animal-handling", name: "Adestrar Animais", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "str", name: "Força", url: "" },
      { index: "con", name: "Constituição", url: "" }
    ],
    starting_equipment: [],
    spellcasting: undefined,
    url: "/api/classes/fighter",
  },
  {
    index: "wizard",
    name: "Mago",
    hit_die: 6,
    proficiencies: [
      { index: "daggers", name: "Adagas", url: "" },
      { index: "darts", name: "Dardos", url: "" },
      { index: "slings", name: "Fundas", url: "" },
      { index: "quarterstaffs", name: "Bordões", url: "" },
      { index: "light-crossbows", name: "Bestas leves", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas perícias dentre Arcanismo, História, Intuição, Investigação, Medicina e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "arcana", name: "Arcanismo", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "int", name: "Inteligência", url: "" },
      { index: "wis", name: "Sabedoria", url: "" }
    ],
    starting_equipment: [],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "int", name: "Inteligência", url: "" },
      info: [
        { name: "Cantrips", desc: ["At 1st level, you know three cantrips of your choice from the wizard spell list."] },
        { name: "Spellbook", desc: ["You have a spellbook containing six 1st-level wizard spells of your choice."] }
      ]
    },
    url: "/api/classes/wizard",
  },
  {
    index: "cleric",
    name: "Clérico",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "medium-armor", name: "Armaduras médias", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas perícias dentre História, Intuição, Medicina, Persuasão e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "wis", name: "Sabedoria", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" },
      info: [
        { name: "Cantrips", desc: ["At 1st level, you know three cantrips of your choice from the cleric spell list."] },
        { name: "Spells", desc: ["You know two 1st-level spells of your choice from the cleric spell list."] }
      ]
    },
    url: "/api/classes/cleric",
  },
  {
    index: "rogue",
    name: "Ladino",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "hand-crossbows", name: "Bestas de mão", url: "" },
      { index: "longswords", name: "Espadas longas", url: "" },
      { index: "rapiers", name: "Rapieiras", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha quatro perícias dentre Acrobacia, Atletismo, Enganação, Furtividade, Intuição, Intimidação, Investigação, Percepção, Atuação, Persuasão, Prestidigitação e Sobrevivência",
        choose: 4,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "acrobatics", name: "Acrobacia", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "deception", name: "Enganação", url: "" } },
            { option_type: "reference", item: { index: "stealth", name: "Furtividade", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "performance", name: "Atuação", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "sleight-of-hand", name: "Prestidigitação", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "dex", name: "Destreza", url: "" },
      { index: "int", name: "Inteligência", url: "" }
    ],
    starting_equipment: [],
    spellcasting: undefined,
    url: "/api/classes/rogue",
  }
];

const BACKGROUNDS_DATA = [
  {
    index: "acolyte",
    name: "Acólito",
    starting_proficiencies: [
      { index: "insight", name: "Intuição", url: "" },
      { index: "religion", name: "Religião", url: "" }
    ],
    languages: [
      { index: "language-choice", name: "Dois idiomas à sua escolha", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "holy-symbol", name: "Símbolo Sagrado", url: "" }, quantity: 1 },
      { equipment: { index: "prayer-book", name: "Livro de Orações", url: "" }, quantity: 1 },
      { equipment: { index: "incense", name: "Incenso", url: "" }, quantity: 5 },
      { equipment: { index: "vestments", name: "Vestimentas", url: "" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas Comuns", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Bolsa", url: "" }, quantity: 1 }
    ],
    feature: {
      name: "Abrigo dos Fiéis",
      desc: ["Como um acólito, você comanda o respeito daqueles que compartilham sua fé."]
    },
    personality_traits: {
      choose: 2,
      from: [
        "Eu idolatro um herói específico da minha fé e constantemente me refiro aos feitos e exemplo dessa pessoa.",
        "Eu posso encontrar um terreno comum entre os inimigos mais ferozes, com empatia por eles e sempre trabalhando em direção à paz."
      ]
    },
    ideals: {
      choose: 1,
      from: [
        "Tradição: As tradições antigas de adoração e sacrifício devem ser preservadas e defendidas.",
        "Caridade: Eu sempre tento ajudar os necessitados, não importa qual seja o custo pessoal."
      ]
    },
    bonds: {
      choose: 1,
      from: [
        "Eu morreria para recuperar uma relíquia antiga da minha fé que foi perdida há muito tempo.",
        "Eu devo tudo ao meu templo. Tudo que eu faço é em serviço do templo."
      ]
    },
    flaws: {
      choose: 1,
      from: [
        "Eu julgo severamente os outros, e ainda mais severamente a mim mesmo.",
        "Eu deposito muita confiança naqueles que exercem poder na hierarquia do meu templo."
      ]
    },
    url: "/api/backgrounds/acolyte",
  },
  {
    index: "criminal",
    name: "Criminoso",
    starting_proficiencies: [
      { index: "deception", name: "Enganação", url: "" },
      { index: "stealth", name: "Furtividade", url: "" }
    ],
    languages: [],
    starting_equipment: [
      { equipment: { index: "crowbar", name: "Pé de Cabra", url: "" }, quantity: 1 },
      { equipment: { index: "dark-clothes", name: "Roupas Escuras", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Bolsa", url: "" }, quantity: 1 }
    ],
    feature: {
      name: "Contato Criminoso",
      desc: ["Você tem um contato confiável que atua como seu informante em uma rede criminosa."]
    },
    personality_traits: {
      choose: 2,
      from: [
        "Eu sempre tenho um plano para o que fazer quando as coisas dão errado.",
        "Eu sou incrivelmente lento para confiar. Aqueles que parecem os mais justos frequentemente têm mais a esconder."
      ]
    },
    ideals: {
      choose: 1,
      from: [
        "Honra: Eu não roubo de outros no comércio.",
        "Liberdade: Correntes são feitas para serem quebradas, assim como aqueles que as forjariam."
      ]
    },
    bonds: {
      choose: 1,
      from: [
        "Eu traí alguém que confiava em mim. Eu procuro redimir-me por esse erro.",
        "Um dia eu voltarei para casa e provarei que sou o herói da minha comunidade."
      ]
    },
    flaws: {
      choose: 1,
      from: [
        "Quando vejo algo valioso, não consigo pensar em nada além de como roubá-lo.",
        "Quando confrontado com uma escolha entre dinheiro e meus amigos, eu geralmente escolho o dinheiro."
      ]
    },
    url: "/api/backgrounds/criminal",
  }
];

// ===========================
// MAIN HOOK - SEM REACT QUERY
// ===========================

export const useDndData = (
  characterData: CharacterCreationData,
  searchTerms: {
    debouncedRaceSearch: string;
    debouncedClassSearch: string;
    debouncedSpellSearch: string;
    debouncedBackgroundSearch: string;
  }
) => {
  const [racesData, setRacesData] = useState(RACES_DATA);
  const [classesData, setClassesData] = useState(CLASSES_DATA);
  const [backgroundsData, setBackgroundsData] = useState(BACKGROUNDS_DATA);
  const [subracesData, setSubracesData] = useState<any[]>([]);
  const [subclassesData, setSubclassesData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms de loading para parecer realista

    return () => clearTimeout(timer);
  }, []);

  // ===========================
  // SISTEMA DE MAGIAS
  // ===========================

  const {
    spells: spellsData,
    isLoading: spellsLoading,
    error: spellsError,
    fetchSpells,
    maxSpellLevel,
    canCastSpells
  } = useCharacterSpells({
    selectedClass: characterData.selectedClass,
    level: characterData.level,
    isSpellcaster: characterData.isSpellcaster
  });

  // ===========================
  // FILTROS
  // ===========================

  const filteredRaces = useMemo(() => {
    if (!searchTerms.debouncedRaceSearch) return racesData;
    return racesData.filter(race =>
      race.name.toLowerCase().includes(searchTerms.debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, searchTerms.debouncedRaceSearch]);

  const filteredClasses = useMemo(() => {
    if (!searchTerms.debouncedClassSearch) return classesData;
    return classesData.filter(cls =>
      cls.name.toLowerCase().includes(searchTerms.debouncedClassSearch.toLowerCase())
    );
  }, [classesData, searchTerms.debouncedClassSearch]);

  const filteredBackgrounds = useMemo(() => {
    if (!searchTerms.debouncedBackgroundSearch) return backgroundsData;
    return backgroundsData.filter(bg =>
      bg.name.toLowerCase().includes(searchTerms.debouncedBackgroundSearch.toLowerCase())
    );
  }, [backgroundsData, searchTerms.debouncedBackgroundSearch]);

  const filteredSpells = useMemo(() => {
    if (!searchTerms.debouncedSpellSearch) return spellsData;
    
    return spellsData.filter(spell =>
      spell.name.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase()) ||
      spell.desc.some(desc => 
        desc.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase())
      )
    );
  }, [spellsData, searchTerms.debouncedSpellSearch]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const getAvailableSubraces = () => {
    return subracesData.filter(
      subrace => subrace.race?.index === characterData.selectedRace?.index
    );
  };

  const getAvailableSubclasses = () => {
    return subclassesData.filter(
      subclass => subclass.class?.index === characterData.selectedClass?.index
    );
  };

  const getSubclassFeatures = (subclassIndex: string) => {
    const subclass = subclassesData.find(sc => sc.index === subclassIndex);
    return subclass?.subclass_levels || [];
  };

  const getCombinedAbilityBonuses = () => {
    const bonuses: Record<string, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Bônus da raça
    if (characterData.selectedRace?.ability_bonuses) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index.replace('str', 'strength')
          .replace('dex', 'dexterity')
          .replace('con', 'constitution')
          .replace('int', 'intelligence')
          .replace('wis', 'wisdom')
          .replace('cha', 'charisma') as keyof typeof bonuses;
        
        if (bonuses[abilityKey] !== undefined) {
          bonuses[abilityKey] += bonus.bonus;
        }
      });
    }

    // Bônus da subraça
    if (characterData.selectedSubrace?.ability_bonuses) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index as keyof typeof bonuses;
        if (bonuses[abilityKey] !== undefined) {
          bonuses[abilityKey] += bonus.bonus;
        }
      });
    }
    
    return Object.entries(bonuses)
      .filter(([_, value]) => value > 0)
      .map(([ability, bonus]) => ({
        ability_score: { 
          index: ability, 
          name: ability.charAt(0).toUpperCase() + ability.slice(1),
          url: `/api/ability-scores/${ability}`
        },
        bonus
      }));
  };

  const getSubraceAbilityBonuses = () => {
    if (!characterData.selectedSubrace) return [];
    return characterData.selectedSubrace.ability_bonuses;
  };

  // ===========================
  // SPELL INFO
  // ===========================

  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass) {
      return { cantrips: 0, spells: 0 };
    }

    const classIndex = characterData.selectedClass.index;
    const spellcasting = characterData.selectedClass.spellcasting;
    
    if (!spellcasting) {
      return { cantrips: 0, spells: 0 };
    }

    // Valores padrão baseados na classe
    switch (classIndex) {
      case "wizard":
        return { cantrips: 3, spells: 6 };
      case "cleric":
        return { cantrips: 3, spells: 2 };
      case "sorcerer":
        return { cantrips: 4, spells: 2 };
      case "bard":
        return { cantrips: 2, spells: 4 };
      case "warlock":
        return { cantrips: 2, spells: 2 };
      default:
        return { cantrips: 0, spells: 0 };
    }
  }, [characterData.selectedClass]);

  // ===========================
  // RETURN
  // ===========================

  return {
    // Dados principais
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: filteredBackgrounds,
    spells: filteredSpells,
    subraces: getAvailableSubraces(),
    subclasses: getAvailableSubclasses(),

    // Loading states
    isLoadingRaces: loading,
    isLoadingClasses: loading,
    isLoadingBackgrounds: loading,
    isLoadingSpells: spellsLoading,
    isLoadingSubraces: false,
    isLoadingSubclasses: false,

    // Errors
    racesError: null,
    classesError: null,
    spellsError,

    // Helper functions
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,

    // Spell functions
    fetchSpells,
    maxSpellLevel,
    canCastSpells,

    // Spell info
    spellInfo,
    startingCantrips: spellInfo.cantrips,
    startingSpells: spellInfo.spells,
  };
};

export default useDndData;