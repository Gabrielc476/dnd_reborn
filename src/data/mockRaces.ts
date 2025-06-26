// ===========================
// MOCK RACES DATA - COMPLETE SRD
// ===========================

import { DndRace } from "@/types/characterCreation";

export const mockRaces: DndRace[] = [
  // HUMANO
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
    alignment: "Humanos tendem para nenhum alinhamento em particular. Os melhores e os piores são encontrados entre eles.",
    age: "Os humanos atingem a idade adulta no final da adolescência e vivem menos de um século.",
    size: "Medium",
    size_description: "Os humanos variam amplamente em altura e constituição, desde pouco mais de 1,50 metro até bem mais de 1,80 metro. Independentemente da sua posição nessa faixa, o seu tamanho é Médio.",
    starting_proficiencies: [
      { index: "skill-one", name: "Uma perícia à sua escolha", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e um idioma extra à sua escolha.",
    traits: [
      { index: "extra-language", name: "Idioma Extra", url: "" },
      { index: "extra-skill", name: "Perícia Extra", url: "" }
    ],
    subraces: [],
    url: "/api/races/human",
  },

  // ELFO
  {
    index: "elf",
    name: "Elfo",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
    ],
    alignment: "Os elfos amam a liberdade, a variedade e a auto expressão, por isso eles se inclinam fortemente para os aspectos mais gentis do caos.",
    age: "Embora os elfos atinjam a maturidade física na mesma idade que os humanos, a compreensão élfica da idade adulta vai além do crescimento físico para abranger a experiência mundana. Um elfo normalmente declara a idade adulta e um nome adulto por volta dos 100 anos e pode viver até 750 anos.",
    size: "Medium",
    size_description: "Os elfos variam de menos de 1,50 metro a mais de 1,80 metro e têm constituições esguias. Seu tamanho é Médio.",
    starting_proficiencies: [
      { index: "perception", name: "Percepção", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Élfico.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "keen-senses", name: "Sentidos Aguçados", url: "" },
      { index: "fey-ancestry", name: "Ancestralidade Feérica", url: "" },
      { index: "trance", name: "Transe", url: "" }
    ],
    subraces: [
      { index: "high-elf", name: "Alto Elfo", url: "/api/subraces/high-elf" },
      { index: "wood-elf", name: "Elfo da Floresta", url: "/api/subraces/wood-elf" },
      { index: "dark-elf", name: "Elfo Sombrio (Drow)", url: "/api/subraces/dark-elf" }
    ],
    url: "/api/races/elf",
  },

  // ANÃO
  {
    index: "dwarf",
    name: "Anão",
    speed: 25,
    ability_bonuses: [
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 2 },
    ],
    alignment: "A maioria dos anões é leal, acreditando firmemente nos benefícios de uma sociedade bem ordenada.",
    age: "Os anões amadurecem na mesma taxa que os humanos, mas são considerados jovens até a idade de 50 anos. Em média, eles vivem cerca de 350 anos.",
    size: "Medium",
    size_description: "Os anões têm entre 1,20 e 1,50 metro de altura e pesam em média 70 quilos. Seu tamanho é Médio.",
    starting_proficiencies: [
      { index: "battleaxes", name: "Machados de Batalha", url: "" },
      { index: "handaxes", name: "Machadinhas", url: "" },
      { index: "light-hammers", name: "Martelos Leves", url: "" },
      { index: "warhammers", name: "Martelos de Guerra", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "dwarvish", name: "Anão", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Anão.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "dwarven-resilience", name: "Resistência Anã", url: "" },
      { index: "dwarven-combat-training", name: "Treinamento Anão em Combate", url: "" },
      { index: "tool-proficiency", name: "Proficiência com Ferramentas", url: "" },
      { index: "stonecunning", name: "Especialização em Rochas", url: "" }
    ],
    subraces: [
      { index: "hill-dwarf", name: "Anão da Colina", url: "/api/subraces/hill-dwarf" },
      { index: "mountain-dwarf", name: "Anão da Montanha", url: "/api/subraces/mountain-dwarf" }
    ],
    url: "/api/races/dwarf",
  },

  // HALFLING
  {
    index: "halfling",
    name: "Halfling",
    speed: 25,
    ability_bonuses: [
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
    ],
    alignment: "A maioria dos halflings é leal e bondosa. Como regra, eles são bondosos e não desejam mal aos outros.",
    age: "Um halfling atinge a idade adulta aos 20 anos e geralmente vive até a metade do segundo século.",
    size: "Small",
    size_description: "Os halflings têm em média 90 centímetros de altura e pesam cerca de 20 quilos. Seu tamanho é Pequeno.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "halfling", name: "Halfling", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Halfling.",
    traits: [
      { index: "lucky", name: "Sortudo", url: "" },
      { index: "brave", name: "Corajoso", url: "" },
      { index: "halfling-nimbleness", name: "Agilidade Halfling", url: "" }
    ],
    subraces: [
      { index: "lightfoot-halfling", name: "Halfling Pés Leves", url: "/api/subraces/lightfoot-halfling" },
      { index: "stout-halfling", name: "Halfling Robusto", url: "/api/subraces/stout-halfling" }
    ],
    url: "/api/races/halfling",
  },

  // DRACONATO
  {
    index: "dragonborn",
    name: "Draconato",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
    ],
    alignment: "Os draconatos tendem aos extremos, tomando uma escolha consciente para um lado ou outro na guerra cósmica entre o bem e o mal.",
    age: "Os draconatos jovens crescem rapidamente. Eles andam horas após a eclosão, atingem o tamanho e desenvolvimento de uma criança humana de 10 anos aos 3 anos, e atingem a idade adulta aos 15. Eles vivem cerca de 80 anos.",
    size: "Medium",
    size_description: "Os draconatos são mais altos e mais pesados que os humanos, medindo mais de 1,80 metro de altura e pesando em média 125 quilos. Seu tamanho é Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "draconic", name: "Dracônico", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Dracônico.",
    traits: [
      { index: "draconic-ancestry", name: "Ancestralidade Dracônica", url: "" },
      { index: "breath-weapon", name: "Arma de Sopro", url: "" },
      { index: "damage-resistance", name: "Resistência a Dano", url: "" }
    ],
    subraces: [],
    url: "/api/races/dragonborn",
  },

  // GNOMO
  {
    index: "gnome",
    name: "Gnomo",
    speed: 25,
    ability_bonuses: [
      { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 2 },
    ],
    alignment: "Os gnomos são mais frequentemente bondosos. Aqueles que tendem para a lei são sábios, engenheiros, pesquisadores, acadêmicos, investigadores ou inventores.",
    age: "Os gnomos amadurecem na mesma taxa que os humanos, e espera-se que a maioria se estabeleça em uma vida adulta por volta dos 40 anos. Eles podem viver de 350 a quase 500 anos.",
    size: "Small",
    size_description: "Os gnomos têm entre 90 centímetros e 1,20 metro de altura e pesam em média entre 18 e 20 quilos. Seu tamanho é Pequeno.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "gnomish", name: "Gnômico", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Gnômico.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "gnome-cunning", name: "Esperteza Gnômica", url: "" }
    ],
    subraces: [
      { index: "forest-gnome", name: "Gnomo da Floresta", url: "/api/subraces/forest-gnome" },
      { index: "rock-gnome", name: "Gnomo da Rocha", url: "/api/subraces/rock-gnome" }
    ],
    url: "/api/races/gnome",
  },

  // MEIO-ELFO
  {
    index: "half-elf",
    name: "Meio-elfo",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 2 },
    ],
    alignment: "Os meio-elfos compartilham a natureza caótica de sua herança élfica. Eles valorizam tanto a liberdade pessoal quanto a expressão criativa.",
    age: "Os meio-elfos amadurecem na mesma taxa que os humanos e atingem a idade adulta por volta dos 20 anos. Eles vivem muito mais tempo que os humanos, no entanto, muitas vezes ultrapassando os 180 anos.",
    size: "Medium",
    size_description: "Os meio-elfos têm aproximadamente o mesmo tamanho que os humanos, variando de 1,50 metro a mais de 1,80 metro de altura. Seu tamanho é Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum, Élfico e um idioma extra à sua escolha.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "fey-ancestry", name: "Ancestralidade Feérica", url: "" },
      { index: "skill-versatility", name: "Versatilidade em Perícias", url: "" }
    ],
    subraces: [],
    url: "/api/races/half-elf",
  },

  // MEIO-ORC
  {
    index: "half-orc",
    name: "Meio-orc",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
    ],
    alignment: "Os meio-orcs herdam uma tendência ao caos de seus ancestrais orcs e não são fortemente inclinados ao bem. Meio-orcs criados entre orcs e dispostos a viver suas vidas entre eles são geralmente malignos.",
    age: "Os meio-orcs amadurecem um pouco mais rápido que os humanos, atingindo a idade adulta por volta dos 14 anos. Eles envelhecem visivelmente mais rápido e raramente vivem mais de 75 anos.",
    size: "Medium",
    size_description: "Os meio-orcs são um pouco maiores e mais volumosos que os humanos, e variam de 1,50 metro a bem mais de 1,80 metro de altura. Seu tamanho é Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "orc", name: "Orc", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Orc.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "relentless-endurance", name: "Resistência Implacável", url: "" },
      { index: "savage-attacks", name: "Ataques Selvagens", url: "" }
    ],
    subraces: [],
    url: "/api/races/half-orc",
  },

  // TIEFLING
  {
    index: "tiefling",
    name: "Tiefling",
    speed: 30,
    ability_bonuses: [
      { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 2 },
    ],
    alignment: "Os tieflings podem não ter uma tendência inerente ao mal, mas muitos deles acabam lá. Mal ou não, uma natureza independente inclina muitos tieflings em direção a um alinhamento caótico.",
    age: "Os tieflings amadurecem na mesma taxa que os humanos, mas vivem alguns anos a mais.",
    size: "Medium",
    size_description: "Os tieflings têm aproximadamente o mesmo tamanho e constituição que os humanos. Seu tamanho é Médio.",
    starting_proficiencies: [],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "infernal", name: "Infernal", url: "" }
    ],
    language_desc: "Você pode falar, ler e escrever Comum e Infernal.",
    traits: [
      { index: "darkvision", name: "Visão no Escuro", url: "" },
      { index: "hellish-resistance", name: "Resistência Infernal", url: "" },
      { index: "infernal-legacy", name: "Legado Infernal", url: "" }
    ],
    subraces: [],
    url: "/api/races/tiefling",
  },
];