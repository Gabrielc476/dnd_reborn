// ===========================
// MOCK SUBRACES DATA
// ===========================

import { DndSubrace } from "@/types/characterCreation";

export const mockSubraces: DndSubrace[] = [
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
  {
    index: "dark-elf",
    name: "Elfo Sombrio",
    race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
    desc: "Elfos sombrios habitam o subterrâneo",
    ability_bonuses: [
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [],
    url: "/api/subraces/dark-elf",
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
    desc: "Halflings robustos são resistentes e corajosos",
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
    desc: "Gnomos da floresta são tímidos e furtivos",
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
    name: "Gnomo da Rocha",
    race: { index: "gnome", name: "Gnomo", url: "/api/races/gnome" },
    desc: "Gnomos da rocha são inventivos e criativos",
    ability_bonuses: [
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [],
    url: "/api/subraces/rock-gnome",
  },
];