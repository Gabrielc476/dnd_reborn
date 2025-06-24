// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO COMPLETA COM SUBCLASSES
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  CharacterCreationData,
  CharacterCreationContextType,
  CharacterCreationStep,
  AbilityScores,
  DndRace,
  DndSubrace,
  DndClass,
  DndSubclass,
  DndBackground,
  DndSpell,
  DndApiReference,
  StepValidation,
} from "@/types/characterCreation";

// ===========================
// QUERY CLIENT SETUP
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// ===========================
// DEBOUNCE HOOK
// ===========================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ===========================
// INITIAL DATA
// ===========================

const initialCharacterData: CharacterCreationData = {
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  level: 1,
  alignment: "",
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  abilityMethod: "standard",
  selectedSkills: [],
  availableSkillChoices: 0,
  hitPoints: 0,
  armorClass: 10,
  selectedSpells: [],
  isSpellcaster: false,
  spellcastingAbility: null,
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const characterCreationSteps: CharacterCreationStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "ability-scores",
    title: "Atributos",
    description: "Defina os valores dos seus atributos",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "HP, CA e equipamentos iniciais",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "personality",
    title: "Personalização",
    description: "Traços, ideais, vínculos e defeitos",
    isCompleted: false,
    isValid: false,
  },
];

// ===========================
// REACT QUERY HOOKS - TODOS OS DADOS COMPLETOS
// ===========================

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: () => {
      // Mock data com TODAS as raças originais
      return [
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
          alignment: "Qualquer alinhamento",
          age: "Humanos atingem a idade adulta no final da adolescência",
          size: "Medium",
          size_description: "Humanos variam amplamente em altura e constituição",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e um idioma extra de sua escolha",
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
          alignment: "Elfos são bondosos e mágicos",
          age: "Elfos amadurecem aos 100 anos e vivem 750 anos",
          size: "Medium",
          size_description: "Elfos têm entre 5 e 6 pés de altura",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Élfico",
          traits: [],
          subraces: [
            { index: "high-elf", name: "Alto Elfo", url: "/api/subraces/high-elf" },
            { index: "wood-elf", name: "Elfo da Floresta", url: "/api/subraces/wood-elf" },
          ],
          url: "/api/races/elf",
        },
        {
          index: "dwarf",
          name: "Anão",
          speed: 25,
          ability_bonuses: [
            { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 2 },
          ],
          alignment: "Anões são leais e honrados",
          age: "Anões amadurecem aos 50 anos e vivem cerca de 350 anos",
          size: "Medium",
          size_description: "Anões têm entre 4 e 5 pés de altura",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Anônico",
          traits: [],
          subraces: [
            { index: "hill-dwarf", name: "Anão da Colina", url: "/api/subraces/hill-dwarf" },
            { index: "mountain-dwarf", name: "Anão da Montanha", url: "/api/subraces/mountain-dwarf" },
          ],
          url: "/api/races/dwarf",
        },
        {
          index: "halfling",
          name: "Halfling",
          speed: 25,
          ability_bonuses: [
            { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
          ],
          alignment: "Halflings são bondosos e pacíficos",
          age: "Halflings atingem a idade adulta aos 20 anos e vivem cerca de 150 anos",
          size: "Small",
          size_description: "Halflings têm cerca de 3 pés de altura",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Halfling",
          traits: [],
          subraces: [
            { index: "lightfoot-halfling", name: "Halfling Pés Leves", url: "/api/subraces/lightfoot-halfling" },
            { index: "stout-halfling", name: "Halfling Robusto", url: "/api/subraces/stout-halfling" },
          ],
          url: "/api/races/halfling",
        },
        {
          index: "gnome",
          name: "Gnomo",
          speed: 25,
          ability_bonuses: [
            { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 2 },
          ],
          alignment: "Gnomos são bondosos e curiosos",
          age: "Gnomos amadurecem na mesma taxa que humanos e vivem entre 350 e 500 anos",
          size: "Small",
          size_description: "Gnomos têm entre 3 e 4 pés de altura",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Gnômico",
          traits: [],
          subraces: [
            { index: "forest-gnome", name: "Gnomo da Floresta", url: "/api/subraces/forest-gnome" },
            { index: "rock-gnome", name: "Gnomo das Rochas", url: "/api/subraces/rock-gnome" },
          ],
          url: "/api/races/gnome",
        },
        {
          index: "dragonborn",
          name: "Dracônico",
          speed: 30,
          ability_bonuses: [
            { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
            { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
          ],
          alignment: "Dracônicos tendem ao extremos",
          age: "Dracônicos crescem rapidamente e vivem cerca de 80 anos",
          size: "Medium",
          size_description: "Dracônicos são maiores e mais pesados que humanos",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Dracônico",
          traits: [],
          subraces: [],
          url: "/api/races/dragonborn",
        },
        {
          index: "half-elf",
          name: "Meio-Elfo",
          speed: 30,
          ability_bonuses: [
            { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 2 },
          ],
          alignment: "Meio-elfos compartilham a natureza caótica de sua herança élfica",
          age: "Meio-elfos amadurecem na mesma taxa que humanos e vivem cerca de 180 anos",
          size: "Medium",
          size_description: "Meio-elfos têm aproximadamente o mesmo tamanho que humanos",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum, Élfico e um idioma extra de sua escolha",
          traits: [],
          subraces: [],
          url: "/api/races/half-elf",
        },
        {
          index: "half-orc",
          name: "Meio-Orc",
          speed: 30,
          ability_bonuses: [
            { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
            { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
          ],
          alignment: "Meio-orcs herdam uma tendência ao caos de seus pais orcs",
          age: "Meio-orcs amadurecem um pouco mais rápido que humanos e vivem cerca de 75 anos",
          size: "Medium",
          size_description: "Meio-orcs são um pouco maiores e mais volumosos que humanos",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Orc",
          traits: [],
          subraces: [],
          url: "/api/races/half-orc",
        },
        {
          index: "tiefling",
          name: "Tiefling",
          speed: 30,
          ability_bonuses: [
            { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
            { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 2 },
          ],
          alignment: "Tieflings podem não ter uma tendência inerente ao mal",
          age: "Tieflings amadurecem na mesma taxa que humanos mas vivem alguns anos a mais",
          size: "Medium",
          size_description: "Tieflings têm aproximadamente o mesmo tamanho e constituição que humanos",
          starting_proficiencies: [],
          languages: [],
          language_desc: "Comum e Infernal",
          traits: [],
          subraces: [],
          url: "/api/races/tiefling",
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useClassesQuery() {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: () => {
      // Mock data com TODAS as classes originais
      return [
        {
          index: "barbarian",
          name: "Bárbaro",
          hit_die: 12,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: null,
          url: "/api/classes/barbarian",
        },
        {
          index: "bard",
          name: "Bardo",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "cha", name: "Carisma", url: "" },
            info: [],
          },
          url: "/api/classes/bard",
        },
        {
          index: "cleric",
          name: "Clérico",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" },
            info: [],
          },
          url: "/api/classes/cleric",
        },
        {
          index: "druid",
          name: "Druida",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" },
            info: [],
          },
          url: "/api/classes/druid",
        },
        {
          index: "fighter",
          name: "Guerreiro",
          hit_die: 10,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: null,
          url: "/api/classes/fighter",
        },
        {
          index: "monk",
          name: "Monge",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: null,
          url: "/api/classes/monk",
        },
        {
          index: "paladin",
          name: "Paladino",
          hit_die: 10,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 2,
            spellcasting_ability: { index: "cha", name: "Carisma", url: "" },
            info: [],
          },
          url: "/api/classes/paladin",
        },
        {
          index: "ranger",
          name: "Patrulheiro",
          hit_die: 10,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 2,
            spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" },
            info: [],
          },
          url: "/api/classes/ranger",
        },
        {
          index: "rogue",
          name: "Ladino",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: null,
          url: "/api/classes/rogue",
        },
        {
          index: "sorcerer",
          name: "Feiticeiro",
          hit_die: 6,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "cha", name: "Carisma", url: "" },
            info: [],
          },
          url: "/api/classes/sorcerer",
        },
        {
          index: "warlock",
          name: "Bruxo",
          hit_die: 8,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "cha", name: "Carisma", url: "" },
            info: [],
          },
          url: "/api/classes/warlock",
        },
        {
          index: "wizard",
          name: "Mago",
          hit_die: 6,
          proficiencies: [],
          proficiency_choices: [],
          saving_throws: [],
          starting_equipment: [],
          class_levels: [],
          multi_classing: {},
          subclasses: [],
          spellcasting: {
            level: 1,
            spellcasting_ability: { index: "int", name: "Inteligência", url: "" },
            info: [],
          },
          url: "/api/classes/wizard",
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useBackgroundsQuery() {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: () => {
      // Mock data com TODOS os backgrounds originais
      return [
        {
          index: "acolyte",
          name: "Acólito",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Abrigo dos Fiéis",
            desc: ["Você tem acesso a um templo onde pode encontrar abrigo e cuidados."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu idolatro um herói particular da minha fé.",
                },
                {
                  option_type: "string",
                  string: "Eu posso encontrar pontos em comum entre os inimigos mais ferozes.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Tradição. Os antigos costumes devem ser preservados.",
                },
                {
                  option_type: "string",
                  string: "Caridade. Eu sempre ajudo aqueles em necessidade.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu morreria para recuperar uma relíquia sagrada perdida.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu julgo os outros severamente e a mim mesmo ainda mais.",
                },
              ],
            },
          },
          url: "/api/backgrounds/acolyte",
        },
        {
          index: "criminal",
          name: "Criminoso",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Contato Criminal",
            desc: ["Você tem um contato confiável no submundo do crime."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu sempre tenho um plano para o que fazer quando as coisas dão errado.",
                },
                {
                  option_type: "string",
                  string: "Eu sou incrivelmente lento para confiar.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Honra. Eu não roubo de outros do comércio.",
                },
                {
                  option_type: "string",
                  string: "Liberdade. Grilhões são feitos para serem quebrados.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu traí alguém que confiava em mim.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Quando vejo algo valioso, não consigo pensar em mais nada.",
                },
              ],
            },
          },
          url: "/api/backgrounds/criminal",
        },
        {
          index: "folk-hero",
          name: "Herói Popular",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Hospitalidade Rústica",
            desc: ["Pessoas simples fazem todo o esforço para acomodá-lo."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu julgo as pessoas por suas ações, não por suas palavras.",
                },
                {
                  option_type: "string",
                  string: "Se alguém está em apuros, eu estou sempre pronto para dar uma ajuda.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Respeito. As pessoas merecem ser tratadas com dignidade.",
                },
                {
                  option_type: "string",
                  string: "Justiça. Ninguém deve ficar sem direitos básicos.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu tenho uma família, mas não faço ideia de onde eles estão.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "O tirano que governa minha terra não vai parar até eu estar morto.",
                },
              ],
            },
          },
          url: "/api/backgrounds/folk-hero",
        },
        {
          index: "noble",
          name: "Nobre",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Posição de Privilégio",
            desc: ["Graças à sua origem nobre, você é bem-vindo na alta sociedade."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Minha bajulação eloquente faz qualquer um se sentir importante.",
                },
                {
                  option_type: "string",
                  string: "Apesar da minha origem nobre, não me coloco acima dos outros.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Respeito. O respeito é devido a mim por causa da minha posição.",
                },
                {
                  option_type: "string",
                  string: "Responsabilidade. É meu dever respeitar a autoridade.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Devo minha vida à pessoa que me salvou de um escândalo.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu secretamente acredito que todos estão abaixo de mim.",
                },
              ],
            },
          },
          url: "/api/backgrounds/noble",
        },
        {
          index: "sage",
          name: "Erudito",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Pesquisador",
            desc: ["Você sabe onde e de quem obter informações."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu uso palavras polissilábicas que transmitem a impressão de grande erudição.",
                },
                {
                  option_type: "string",
                  string: "Eu li todos os livros das grandes bibliotecas.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Conhecimento. O caminho para o poder e auto-aperfeiçoamento é através do conhecimento.",
                },
                {
                  option_type: "string",
                  string: "Beleza. O que belo aponta além de si mesmo para algo além.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "O trabalho de minha vida é uma série de tomos sobre um campo específico de conhecimento.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu sou facilmente distraído pelo promessa de informação.",
                },
              ],
            },
          },
          url: "/api/backgrounds/sage",
        },
        {
          index: "soldier",
          name: "Soldado",
          starting_proficiencies: [],
          languages: [],
          starting_equipment: [],
          feature: {
            name: "Posição Militar",
            desc: ["Você tem uma posição militar que lhe confere autoridade sobre soldados de menor rank."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu sou sempre educado e respeitoso.",
                },
                {
                  option_type: "string",
                  string: "Eu sou assombrado por memórias de guerra.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Bem Maior. Nossos destinos estão unidos para o bem ou para o mal.",
                },
                {
                  option_type: "string",
                  string: "Responsabilidade. Eu faço o que preciso fazer e obedeço ordens justas.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu lutaria até a morte pelos meus companheiros.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "O inimigo monstruoso que enfrentei em batalha ainda me deixa tremendo de medo.",
                },
              ],
            },
          },
          url: "/api/backgrounds/soldier",
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSpellsQuery(enabled: boolean = true, level?: number, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", level, classIndex],
    queryFn: () => {
      // Mock spells data
      return [
        {
          index: "acid-splash",
          name: "Respingo Ácido",
          desc: ["Você arremessa uma bolha de ácido."],
          higher_level: [],
          range: "60 pés",
          components: ["V", "S"],
          material: "",
          ritual: false,
          duration: "Instantâneo",
          concentration: false,
          casting_time: "1 ação",
          level: 0,
          attack_type: "ranged",
          damage: {
            damage_type: { index: "acid", name: "Ácido", url: "" },
            damage_at_slot_level: { "0": "1d6" },
          },
          school: { index: "conjuration", name: "Conjuração", url: "" },
          classes: [
            { index: "sorcerer", name: "Feiticeiro", url: "" },
            { index: "wizard", name: "Mago", url: "" },
          ],
          subclasses: [],
          url: "/api/spells/acid-splash",
        },
        {
          index: "cure-wounds",
          name: "Curar Ferimentos",
          desc: ["Uma criatura que você tocar recupera pontos de vida."],
          higher_level: ["Quando você conjurar essa magia usando um slot de magia de 2º nível ou superior..."],
          range: "Toque",
          components: ["V", "S"],
          material: "",
          ritual: false,
          duration: "Instantâneo",
          concentration: false,
          casting_time: "1 ação",
          level: 1,
          damage: {
            damage_type: { index: "healing", name: "Cura", url: "" },
            damage_at_slot_level: { "1": "1d8 + mod" },
          },
          school: { index: "evocation", name: "Evocação", url: "" },
          classes: [
            { index: "bard", name: "Bardo", url: "" },
            { index: "cleric", name: "Clérico", url: "" },
            { index: "druid", name: "Druida", url: "" },
            { index: "paladin", name: "Paladino", url: "" },
            { index: "ranger", name: "Patrulheiro", url: "" },
          ],
          subclasses: [],
          url: "/api/spells/cure-wounds",
        },
        {
          index: "magic-missile",
          name: "Mísseis Mágicos",
          desc: ["Três dardos de energia mágica"],
          higher_level: [],
          range: "120 pés",
          components: ["V", "S"],
          material: "",
          ritual: false,
          duration: "Instantâneo",
          concentration: false,
          casting_time: "1 ação",
          level: 1,
          attack_type: "ranged",
          damage: { damage_type: { index: "force", name: "Força", url: "" } },
          school: { index: "evocation", name: "Evocação", url: "" },
          classes: [{ index: "wizard", name: "Mago", url: "" }],
          subclasses: [],
          url: "/api/spells/magic-missile",
        },
      ];
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: () => {
      // Mock subclasses data
      const allSubclasses = [
        {
          index: "champion",
          name: "Campeão",
          class: { index: "fighter", name: "Guerreiro", url: "" },
          subclass_flavor: "Arquétipo Marcial",
          desc: ["O epítome do guerreiro, focado em combate físico aprimorado."],
          subclass_levels: [
            {
              level: 3,
              features: [
                { index: "improved-critical", name: "Crítico Aprimorado", url: "" }
              ]
            }
          ],
          url: "/api/subclasses/champion",
        },
        {
          index: "school-of-evocation",
          name: "Escola de Evocação",
          class: { index: "wizard", name: "Mago", url: "" },
          subclass_flavor: "Escola Arcana",
          desc: ["Focados em magias que manipulam energia e criam efeitos elementais."],
          subclass_levels: [
            {
              level: 2,
              features: [
                { index: "evocation-savant", name: "Especialista em Evocação", url: "" },
                { index: "sculpt-spells", name: "Esculpir Magias", url: "" }
              ]
            }
          ],
          url: "/api/subclasses/school-of-evocation",
        },
        {
          index: "life-domain",
          name: "Domínio da Vida",
          class: { index: "cleric", name: "Clérico", url: "" },
          subclass_flavor: "Domínio Divino",
          desc: ["O domínio da vida foca na energia positiva vibrante."],
          subclass_levels: [
            {
              level: 1,
              features: [
                { index: "bonus-proficiency", name: "Proficiência Adicional", url: "" },
                { index: "disciple-of-life", name: "Discípulo da Vida", url: "" }
              ]
            }
          ],
          url: "/api/subclasses/life-domain",
        },
      ];

      if (classIndex) {
        return allSubclasses.filter(subclass => subclass.class.index === classIndex);
      }

      return allSubclasses;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ===========================
// CONTEXT
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | null>(null);

// ===========================
// MAIN HOOK IMPLEMENTATION
// ===========================

export const useCharacterCreation = (): CharacterCreationContextType => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(characterCreationSteps);
  const [characterData, setCharacterData] = useState(initialCharacterData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search states with debouncing
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");

  const debouncedRaceSearch = useDebounce(raceSearchTerm, 300);
  const debouncedClassSearch = useDebounce(classSearchTerm, 300);
  const debouncedSpellSearch = useDebounce(spellSearchTerm, 300);

  // Data queries with React Query
  const {
    data: racesData = [],
    isLoading: racesLoading,
    error: racesError,
  } = useRacesQuery();

  const {
    data: classesData = [],
    isLoading: classesLoading,
    error: classesError,
  } = useClassesQuery();

  const { data: backgroundsData = [], isLoading: backgroundsLoading } = useBackgroundsQuery();

  const { data: spellsData = [], isLoading: spellsLoading } = useSpellsQuery(
    characterData.isSpellcaster,
    undefined,
    characterData.selectedClass?.index
  );

  const { data: subclassesData = [], isLoading: subclassesLoading } = useSubclassesQuery(
    true,
    characterData.selectedClass?.index
  );

  // ===========================
  // MOCK SUBRACES DATA
  // ===========================

  const mockSubraces: DndSubrace[] = useMemo(() => [
    // Elfos
    {
      index: "high-elf",
      name: "Alto Elfo",
      race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
      desc: "Altos elfos são os mais mágicos dos elfos",
      ability_bonuses: [
        { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/high-elf",
    },
    {
      index: "wood-elf",
      name: "Elfo da Floresta",
      race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
      desc: "Elfos da floresta são rápidos e furtivos",
      ability_bonuses: [
        { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/wood-elf",
    },
    // Anões
    {
      index: "hill-dwarf",
      name: "Anão da Colina",
      race: { index: "dwarf", name: "Anão", url: "/api/races/dwarf" },
      desc: "Anões da colina são resistentes e sábios",
      ability_bonuses: [
        { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/hill-dwarf",
    },
    {
      index: "mountain-dwarf",
      name: "Anão da Montanha",
      race: { index: "dwarf", name: "Anão", url: "/api/races/dwarf" },
      desc: "Anões da montanha são fortes e resistentes",
      ability_bonuses: [
        { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/mountain-dwarf",
    },
    // Halflings
    {
      index: "lightfoot-halfling",
      name: "Halfling Pés Leves",
      race: { index: "halfling", name: "Halfling", url: "/api/races/halfling" },
      desc: "Halflings pés leves são carismáticos e furtivos",
      ability_bonuses: [
        { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/lightfoot-halfling",
    },
    {
      index: "stout-halfling",
      name: "Halfling Robusto",
      race: { index: "halfling", name: "Halfling", url: "/api/races/halfling" },
      desc: "Halflings robustos são resistentes como anões",
      ability_bonuses: [
        { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/stout-halfling",
    },
    // Gnomos
    {
      index: "forest-gnome",
      name: "Gnomo da Floresta",
      race: { index: "gnome", name: "Gnomo", url: "/api/races/gnome" },
      desc: "Gnomos da floresta são naturais e furtivos",
      ability_bonuses: [
        { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/forest-gnome",
    },
    {
      index: "rock-gnome",
      name: "Gnomo das Rochas",
      race: { index: "gnome", name: "Gnomo", url: "/api/races/gnome" },
      desc: "Gnomos das rochas são inventivos e resistentes",
      ability_bonuses: [
        { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
      ],
      starting_proficiencies: [],
      languages: [],
      racial_traits: [],
      url: "/api/subraces/rock-gnome",
    },
  ], []);

  // ===========================
  // FILTERED DATA WITH SEARCH
  // ===========================

  const filteredRaces = useMemo(() => {
    if (!debouncedRaceSearch) return racesData;
    return racesData.filter((race) =>
      race.name.toLowerCase().includes(debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, debouncedRaceSearch]);

  const filteredClasses = useMemo(() => {
    if (!debouncedClassSearch) return classesData;
    return classesData.filter((cls) =>
      cls.name.toLowerCase().includes(debouncedClassSearch.toLowerCase())
    );
  }, [classesData, debouncedClassSearch]);

  const filteredSpells = useMemo(() => {
    if (!debouncedSpellSearch) return spellsData;
    return spellsData.filter((spell) =>
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // ===========================
  // SUBRACES AND SUBCLASSES LOGIC
  // ===========================

  const availableSubraces = useMemo(() => {
    if (!characterData.selectedRace) return [];
    return mockSubraces.filter(
      (subrace) => subrace.race.index === characterData.selectedRace!.index
    );
  }, [characterData.selectedRace, mockSubraces]);

  const availableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) return [];
    return subclassesData.filter(
      (subclass) => subclass.class.index === characterData.selectedClass!.index
    );
  }, [characterData.selectedClass, subclassesData]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateAbilityScorePoints = useCallback(
    (scores: AbilityScores): number => {
      const costs: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
      };

      return Object.values(scores).reduce((sum, score) => {
        return sum + (costs[score] || 0);
      }, 0);
    },
    []
  );

  const generateRandomAbilityScores = useCallback((): AbilityScores => {
    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 6) + 1
      );
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    return {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };
  }, []);

  // ===========================
  // STEP VALIDATION
  // ===========================

  const totalSteps = steps.length;

  const validateStep = useCallback(
    (step: number, data: CharacterCreationData): StepValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      switch (step) {
        case 0: // Basic Info
          if (!data.name.trim()) errors.push("Nome é obrigatório");
          if (!data.selectedRace) errors.push("Selecione uma raça");
          if (!data.selectedClass) errors.push("Selecione uma classe");
          if (!data.selectedBackground) errors.push("Selecione um background");
          if (data.level < 1 || data.level > 20) {
            errors.push("Level deve estar entre 1 e 20");
          }
          break;

        case 1: // Ability Scores
          const total = Object.values(data.abilityScores).reduce(
            (sum, score) => sum + score,
            0
          );
          if (data.abilityMethod === "point_buy") {
            const remainingPoints = 27 - calculateAbilityScorePoints(data.abilityScores);
            if (remainingPoints !== 0) {
              errors.push(`Você deve usar exatamente 27 pontos (restam ${remainingPoints})`);
            }
          }
          break;

        case 2: // Skills
          if (data.selectedSkills.length > data.availableSkillChoices) {
            errors.push("Muitas perícias selecionadas");
          }
          break;

        case 3: // Equipment
          // Basic equipment validation
          break;

        case 4: // Spells
          if (data.isSpellcaster && data.selectedSpells.length === 0) {
            warnings.push("Considere selecionar algumas magias");
          }
          break;

        case 5: // Personality
          // Optional validation for personality traits
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [calculateAbilityScorePoints]
  );

  const validateCurrentStep = useCallback(() => {
    return validateStep(currentStep, characterData);
  }, [currentStep, characterData, validateStep]);

  const canProceed = useMemo(() => {
    return validateCurrentStep().isValid;
  }, [validateCurrentStep]);

  // ===========================
  // NAVIGATION
  // ===========================

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1 && canProceed) {
      setCurrentStep((prev) => prev + 1);
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === currentStep
            ? { ...step, isCompleted: true, isValid: true }
            : step
        )
      );
    }
  }, [canProceed, currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  // ===========================
  // AUTO-RESET CALLBACKS
  // ===========================

  const resetInvalidSubrace = useCallback(() => {
    if (characterData.selectedRace && characterData.selectedSubrace) {
      const currentSubraceIsValid = 
        characterData.selectedSubrace.race.index === characterData.selectedRace.index;
      
      if (!currentSubraceIsValid) {
        setCharacterData(prev => ({
          ...prev,
          selectedSubrace: null
        }));
      }
    }
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const resetInvalidSubclass = useCallback(() => {
    if (characterData.selectedClass && characterData.selectedSubclass) {
      const currentSubclassIsValid = 
        characterData.selectedSubclass.class.index === characterData.selectedClass.index;
      
      if (!currentSubclassIsValid) {
        setCharacterData(prev => ({
          ...prev,
          selectedSubclass: null
        }));
      }
    }
  }, [characterData.selectedClass, characterData.selectedSubclass]);

  // ===========================
  // DATA MANAGEMENT
  // ===========================

  const updateCharacterData = useCallback(
    (newData: Partial<CharacterCreationData>) => {
      setCharacterData((prev) => {
        const updated = { ...prev, ...newData };

        // Auto-calculations based on selections
        if (newData.selectedClass) {
          updated.isSpellcaster = !!newData.selectedClass.spellcasting;
          updated.spellcastingAbility =
            newData.selectedClass.spellcasting?.spellcasting_ability.index || null;
          updated.availableSkillChoices = 2; // Simplified

          // Reset subclass if class changed
          if (newData.selectedClass.index !== prev.selectedClass?.index) {
            updated.selectedSubclass = null;
          }
        }

        if (newData.selectedClass && updated.abilityScores && updated.level) {
          const conModifier = getAbilityModifier(updated.abilityScores.constitution);
          updated.hitPoints =
            newData.selectedClass.hit_die +
            conModifier +
            (updated.level - 1) *
              (Math.floor(newData.selectedClass.hit_die / 2) + 1 + conModifier);
        }

        if (newData.abilityScores) {
          const dexModifier = getAbilityModifier(updated.abilityScores.dexterity);
          updated.armorClass = 10 + dexModifier;
        }

        // Reset subrace if race changed
        if (newData.selectedRace && newData.selectedRace.index !== prev.selectedRace?.index) {
          updated.selectedSubrace = null;
        }

        return updated;
      });

      // Clear error when data changes
      if (error) setError(null);
    },
    [getAbilityModifier, error]
  );

  const resetCharacter = useCallback(() => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
    setSteps(characterCreationSteps);
    setError(null);
    setRaceSearchTerm("");
    setClassSearchTerm("");
    setSpellSearchTerm("");
  }, []);

  // ===========================
  // SEARCH HANDLERS
  // ===========================

  const searchHandlers = useMemo(
    () => ({
      setRaceSearch: setRaceSearchTerm,
      setClassSearch: setClassSearchTerm,
      setSpellSearch: setSpellSearchTerm,
      raceSearch: raceSearchTerm,
      classSearch: classSearchTerm,
      spellSearch: spellSearchTerm,
    }),
    [raceSearchTerm, classSearchTerm, spellSearchTerm]
  );

  // ===========================
  // CHARACTER CREATION
  // ===========================

  const createCharacter = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validate all steps
      for (let i = 0; i < totalSteps; i++) {
        const validation = validateStep(i, characterData);
        if (!validation.isValid) {
          throw new Error(
            `Erro no passo ${i + 1}: ${validation.errors.join(", ")}`
          );
        }
      }

      // Import and use real API
      const { characterAPI } = await import("@/api/characterAPI");

      // Validate data before sending
      const validationErrors = characterAPI.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(", ")}`);
      }

      // Create character via API
      const response = await characterAPI.createCharacter(characterData);

      if (!response.character) {
        throw new Error(response.error || "Erro ao criar personagem");
      }

      console.log("Personagem criado com sucesso:", response.character);

      // Reset form after success
      resetCharacter();
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData, totalSteps, validateStep, resetCharacter]);

  // ===========================
  // EFFECTS FOR AUTO-RESET
  // ===========================

  useEffect(() => {
    resetInvalidSubrace();
  }, [resetInvalidSubrace]);

  useEffect(() => {
    resetInvalidSubclass();
  }, [resetInvalidSubclass]);

  // ===========================
  // EFFECT FOR ERROR HANDLING
  // ===========================

  useEffect(() => {
    if (racesError || classesError) {
      setError("Erro ao carregar dados da API D&D. Usando dados locais.");
    }
  }, [racesError, classesError]);

  // ===========================
  // RETURN STATEMENT - CORREÇÃO PRINCIPAL AQUI
  // ===========================

  return {
    // State
    currentStep,
    totalSteps,
    steps,
    characterData,
    loading: loading || racesLoading || classesLoading || backgroundsLoading,
    error,

    // API Data (filtered)
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: backgroundsData,
    spells: filteredSpells,
    subraces: availableSubraces,
    subclasses: availableSubclasses,

    // Search
    ...searchHandlers,

    // Navigation
    nextStep,
    previousStep,
    goToStep,

    // Data management
    updateCharacterData,
    resetCharacter,

    // Validation
    validateCurrentStep,
    canProceed,

    // Finalization
    createCharacter,

    // Utilities
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,

    // Subraces functions
    getAvailableSubraces: () => availableSubraces,
    
    // ===========================
    // CORREÇÃO PRINCIPAL: getCombinedAbilityBonuses retorna array ao invés de objeto
    // ===========================
    getCombinedAbilityBonuses: () => {
      const bonusArray = [];
      
      // Add race bonuses
      if (characterData.selectedRace) {
        characterData.selectedRace.ability_bonuses.forEach((bonus) => {
          bonusArray.push(bonus);
        });
      }

      // Add subrace bonuses
      if (characterData.selectedSubrace) {
        characterData.selectedSubrace.ability_bonuses.forEach((bonus) => {
          bonusArray.push(bonus);
        });
      }

      return bonusArray;
    },
    
    getSubraceAbilityBonuses: () => 
      characterData.selectedSubrace ? characterData.selectedSubrace.ability_bonuses : [],

    // Subclasses functions
    getAvailableSubclasses: () => availableSubclasses,
    getSubclassFeatures: (level?: number) => {
      if (!characterData.selectedSubclass) {
        return [];
      }
      
      if (!characterData.selectedSubclass.subclass_levels || 
          !Array.isArray(characterData.selectedSubclass.subclass_levels)) {
        console.warn('subclass_levels is not a valid array:', characterData.selectedSubclass.subclass_levels);
        return [];
      }
      
      const targetLevel = level || characterData.level;
      const features: DndApiReference[] = [];
      
      characterData.selectedSubclass.subclass_levels.forEach(levelData => {
        if (levelData && typeof levelData.level === 'number' && levelData.level <= targetLevel) {
          if (levelData.features && Array.isArray(levelData.features)) {
            features.push(...levelData.features);
          }
        }
      });
      
      return features;
    },

    // Loading states
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingSpells: spellsLoading,
    isLoadingSubraces: false,
    isLoadingSubclasses: subclassesLoading,
  };
};

// ===========================
// PROVIDER COMPONENTS
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
}

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationProviderInner>
        {children}
      </CharacterCreationProviderInner>
    </QueryClientProvider>
  );
};

const CharacterCreationProviderInner: React.FC<CharacterCreationProviderProps> = ({ children }) => {
  const characterCreation = useCharacterCreation();

  return (
    <CharacterCreationContext.Provider value={characterCreation}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

// ===========================
// CONTEXT HOOK
// ===========================

export const useCharacterCreationContext = (): CharacterCreationContextType => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error(
      "useCharacterCreationContext deve ser usado dentro de um CharacterCreationProvider"
    );
  }
  return context;
};

export default useCharacterCreation;