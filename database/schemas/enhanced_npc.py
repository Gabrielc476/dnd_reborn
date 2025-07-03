# ===========================
# SCHEMAS ATUALIZADOS PARA NPCs COM SISTEMA DE DADOS
# database/schemas/enhanced_npc.py
# ===========================

from pydantic import BaseModel, Field, ConfigDict, validator
from bson import ObjectId
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


# ===========================
# ENUMS E TIPOS BÁSICOS
# ===========================

class NPCType(str, Enum):
    """Tipos de NPC"""
    ALLY = "aliado"
    NEUTRAL = "neutro"
    ENEMY = "inimigo"
    MERCHANT = "mercador"
    QUEST_GIVER = "missões"
    BACKGROUND = "cenário"


class NPCSize(str, Enum):
    """Tamanhos de criaturas D&D 5e"""
    TINY = "Minúsculo"
    SMALL = "Pequeno"
    MEDIUM = "Médio"
    LARGE = "Grande"
    HUGE = "Enorme"
    GARGANTUAN = "Colossal"


class NPCCreatureType(str, Enum):
    """Tipos de criaturas D&D 5e"""
    ABERRATION = "Aberração"
    BEAST = "Besta"
    CELESTIAL = "Celestial"
    CONSTRUCT = "Constructo"
    DRAGON = "Dragão"
    ELEMENTAL = "Elemental"
    FEY = "Feérico"
    FIEND = "Demônio"
    GIANT = "Gigante"
    HUMANOID = "Humanoide"
    MONSTROSITY = "Monstrosidade"
    OOZE = "Gosma"
    PLANT = "Planta"
    UNDEAD = "Morto-vivo"


class DamageType(str, Enum):
    """Tipos de dano D&D 5e"""
    ACID = "ácido"
    BLUDGEONING = "contundente"
    COLD = "frio"
    FIRE = "fogo"
    FORCE = "força"
    LIGHTNING = "elétrico"
    NECROTIC = "necrótico"
    PIERCING = "perfurante"
    POISON = "venenoso"
    PSYCHIC = "psíquico"
    RADIANT = "radiante"
    SLASHING = "cortante"
    THUNDER = "sônico"


class SpellSchool(str, Enum):
    """Escolas de magia D&D 5e"""
    ABJURATION = "Abjuração"
    CONJURATION = "Conjuração"
    DIVINATION = "Adivinhação"
    ENCHANTMENT = "Encantamento"
    EVOCATION = "Evocação"
    ILLUSION = "Ilusão"
    NECROMANCY = "Necromancia"
    TRANSMUTATION = "Transmutação"


class AbilityScore(str, Enum):
    """Atributos básicos D&D 5e"""
    STRENGTH = "strength"
    DEXTERITY = "dexterity"
    CONSTITUTION = "constitution"
    INTELLIGENCE = "intelligence"
    WISDOM = "wisdom"
    CHARISMA = "charisma"


# ===========================
# MODELOS DE DADOS DE ROLAGEM
# ===========================

class DiceRoll(BaseModel):
    """Modelo para rolagens de dados"""
    dice_count: int = Field(..., ge=1, le=100, description="Quantidade de dados")
    dice_sides: int = Field(..., ge=2, le=100, description="Lados do dado")
    modifier: int = Field(default=0, ge=-50, le=50, description="Modificador")

    def __str__(self):
        if self.modifier == 0:
            return f"{self.dice_count}d{self.dice_sides}"
        elif self.modifier > 0:
            return f"{self.dice_count}d{self.dice_sides}+{self.modifier}"
        else:
            return f"{self.dice_count}d{self.dice_sides}{self.modifier}"

    @validator('dice_sides')
    def validate_dice_sides(cls, v):
        """Validar que os lados do dado são valores comuns"""
        common_dice = [2, 3, 4, 6, 8, 10, 12, 20, 100]
        if v not in common_dice:
            # Permitir outros valores mas emitir aviso
            pass
        return v


class RollResult(BaseModel):
    """Resultado de uma rolagem de dados"""
    total: int = Field(..., description="Resultado total")
    rolls: List[int] = Field(..., description="Valores individuais dos dados")
    modifier: int = Field(..., description="Modificador aplicado")
    formula: str = Field(..., description="Fórmula da rolagem")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    advantage: bool = Field(default=False)
    disadvantage: bool = Field(default=False)


# ===========================
# MODELOS DE ATRIBUTOS E ESTATÍSTICAS
# ===========================

class NPCAttributes(BaseModel):
    """Atributos básicos do NPC"""
    strength: int = Field(default=10, ge=1, le=30, description="Força")
    dexterity: int = Field(default=10, ge=1, le=30, description="Destreza")
    constitution: int = Field(default=10, ge=1, le=30, description="Constituição")
    intelligence: int = Field(default=10, ge=1, le=30, description="Inteligência")
    wisdom: int = Field(default=10, ge=1, le=30, description="Sabedoria")
    charisma: int = Field(default=10, ge=1, le=30, description="Carisma")

    @property
    def modifiers(self) -> Dict[str, int]:
        """Calcula modificadores de todos os atributos"""
        return {
            attr: self._calculate_modifier(getattr(self, attr))
            for attr in ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
        }

    @staticmethod
    def _calculate_modifier(score: int) -> int:
        """Calcula modificador de atributo"""
        return (score - 10) // 2


class NPCSkill(BaseModel):
    """Perícia individual do NPC"""
    name: str = Field(..., description="Nome da perícia")
    proficient: bool = Field(default=False, description="Se tem proficiência")
    expertise: bool = Field(default=False, description="Se tem especialização")
    modifier: int = Field(default=0, description="Modificador total calculado")


class NPCSavingThrow(BaseModel):
    """Teste de resistência do NPC"""
    ability: AbilityScore = Field(..., description="Atributo base")
    proficient: bool = Field(default=False, description="Se tem proficiência")
    modifier: int = Field(default=0, description="Modificador total calculado")


class NPCStats(BaseModel):
    """Estatísticas completas do NPC"""
    # Estatísticas de combate básicas
    armor_class: int = Field(default=10, ge=1, le=30, description="Classe de Armadura")
    hit_points: int = Field(default=1, ge=1, description="Pontos de Vida máximos")
    current_hit_points: Optional[int] = Field(None, description="Pontos de Vida atuais")
    temporary_hit_points: Optional[int] = Field(None, ge=0, description="Pontos de Vida temporários")
    speed: str = Field(default="30 ft", description="Velocidade")

    # Atributos básicos
    attributes: NPCAttributes = Field(default_factory=NPCAttributes)

    # Proficiências
    skills: List[NPCSkill] = Field(default_factory=list, description="Perícias")
    saving_throws: List[NPCSavingThrow] = Field(default_factory=list, description="Testes de resistência")

    # Resistências e imunidades
    damage_resistances: List[str] = Field(default_factory=list, description="Resistências a dano")
    damage_immunities: List[str] = Field(default_factory=list, description="Imunidades a dano")
    condition_immunities: List[str] = Field(default_factory=list, description="Imunidades a condições")

    # Sentidos e idiomas
    senses: List[str] = Field(default_factory=list, description="Sentidos especiais")
    languages: List[str] = Field(default_factory=list, description="Idiomas conhecidos")

    # Estatísticas derivadas (calculadas automaticamente)
    proficiency_bonus: Optional[int] = Field(None, description="Bônus de proficiência")
    passive_perception: Optional[int] = Field(None, description="Percepção passiva")
    initiative_modifier: Optional[int] = Field(None, description="Modificador de iniciativa")

    @property
    def effective_hit_points(self) -> int:
        """Pontos de vida efetivos (atual + temporários)"""
        current = self.current_hit_points or self.hit_points
        temporary = self.temporary_hit_points or 0
        return current + temporary


# ===========================
# MODELOS DE COMBATE
# ===========================

class Attack(BaseModel):
    """Ataque físico ou de arma"""
    id: Optional[str] = Field(None, description="ID único do ataque")
    name: str = Field(..., min_length=1, max_length=100, description="Nome do ataque")
    attack_bonus: int = Field(default=0, ge=-10, le=20, description="Bônus de ataque")
    damage: DiceRoll = Field(..., description="Dados de dano")
    damage_type: DamageType = Field(default=DamageType.SLASHING, description="Tipo de dano")
    range: str = Field(default="Corpo a corpo", description="Alcance do ataque")
    reach: Optional[int] = Field(None, ge=0, le=100, description="Alcance em pés")
    description: Optional[str] = Field(None, max_length=500, description="Descrição do ataque")

    # Propriedades especiais
    is_magical: bool = Field(default=False, description="Se é um ataque mágico")
    versatile_damage: Optional[DiceRoll] = Field(None, description="Dano versatil (duas mãos)")
    additional_effects: List[str] = Field(default_factory=list, description="Efeitos adicionais")

    @validator('id', pre=True, always=True)
    def generate_id(cls, v):
        """Gera ID único se não fornecido"""
        if v is None:
            return str(ObjectId())
        return v


class Spell(BaseModel):
    """Magia do NPC"""
    id: Optional[str] = Field(None, description="ID único da magia")
    name: str = Field(..., min_length=1, max_length=100, description="Nome da magia")
    level: int = Field(..., ge=0, le=9, description="Nível da magia (0 = truque)")
    school: SpellSchool = Field(default=SpellSchool.EVOCATION, description="Escola de magia")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição da magia")

    # Propriedades de conjuração
    casting_time: str = Field(default="1 ação", description="Tempo de conjuração")
    range: str = Field(default="Toque", description="Alcance da magia")
    components: str = Field(default="V, S", description="Componentes (V/S/M)")
    duration: str = Field(default="Instantâneo", description="Duração")
    concentration: bool = Field(default=False, description="Requer concentração")
    ritual: bool = Field(default=False, description="Pode ser conjurada como ritual")

    # Informações de ataque/dano (para magias ofensivas)
    is_attack_spell: bool = Field(default=False, description="Se é magia de ataque")
    attack_bonus: Optional[int] = Field(None, ge=-10, le=20, description="Bônus de ataque mágico")
    damage: Optional[DiceRoll] = Field(None, description="Dados de dano")
    damage_type: Optional[DamageType] = Field(None, description="Tipo de dano")

    # CD de resistência
    save_dc: Optional[int] = Field(None, ge=8, le=30, description="CD de resistência")
    save_ability: Optional[AbilityScore] = Field(None, description="Atributo para resistência")

    # Upcast (conjuração em nível superior)
    higher_level: Optional[str] = Field(None, description="Efeitos em níveis superiores")
    upcast_damage: Optional[DiceRoll] = Field(None, description="Dano adicional por nível")

    @validator('id', pre=True, always=True)
    def generate_id(cls, v):
        """Gera ID único se não fornecido"""
        if v is None:
            return str(ObjectId())
        return v

    @validator('save_dc', always=True)
    def validate_save_dc(cls, v, values):
        """Validar CD de resistência apenas para magias que precisam"""
        if values.get('is_attack_spell') and v is None and 'attack_bonus' not in values:
            # Se é magia de ataque mas não tem bônus de ataque, deve ter CD
            pass
        return v


# ===========================
# MODELOS DE SISTEMA DE CONJURAÇÃO
# ===========================

class SpellSlot(BaseModel):
    """Slot de magia por nível"""
    level: int = Field(..., ge=1, le=9, description="Nível do slot")
    max_slots: int = Field(..., ge=0, le=20, description="Slots máximos")
    current_slots: int = Field(..., ge=0, description="Slots atuais")

    @validator('current_slots')
    def validate_current_slots(cls, v, values):
        """Slots atuais não podem exceder máximo"""
        max_slots = values.get('max_slots', 0)
        if v > max_slots:
            return max_slots
        return v


class InnateSpellcasting(BaseModel):
    """Conjuração inata"""
    frequency: str = Field(..., description="Frequência (ex: '3/dia cada', 'à vontade')")
    spells: List[str] = Field(..., description="Lista de magias (nomes)")


class NPCSpellcasting(BaseModel):
    """Sistema completo de conjuração do NPC"""
    is_spellcaster: bool = Field(default=False, description="Se é conjurador")
    spellcasting_ability: Optional[AbilityScore] = Field(None, description="Atributo de conjuração")
    spell_save_dc: Optional[int] = Field(None, ge=8, le=30, description="CD de resistência das magias")
    spell_attack_bonus: Optional[int] = Field(None, ge=-10, le=20, description="Bônus de ataque mágico")
    caster_level: Optional[int] = Field(None, ge=1, le=20, description="Nível de conjurador")

    # Slots de magia por nível
    spell_slots: List[SpellSlot] = Field(default_factory=list, description="Slots de magia")

    # Magias conhecidas
    spells_known: List[Spell] = Field(default_factory=list, description="Magias conhecidas")
    cantrips_known: List[Spell] = Field(default_factory=list, description="Truques conhecidos")

    # Capacidades especiais
    ritual_casting: bool = Field(default=False, description="Pode conjurar rituais")
    innate_spellcasting: List[InnateSpellcasting] = Field(default_factory=list, description="Conjuração inata")

    @validator('spell_save_dc', always=True)
    def calculate_spell_save_dc(cls, v, values):
        """Calcula CD de magia automaticamente se não fornecida"""
        if v is None and values.get('is_spellcaster'):
            # Será calculado no backend baseado no atributo e CR
            return None
        return v

    @validator('spell_attack_bonus', always=True)
    def calculate_spell_attack_bonus(cls, v, values):
        """Calcula bônus de ataque mágico automaticamente se não fornecido"""
        if v is None and values.get('is_spellcaster'):
            # Será calculado no backend baseado no atributo e CR
            return None
        return v


# ===========================
# MODELOS DE HABILIDADES ESPECIAIS
# ===========================

class NPCAbility(BaseModel):
    """Habilidade especial do NPC"""
    id: Optional[str] = Field(None, description="ID único da habilidade")
    name: str = Field(..., min_length=1, max_length=100, description="Nome da habilidade")
    description: str = Field(..., min_length=1, max_length=1000, description="Descrição da habilidade")
    usage: Optional[str] = Field(None, description="Limitação de uso (ex: '1/dia', 'recarga 5-6')")
    usage_type: Optional[str] = Field(None, description="Tipo de limitação")
    max_uses: Optional[int] = Field(None, ge=0, description="Usos máximos")
    current_uses: Optional[int] = Field(None, ge=0, description="Usos atuais")
    recharge_on: Optional[List[int]] = Field(None, description="Valores de recarga (ex: [5, 6])")

    @validator('id', pre=True, always=True)
    def generate_id(cls, v):
        """Gera ID único se não fornecido"""
        if v is None:
            return str(ObjectId())
        return v

    @validator('current_uses')
    def validate_current_uses(cls, v, values):
        """Usos atuais não podem exceder máximo"""
        max_uses = values.get('max_uses')
        if max_uses is not None and v is not None and v > max_uses:
            return max_uses
        return v


class LegendaryAction(BaseModel):
    """Ação lendária"""
    name: str = Field(..., description="Nome da ação")
    cost: int = Field(default=1, ge=1, le=3, description="Custo em ações lendárias")
    description: str = Field(..., description="Descrição da ação")


class LairAction(BaseModel):
    """Ação de covil"""
    name: str = Field(..., description="Nome da ação")
    description: str = Field(..., description="Descrição da ação")
    initiative: int = Field(default=20, ge=0, le=30, description="Iniciativa da ação")


# ===========================
# MODELO PRINCIPAL DO NPC
# ===========================

class EnhancedNPC(BaseModel):
    """Modelo completo para NPCs com sistema de dados"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    id: Optional[ObjectId] = None
    campaign_id: ObjectId = Field(..., description="ID da campanha")

    # Informações básicas
    name: str = Field(..., min_length=2, max_length=100, description="Nome do NPC")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição física e comportamental")
    race: Optional[str] = Field(None, max_length=50, description="Raça")
    npc_class: Optional[str] = Field(None, alias="class", max_length=50, description="Classe")
    size: NPCSize = Field(default=NPCSize.MEDIUM, description="Tamanho")
    creature_type: NPCCreatureType = Field(default=NPCCreatureType.HUMANOID, description="Tipo de criatura")

    # Tipo e comportamento
    npc_type: NPCType = Field(default=NPCType.NEUTRAL, description="Tipo de NPC")
    alignment: Optional[str] = Field(None, max_length=30, description="Tendência")

    # Localização e contexto
    location: Optional[str] = Field(None, max_length=100, description="Localização")
    occupation: Optional[str] = Field(None, max_length=100, description="Ocupação")
    faction: Optional[str] = Field(None, max_length=100, description="Facção")

    # Estatísticas completas
    stats: NPCStats = Field(default_factory=NPCStats, description="Estatísticas do NPC")
    challenge_rating: Optional[str] = Field(None, description="Challenge Rating")
    experience_points: Optional[int] = Field(None, ge=0, description="Pontos de experiência dados")

    # Sistema de combate e magias
    attacks: List[Attack] = Field(default_factory=list, description="Ataques disponíveis")
    spellcasting: NPCSpellcasting = Field(default_factory=NPCSpellcasting, description="Sistema de conjuração")
    abilities: List[NPCAbility] = Field(default_factory=list, description="Habilidades especiais")

    # Capacidades lendárias e de covil
    legendary_actions: List[LegendaryAction] = Field(default_factory=list, description="Ações lendárias")
    legendary_actions_per_turn: int = Field(default=3, ge=0, le=5, description="Ações lendárias por turno")
    lair_actions: List[LairAction] = Field(default_factory=list, description="Ações de covil")

    # Relacionamentos
    relationships: Dict[str, str] = Field(default_factory=dict, description="Relacionamentos com outros NPCs/PCs")

    # Informações de roleplay
    personality_traits: List[str] = Field(default_factory=list, description="Traços de personalidade")
    ideals: List[str] = Field(default_factory=list, description="Ideais")
    bonds: List[str] = Field(default_factory=list, description="Vínculos")
    flaws: List[str] = Field(default_factory=list, description="Defeitos")
    goals: Optional[str] = Field(None, max_length=500, description="Objetivos")
    secrets: Optional[str] = Field(None, max_length=500, description="Segredos (apenas GM)")

    # Status de jogo
    is_alive: bool = Field(default=True, description="Se está vivo")
    is_active: bool = Field(default=True, description="Se está ativo na campanha")

    # Notas do mestre
    gm_notes: Optional[str] = Field(None, max_length=2000, description="Notas privadas do GM")

    # Representação visual
    avatar_url: Optional[str] = Field(None, description="URL da imagem do avatar")
    token_url: Optional[str] = Field(None, description="URL do token para mapa")

    # Configurações de exibição
    show_to_players: bool = Field(default=True, description="Se é visível aos jogadores")
    is_important: bool = Field(default=False, description="Se é um NPC importante")
    tags: List[str] = Field(default_factory=list, description="Tags para organização")

    # Metadados
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[ObjectId] = Field(None, description="ID do usuário que criou")

    def calculate_derived_stats(self):
        """Calcula estatísticas derivadas automaticamente"""
        # Calcular bônus de proficiência baseado no CR
        if self.challenge_rating:
            cr_value = self._parse_challenge_rating(self.challenge_rating)
            self.stats.proficiency_bonus = self._calculate_proficiency_bonus(cr_value)

        # Calcular modificador de iniciativa
        self.stats.initiative_modifier = self.stats.attributes.modifiers['dexterity']

        # Calcular percepção passiva
        wisdom_mod = self.stats.attributes.modifiers['wisdom']
        perception_skill = next((s for s in self.stats.skills if s.name.lower() == 'perception'), None)
        perception_bonus = perception_skill.modifier if perception_skill and perception_skill.proficient else 0
        self.stats.passive_perception = 10 + wisdom_mod + perception_bonus

        # Calcular estatísticas de conjuração se for conjurador
        if self.spellcasting.is_spellcaster and self.spellcasting.spellcasting_ability:
            ability_mod = self.stats.attributes.modifiers[self.spellcasting.spellcasting_ability.value]
            prof_bonus = self.stats.proficiency_bonus or 2

            if self.spellcasting.spell_save_dc is None:
                self.spellcasting.spell_save_dc = 8 + prof_bonus + ability_mod

            if self.spellcasting.spell_attack_bonus is None:
                self.spellcasting.spell_attack_bonus = prof_bonus + ability_mod

    @staticmethod
    def _parse_challenge_rating(cr: str) -> float:
        """Converte string de CR para valor numérico"""
        if cr == "0":
            return 0
        elif "/" in cr:
            numerator, denominator = cr.split("/")
            return float(numerator) / float(denominator)
        else:
            return float(cr)

    @staticmethod
    def _calculate_proficiency_bonus(cr: float) -> int:
        """Calcula bônus de proficiência baseado no CR"""
        if cr < 1:
            return 2
        elif cr < 5:
            return 2
        elif cr < 9:
            return 3
        elif cr < 13:
            return 4
        elif cr < 17:
            return 5
        elif cr < 21:
            return 6
        elif cr < 25:
            return 7
        elif cr < 29:
            return 8
        else:
            return 9


# ===========================
# SCHEMAS PARA API
# ===========================

class EnhancedNPCCreate(BaseModel):
    """Schema para criação de NPC"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    campaign_id: ObjectId
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    race: Optional[str] = Field(None, max_length=50)
    npc_class: Optional[str] = Field(None, alias="class", max_length=50)
    size: NPCSize = NPCSize.MEDIUM
    creature_type: NPCCreatureType = NPCCreatureType.HUMANOID
    npc_type: NPCType = NPCType.NEUTRAL
    alignment: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=100)
    occupation: Optional[str] = Field(None, max_length=100)
    faction: Optional[str] = Field(None, max_length=100)
    stats: NPCStats = Field(default_factory=NPCStats)
    challenge_rating: Optional[str] = None
    attacks: List[Attack] = Field(default_factory=list)
    spellcasting: NPCSpellcasting = Field(default_factory=NPCSpellcasting)
    abilities: List[NPCAbility] = Field(default_factory=list)
    legendary_actions: List[LegendaryAction] = Field(default_factory=list)
    lair_actions: List[LairAction] = Field(default_factory=list)
    relationships: Dict[str, str] = Field(default_factory=dict)
    personality_traits: List[str] = Field(default_factory=list)
    ideals: List[str] = Field(default_factory=list)
    bonds: List[str] = Field(default_factory=list)
    flaws: List[str] = Field(default_factory=list)
    goals: Optional[str] = Field(None, max_length=500)
    secrets: Optional[str] = Field(None, max_length=500)
    gm_notes: Optional[str] = Field(None, max_length=2000)
    avatar_url: Optional[str] = None
    token_url: Optional[str] = None
    show_to_players: bool = True
    is_important: bool = False
    tags: List[str] = Field(default_factory=list)


class EnhancedNPCUpdate(BaseModel):
    """Schema para atualização de NPC"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    race: Optional[str] = Field(None, max_length=50)
    npc_class: Optional[str] = Field(None, alias="class", max_length=50)
    size: Optional[NPCSize] = None
    creature_type: Optional[NPCCreatureType] = None
    npc_type: Optional[NPCType] = None
    alignment: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=100)
    occupation: Optional[str] = Field(None, max_length=100)
    faction: Optional[str] = Field(None, max_length=100)
    stats: Optional[NPCStats] = None
    challenge_rating: Optional[str] = None
    attacks: Optional[List[Attack]] = None
    spellcasting: Optional[NPCSpellcasting] = None
    abilities: Optional[List[NPCAbility]] = None
    legendary_actions: Optional[List[LegendaryAction]] = None
    lair_actions: Optional[List[LairAction]] = None
    relationships: Optional[Dict[str, str]] = None
    personality_traits: Optional[List[str]] = None
    ideals: Optional[List[str]] = None
    bonds: Optional[List[str]] = None
    flaws: Optional[List[str]] = None
    goals: Optional[str] = Field(None, max_length=500)
    secrets: Optional[str] = Field(None, max_length=500)
    gm_notes: Optional[str] = Field(None, max_length=2000)
    avatar_url: Optional[str] = None
    token_url: Optional[str] = None
    show_to_players: Optional[bool] = None
    is_important: Optional[bool] = None
    is_alive: Optional[bool] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None


class EnhancedNPCResponse(BaseModel):
    """Schema para resposta da API"""
    model_config = ConfigDict(
        validate_by_name=True,
        populate_by_name=True
    )

    id: str
    campaign_id: str
    name: str
    description: Optional[str] = None
    race: Optional[str] = None
    npc_class: Optional[str] = Field(None, alias="class")
    size: NPCSize
    creature_type: NPCCreatureType
    npc_type: NPCType
    alignment: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    faction: Optional[str] = None
    stats: NPCStats
    challenge_rating: Optional[str] = None
    experience_points: Optional[int] = None
    attacks: List[Attack]
    spellcasting: NPCSpellcasting
    abilities: List[NPCAbility]
    legendary_actions: List[LegendaryAction]
    lair_actions: List[LairAction]
    relationships: Dict[str, str]
    personality_traits: List[str]
    ideals: List[str]
    bonds: List[str]
    flaws: List[str]
    goals: Optional[str] = None
    secrets: Optional[str] = None
    is_alive: bool
    is_active: bool
    gm_notes: Optional[str] = None
    avatar_url: Optional[str] = None
    token_url: Optional[str] = None
    show_to_players: bool
    is_important: bool
    tags: List[str]
    created_date: str
    updated_date: str
    created_by: Optional[str] = None


# ===========================
# SCHEMAS PARA OPERAÇÕES ESPECIAIS
# ===========================

class DiceRollRequest(BaseModel):
    """Request para rolagem de dados"""
    npc_id: str
    roll_type: str = Field(...,
                           description="Tipo de rolagem: attack, damage, spell_attack, spell_damage, ability_check, saving_throw")
    target_id: Optional[str] = Field(None, description="ID do ataque/magia específica")
    advantage: bool = False
    disadvantage: bool = False
    modifier_override: Optional[int] = Field(None, description="Modificador manual")


class UpdateHitPointsRequest(BaseModel):
    """Request para atualizar pontos de vida"""
    npc_id: str
    new_hit_points: int = Field(..., ge=0)
    temporary_hit_points: Optional[int] = Field(None, ge=0)
    max_hit_points: Optional[int] = Field(None, ge=1)


class CastSpellRequest(BaseModel):
    """Request para conjurar magia"""
    npc_id: str
    spell_id: str
    cast_level: Optional[int] = Field(None, ge=0, le=9, description="Nível de conjuração (para upcast)")
    use_spell_slot: bool = Field(True, description="Se deve consumir slot de magia")


# ===========================
# SCHEMAS DE BUSCA E FILTROS
# ===========================

class NPCSearchFilters(BaseModel):
    """Filtros para busca de NPCs"""
    name: Optional[str] = None
    npc_type: Optional[List[NPCType]] = None
    creature_type: Optional[List[NPCCreatureType]] = None
    location: Optional[List[str]] = None
    faction: Optional[List[str]] = None
    challenge_rating_min: Optional[float] = None
    challenge_rating_max: Optional[float] = None
    is_alive: Optional[bool] = None
    is_active: Optional[bool] = None
    has_attacks: Optional[bool] = None
    is_spellcaster: Optional[bool] = None
    is_important: Optional[bool] = None
    tags: Optional[List[str]] = None


class NPCSearchResult(BaseModel):
    """Resultado de busca de NPCs"""
    npcs: List[EnhancedNPCResponse]
    total: int
    page: int = 1
    per_page: int = 50
    filters_applied: NPCSearchFilters