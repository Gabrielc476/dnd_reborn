// ===========================
// MOCK SPELLS DATA - COMPLETE SRD
// ===========================

import { DndSpell } from "@/types/characterCreation";

export const mockSpells: DndSpell[] = [
  // ===========================
  // TRUQUES (CANTRIPS) - NÍVEL 0
  // ===========================
  {
    index: "acid-splash",
    name: "Borrifo Ácido",
    desc: ["Você arremessa uma bolha de ácido. Escolha uma criatura dentro do alcance, ou escolha duas criaturas dentro do alcance que estejam a 1,5 metro uma da outra. Um alvo deve ter sucesso em um teste de resistência de Destreza ou sofrer 1d6 de dano ácido."],
    higher_level: ["O dano desta magia aumenta em 1d6 quando você atinge o 5º nível (2d6), 11º nível (3d6) e 17º nível (4d6)."],
    range: "18 metros",
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
      damage_at_slot_level: { "1": "1d6" }
    },
    school: { index: "conjuration", name: "Conjuração", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/acid-splash",
  },

  {
    index: "dancing-lights",
    name: "Luzes Dançantes",
    desc: ["Você cria até quatro luzes do tamanho de tochas dentro do alcance, fazendo-as aparecer como tochas, lanternas ou orbes brilhantes que flutuam no ar pela duração. Você também pode combiná-las em uma forma vagamente humanoide de tamanho Médio."],
    higher_level: [],
    range: "36 metros",
    components: ["V", "S", "M"],
    material: "um pouco de fósforo ou vaga-lume",
    ritual: false,
    duration: "Concentração, até 1 minuto",
    concentration: true,
    casting_time: "1 ação",
    level: 0,
    attack_type: "none",
    damage: undefined,
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/dancing-lights",
  },

  {
    index: "fire-bolt",
    name: "Rajada de Fogo",
    desc: ["Você arremessa um feixe crepitante de energia em direção a uma criatura ou objeto dentro do alcance. Faça um ataque de magia à distância contra o alvo. Se acertar, o alvo sofre 1d10 de dano de fogo. Um objeto inflamável atingido por esta magia se incendeia se não estiver sendo vestido ou carregado."],
    higher_level: ["O dano desta magia aumenta em 1d10 quando você atinge o 5º nível (2d10), 11º nível (3d10) e 17º nível (4d10)."],
    range: "36 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 0,
    attack_type: "ranged",
    damage: {
      damage_type: { index: "fire", name: "Fogo", url: "" },
      damage_at_slot_level: { "1": "1d10" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/fire-bolt",
  },

  {
    index: "mage-hand",
    name: "Mão do Mago",
    desc: ["Uma mão espectral flutuante aparece em um ponto que você escolher dentro do alcance. A mão permanece pela duração ou até você a dispensar como uma ação. A mão desaparece se ela estiver a mais de 9 metros de você ou se você conjurar esta magia novamente."],
    higher_level: [],
    range: "9 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "1 minuto",
    concentration: false,
    casting_time: "1 ação",
    level: 0,
    attack_type: "none",
    damage: undefined,
    school: { index: "conjuration", name: "Conjuração", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/mage-hand",
  },

  {
    index: "minor-illusion",
    name: "Ilusão Menor",
    desc: ["Você cria um som ou uma imagem de um objeto dentro do alcance que dura pela duração. A ilusão também termina se você a dispensar como uma ação ou conjurar esta magia novamente."],
    higher_level: [],
    range: "9 metros",
    components: ["S", "M"],
    material: "um pouco de lã de carneiro",
    ritual: false,
    duration: "1 minuto",
    concentration: false,
    casting_time: "1 ação",
    level: 0,
    attack_type: "none",
    damage: undefined,
    school: { index: "illusion", name: "Ilusão", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/minor-illusion",
  },

  {
    index: "prestidigitation",
    name: "Prestidigitação",
    desc: ["Esta magia é um truque mágico menor que conjuradores novatos usam para praticar. Você cria um dos seguintes efeitos mágicos dentro do alcance: você instantaneamente acende ou apaga uma vela, tocha ou pequena fogueira; você instantaneamente limpa ou suja um objeto não maior que 30 centímetros cúbicos; você esfria, aquece ou adiciona sabor a até 30 centímetros cúbicos de material não-vivo por 1 hora; você faz uma cor, uma pequena marca ou símbolo aparecer em um objeto ou superfície por 1 hora; você cria uma bugiganga não-mágica ou uma imagem ilusória que pode caber na sua mão e que dura até o final do seu próximo turno."],
    higher_level: [],
    range: "3 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Até 1 hora",
    concentration: false,
    casting_time: "1 ação",
    level: 0,
    attack_type: "none",
    damage: undefined,
    school: { index: "transmutation", name: "Transmutação", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/prestidigitation",
  },

  {
    index: "ray-of-frost",
    name: "Raio de Gelo",
    desc: ["Um raio glacial de luz azul-esbranquiçada sai em direção a uma criatura dentro do alcance. Faça um ataque de magia à distância contra o alvo. Se acertar, ele sofre 1d8 de dano de frio e sua velocidade é reduzida em 3 metros até o final do seu próximo turno."],
    higher_level: ["O dano desta magia aumenta em 1d8 quando você atinge o 5º nível (2d8), 11º nível (3d8) e 17º nível (4d8)."],
    range: "18 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 0,
    attack_type: "ranged",
    damage: {
      damage_type: { index: "cold", name: "Frio", url: "" },
      damage_at_slot_level: { "1": "1d8" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/ray-of-frost",
  },

  // ===========================
  // MAGIAS DE 1º NÍVEL
  // ===========================
  {
    index: "burning-hands",
    name: "Mãos Flamejantes",
    desc: ["Enquanto você mantém suas mãos com os polegares se tocando e os dedos espalhados, uma fina camada de chamas se espalha de seus dedos estendidos. Cada criatura em um cone de 4,5 metros deve fazer um teste de resistência de Destreza. Uma criatura sofre 3d6 de dano de fogo em um fracasso, ou metade desse dano em um sucesso."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 2º nível ou superior, o dano aumenta em 1d6 para cada nível de espaço acima do 1º."],
    range: "Pessoal (cone de 4,5 metros)",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 1,
    attack_type: "save",
    damage: {
      damage_type: { index: "fire", name: "Fogo", url: "" },
      damage_at_slot_level: { "1": "3d6", "2": "4d6", "3": "5d6", "4": "6d6", "5": "7d6" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/burning-hands",
  },

  {
    index: "cure-wounds",
    name: "Curar Ferimentos",
    desc: ["Uma criatura que você tocar recupera um número de pontos de vida igual a 1d8 + seu modificador de habilidade de conjuração. Esta magia não afeta mortos-vivos ou constructos."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 2º nível ou superior, a cura aumenta em 1d8 para cada nível de espaço acima do 1º."],
    range: "Toque",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 1,
    attack_type: "none",
    damage: {
      damage_type: { index: "healing", name: "Cura", url: "" },
      damage_at_slot_level: { "1": "1d8", "2": "2d8", "3": "3d8", "4": "4d8", "5": "5d8" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "cleric", name: "Clérico", url: "" },
      { index: "druid", name: "Druida", url: "" },
      { index: "paladin", name: "Paladino", url: "" },
      { index: "ranger", name: "Patrulheiro", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/cure-wounds",
  },

  {
    index: "magic-missile",
    name: "Míssil Mágico",
    desc: ["Você cria três dardos brilhantes de força mágica. Cada dardo atinge uma criatura de sua escolha que você possa ver dentro do alcance. Um dardo causa 1d4 + 1 de dano de força ao seu alvo. Os dardos atingem simultaneamente e você pode direcioná-los para uma criatura ou várias."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 2º nível ou superior, a magia cria um dardo a mais para cada nível de espaço acima do 1º."],
    range: "36 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 1,
    attack_type: "ranged",
    damage: {
      damage_type: { index: "force", name: "Força", url: "" },
      damage_at_slot_level: { "1": "3 * (1d4 + 1)", "2": "4 * (1d4 + 1)", "3": "5 * (1d4 + 1)" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/magic-missile",
  },

  {
    index: "shield",
    name: "Escudo",
    desc: ["Uma barreira invisível de força mágica aparece e protege você. Até o início do seu próximo turno, você tem um bônus de +5 na CA, incluindo contra o ataque desencadeador, e você não sofre dano de míssil mágico."],
    higher_level: [],
    range: "Pessoal",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "1 rodada",
    concentration: false,
    casting_time: "1 reação",
    level: 1,
    attack_type: "none",
    damage: undefined,
    school: { index: "abjuration", name: "Abjuração", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/shield",
  },

  {
    index: "healing-word",
    name: "Palavra de Cura",
    desc: ["Uma criatura de sua escolha que você possa ver dentro do alcance recupera pontos de vida iguais a 1d4 + seu modificador de habilidade de conjuração. Esta magia não afeta mortos-vivos ou constructos."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 2º nível ou superior, a cura aumenta em 1d4 para cada nível de espaço acima do 1º."],
    range: "18 metros",
    components: ["V"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação bônus",
    level: 1,
    attack_type: "none",
    damage: {
      damage_type: { index: "healing", name: "Cura", url: "" },
      damage_at_slot_level: { "1": "1d4", "2": "2d4", "3": "3d4", "4": "4d4", "5": "5d4" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "cleric", name: "Clérico", url: "" },
      { index: "druid", name: "Druida", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/healing-word",
  },

  // ===========================
  // MAGIAS DE 2º NÍVEL
  // ===========================
  {
    index: "scorching-ray",
    name: "Raio Ardente",
    desc: ["Você cria três raios de fogo e os arremessa em alvos dentro do alcance. Você pode direcioná-los contra um alvo ou vários. Faça um ataque de magia à distância para cada raio. Se acertar, o alvo sofre 2d6 de dano de fogo."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 3º nível ou superior, você cria um raio adicional para cada nível de espaço acima do 2º."],
    range: "36 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 2,
    attack_type: "ranged",
    damage: {
      damage_type: { index: "fire", name: "Fogo", url: "" },
      damage_at_slot_level: { "2": "3 * 2d6", "3": "4 * 2d6", "4": "5 * 2d6" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/scorching-ray",
  },

  {
    index: "misty-step",
    name: "Passo Sombrio",
    desc: ["Brevemente cercado por névoa prateada, você se teleporta até 9 metros para um espaço desocupado que você possa ver."],
    higher_level: [],
    range: "Pessoal",
    components: ["V"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação bônus",
    level: 2,
    attack_type: "none",
    damage: undefined,
    school: { index: "conjuration", name: "Conjuração", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/misty-step",
  },

  // ===========================
  // MAGIAS DE 3º NÍVEL
  // ===========================
  {
    index: "fireball",
    name: "Bola de Fogo",
    desc: ["Um raio brilhante lampeja de seu dedo apontado para um ponto que você escolher dentro do alcance e então explode com um rugido baixo em uma explosão de chama. Cada criatura em uma esfera de 6 metros de raio centrada naquele ponto deve fazer um teste de resistência de Destreza. Um alvo sofre 8d6 de dano de fogo em um fracasso, ou metade desse dano em um sucesso."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 4º nível ou superior, o dano aumenta em 1d6 para cada nível de espaço acima do 3º."],
    range: "45 metros",
    components: ["V", "S", "M"],
    material: "uma pequena esfera de guano de morcego e enxofre",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 3,
    attack_type: "save",
    damage: {
      damage_type: { index: "fire", name: "Fogo", url: "" },
      damage_at_slot_level: { "3": "8d6", "4": "9d6", "5": "10d6", "6": "11d6" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/fireball",
  },

  {
    index: "lightning-bolt",
    name: "Raio",
    desc: ["Um golpe de relâmpago formando uma linha de 30 metros de comprimento e 1,5 metro de largura explode de você em uma direção que você escolher. Cada criatura na linha deve fazer um teste de resistência de Destreza. Uma criatura sofre 8d6 de dano elétrico em um fracasso, ou metade desse dano em um sucesso."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 4º nível ou superior, o dano aumenta em 1d6 para cada nível de espaço acima do 3º."],
    range: "Pessoal (linha de 30 metros)",
    components: ["V", "S", "M"],
    material: "um pouco de pelo e uma vara de âmbar, cristal ou vidro",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 3,
    attack_type: "save",
    damage: {
      damage_type: { index: "lightning", name: "Elétrico", url: "" },
      damage_at_slot_level: { "3": "8d6", "4": "9d6", "5": "10d6", "6": "11d6" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/lightning-bolt",
  },

  // ===========================
  // MAGIAS DE 4º NÍVEL
  // ===========================
  {
    index: "greater-invisibility",
    name: "Invisibilidade Maior",
    desc: ["Você ou uma criatura que você toca se torna invisível até a magia acabar. Qualquer coisa que o alvo esteja vestindo ou carregando fica invisível enquanto estiver na pessoa do alvo."],
    higher_level: [],
    range: "Toque",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Concentração, até 1 minuto",
    concentration: true,
    casting_time: "1 ação",
    level: 4,
    attack_type: "none",
    damage: undefined,
    school: { index: "illusion", name: "Ilusão", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/greater-invisibility",
  },

  // ===========================
  // MAGIAS DE 5º NÍVEL
  // ===========================
  {
    index: "cone-of-cold",
    name: "Cone de Frio",
    desc: ["Uma rajada de ar frio irrompe de suas mãos. Cada criatura em um cone de 18 metros deve fazer um teste de resistência de Constituição. Uma criatura sofre 8d8 de dano de frio em um fracasso, ou metade desse dano em um sucesso."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 6º nível ou superior, o dano aumenta em 1d8 para cada nível de espaço acima do 5º."],
    range: "Pessoal (cone de 18 metros)",
    components: ["V", "S", "M"],
    material: "um pequeno cone de cristal ou vidro",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 5,
    attack_type: "save",
    damage: {
      damage_type: { index: "cold", name: "Frio", url: "" },
      damage_at_slot_level: { "5": "8d8", "6": "9d8", "7": "10d8", "8": "11d8", "9": "12d8" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/cone-of-cold",
  },

  // ===========================
  // MAGIAS DE 6º NÍVEL
  // ===========================
  {
    index: "disintegrate",
    name: "Desintegrar",
    desc: ["Um fino raio verde sai da ponta do seu dedo em direção a um alvo que você possa ver dentro do alcance. O alvo pode ser uma criatura, um objeto ou uma criação de força mágica, como a parede criada por muralha de força."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 7º nível ou superior, o dano aumenta em 3d6 para cada nível de espaço acima do 6º."],
    range: "18 metros",
    components: ["V", "S", "M"],
    material: "um ímã e um punhado de poeira",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 6,
    attack_type: "ranged",
    damage: {
      damage_type: { index: "force", name: "Força", url: "" },
      damage_at_slot_level: { "6": "10d6 + 40", "7": "13d6 + 40", "8": "16d6 + 40", "9": "19d6 + 40" }
    },
    school: { index: "transmutation", name: "Transmutação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/disintegrate",
  },

  // ===========================
  // MAGIAS DE 7º NÍVEL
  // ===========================
  {
    index: "finger-of-death",
    name: "Dedo da Morte",
    desc: ["Você envia energia negativa ondulando em direção a uma criatura que você possa ver dentro do alcance, causando-lhe uma dor lancinante. O alvo deve fazer um teste de resistência de Constituição. Ele sofre 7d8 + 30 de dano necrótico em um fracasso, ou metade desse dano em um sucesso."],
    higher_level: ["Quando você conjura esta magia usando um espaço de magia de 8º nível ou superior, o dano aumenta em 1d8 para cada nível de espaço acima do 7º."],
    range: "18 metros",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 7,
    attack_type: "save",
    damage: {
      damage_type: { index: "necrotic", name: "Necrótico", url: "" },
      damage_at_slot_level: { "7": "7d8 + 30", "8": "8d8 + 30", "9": "9d8 + 30" }
    },
    school: { index: "necromancy", name: "Necromancia", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/finger-of-death",
  },

  // ===========================
  // MAGIAS DE 8º NÍVEL
  // ===========================
  {
    index: "power-word-stun",
    name: "Palavra de Poder: Atordoar",
    desc: ["Você fala uma palavra de poder que pode subjugar a mente de uma criatura que você possa ver dentro do alcance, deixando-a estupefata. Se o alvo tiver 150 pontos de vida ou menos, ele fica atordoado. Caso contrário, a magia não o afeta."],
    higher_level: [],
    range: "18 metros",
    components: ["V"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 8,
    attack_type: "none",
    damage: undefined,
    school: { index: "enchantment", name: "Encantamento", url: "" },
    classes: [
      { index: "bard", name: "Bardo", url: "" },
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "warlock", name: "Bruxo", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/power-word-stun",
  },

  // ===========================
  // MAGIAS DE 9º NÍVEL
  // ===========================
  {
    index: "meteor-swarm",
    name: "Enxame de Meteoros",
    desc: ["Orbes flamejantes se chocam no solo em quatro pontos diferentes que você possa ver dentro do alcance. Cada criatura em uma esfera de 12 metros de raio centrada em cada ponto que você escolher deve fazer um teste de resistência de Destreza. A esfera se espalha ao redor de esquinas."],
    higher_level: [],
    range: "1,6 km",
    components: ["V", "S"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 9,
    attack_type: "save",
    damage: {
      damage_type: { index: "fire", name: "Fogo", url: "" },
      damage_at_slot_level: { "9": "20d6 fogo + 20d6 concussão" }
    },
    school: { index: "evocation", name: "Evocação", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/meteor-swarm",
  },

  {
    index: "wish",
    name: "Desejo",
    desc: ["Desejo é a mais poderosa magia que um mortal pode conjurar. Simplesmente falando em voz alta, você pode alterar os próprios fundamentos da realidade de acordo com seus desejos."],
    higher_level: [],
    range: "Pessoal",
    components: ["V"],
    material: "",
    ritual: false,
    duration: "Instantâneo",
    concentration: false,
    casting_time: "1 ação",
    level: 9,
    attack_type: "none",
    damage: undefined,
    school: { index: "conjuration", name: "Conjuração", url: "" },
    classes: [
      { index: "sorcerer", name: "Feiticeiro", url: "" },
      { index: "wizard", name: "Mago", url: "" }
    ],
    subclasses: [],
    url: "/api/spells/wish",
  },
];