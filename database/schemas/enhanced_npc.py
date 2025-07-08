# ===========================
# SCHEMAS ATUALIZADOS PARA NPCs COM SISTEMA DE DADOS - CORRIGIDO
# database/schemas/enhanced_npc.py
# ===========================

from typing import Dict, Any, List, Optional, Union
from bson import ObjectId
from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime
from enum import Enum

# Importar NPCType do manageCampaign para evitar duplicação
from database.schemas.npc import NPCType, NPCAbility


# ===========================
# ENUMS E TIPOS ESPECÍFICOS
# ===========================

class NPCSize(str, Enum):
    """Tamanhos de NPCs"""
    TINY = "Minúsculo"
    SMALL = "Pequeno"
    MEDIUM = "Médio"
    LARGE = "Grande"
    HUGE = "Enorme"
    GARGANTUAN = "Colossal"


class NPCCreatureType(str, Enum):
    """Tipos de criaturas"""
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
    """Tipos de dano"""
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
    """Escolas de magia"""
    ABJURATION = "Abjuração"
    CONJURATION = "Conjuração"
    DIVINATION = "Adivinhação"
    ENCHANTMENT = "Encantamento"
    EVOCATION = "Evocação"
    ILLUSION = "Ilusão"
    NECROMANCY = "Necromancia"
    TRANSMUTATION = "Transmutação"


# ===========================
# MODELOS DE DADOS E ROLAGENS
# ===========================

class DiceRoll(BaseModel):
    """Rolagem de dados"""
    dice_count: int = Field(..., ge=1, le=20, description="Quantidade de dados")
    dice_sides: int = Field(..., description="Lados do dado")
    modifier: int = Field(default=0, description="Modificador")

    @validator('dice_sides')
    def validate_dice_sides(cls, v):
        """Validar lados do dado"""
        valid_sides = [4, 6, 8, 10, 12, 20, 100]
        if v not in valid_sides:
            raise ValueError(f"Lados do dado devem ser um de: {valid_sides}")
        return v


class RollResult(BaseModel):
    """Resultado de uma rolagem"""
    total: int = Field(..., description="Total da rolagem")
    rolls: List[int] = Field(..., description="Rolagens individuais")
    modifier: int = Field(..., description="Modificador aplicado")
    formula: str = Field(..., description="Fórmula da rolagem")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    advantage: bool = Field(default=False)
    disadvantage: bool = Field(default=False)


# ===========================
# MODELOS DE COMBATE
# ===========================

class Attack(BaseModel):
    """Ataque do NPC"""
    id: Optional[str] = Field(None, description="ID único do ataque")
    name: str = Field(..., min_length=1, max_length=100, description="Nome do ataque")
    attack_bonus: int = Field(..., description="Bônus de ataque")
    damage: DiceRoll = Field(..., description="Dano do ataque")
    damage_type: DamageType = Field(..., description="Tipo de dano")
    range: str = Field(..., description="Alcance do ataque")
    description: Optional[str] = Field(None, max_length=500, description="Descrição do ataque")
    is_magical: bool = Field(default=False, description="Se é um ataque mágico")
    reach: Optional[int] = Field(None, ge=0, description="Alcance em pés")
    versatile_damage: Optional[DiceRoll] = Field(None, description="Dano versátil")

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
    level: int = Field(..., ge=0, le=9, description="Nível da magia")
    school: SpellSchool = Field(..., description="Escola de magia")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição da magia")
    casting_time: Optional[str] = Field(None, description="Tempo de conjuração")
    range: str = Field(..., description="Alcance da magia")
    components: Optional[str] = Field(None, description="Componentes")
    duration: Optional[str] = Field(None, description="Duração")

    # Informações de ataque/dano
    is_attack_spell: bool = Field(default=False, description="Se é magia de ataque")
    attack_bonus: Optional[int] = Field(None, description="Bônus de ataque mágico")
    damage: Optional[DiceRoll] = Field(None, description="Dano da magia")
    damage_type: Optional[DamageType] = Field(None, description="Tipo de dano")
    save_dc: Optional[int] = Field(None, description="CD de resistência")
    save_ability: Optional[str] = Field(None, description="Atributo de resistência")

    # Upcast
    higher_level: Optional[str] = Field(None, description="Efeito em níveis superiores")
    upcast_damage: Optional[DiceRoll] = Field(None, description="Dano adicional por nível")

    @validator('id', pre=True, always=True)
    def generate_id(cls, v):
        """Gera ID único se não fornecido"""
        if v is None:
            return str(ObjectId())
        return v


# ===========================
# ESTATÍSTICAS E ATRIBUTOS
# ===========================

class NPCAttributes(BaseModel):
    """Atributos do NPC"""
    strength: int = Field(default=10, ge=1, le=30, description="Força")
    dexterity: int = Field(default=10, ge=1, le=30, description="Destreza")
    constitution: int = Field(default=10, ge=1, le=30, description="Constituição")
    intelligence: int = Field(default=10, ge=1, le=30, description="Inteligência")
    wisdom: int = Field(default=10, ge=1, le=30, description="Sabedoria")
    charisma: int = Field(default=10, ge=1, le=30, description="Carisma")


class NPCStats(BaseModel):
    """Estatísticas completas do NPC"""
    armor_class: int = Field(..., ge=1, le=30, description="Classe de Armadura")
    hit_points: int = Field(..., ge=1, description="Pontos de Vida")
    max_hit_points: Optional[int] = Field(None, ge=1, description="PV máximos")
    temporary_hit_points: Optional[int] = Field(default=0, ge=0, description="PV temporários")
    speed: str = Field(default="30 pés", description="Deslocamento")
    attributes: NPCAttributes = Field(default_factory=NPCAttributes, description="Atributos")

    # Estatísticas derivadas (calculadas automaticamente)
    proficiency_bonus: Optional[int] = Field(None, description="Bônus de proficiência")
    passive_perception: Optional[int] = Field(None, description="Percepção passiva")
    initiative_modifier: Optional[int] = Field(None, description="Modificador de iniciativa")


class NPCSkills(BaseModel):
    """Perícias do NPC"""

    class Config:
        extra = "allow"  # Permite perícias adicionais


class NPCSavingThrows(BaseModel):
    """Testes de resistência do NPC"""
    strength: Optional[int] = Field(None, description="Força")
    dexterity: Optional[int] = Field(None, description="Destreza")
    constitution: Optional[int] = Field(None, description="Constituição")
    intelligence: Optional[int] = Field(None, description="Inteligência")
    wisdom: Optional[int] = Field(None, description="Sabedoria")
    charisma: Optional[int] = Field(None, description="Carisma")


# ===========================
# SISTEMA DE CONJURAÇÃO
# ===========================

class NPCSpellSlot(BaseModel):
    """Slot de magia"""
    level: int = Field(..., ge=1, le=9, description="Nível do slot")
    max_slots: int = Field(..., ge=0, description="Slots máximos")
    current_slots: int = Field(..., ge=0, description="Slots atuais")

    @validator('current_slots')
    def validate_current_slots(cls, v, values):
        """Slots atuais não podem exceder máximo"""
        max_slots = values.get('max_slots', 0)
        if v > max_slots:
            return max_slots
        return v


class NPCSpellcasting(BaseModel):
    """Sistema de conjuração do NPC"""
    is_spellcaster: bool = Field(default=False, description="Se é conjurador")
    spellcasting_ability: Optional[str] = Field(None, description="Atributo de conjuração")
    spell_save_dc: Optional[int] = Field(None, description="CD de resistência")
    spell_attack_bonus: Optional[int] = Field(None, description="Bônus de ataque mágico")
    caster_level: Optional[int] = Field(None, ge=1, le=20, description="Nível de conjurador")

    # Slots de magia
    spell_slots: List[NPCSpellSlot] = Field(default_factory=list, description="Slots de magia")

    # Magias conhecidas
    spells_known: List[Spell] = Field(default_factory=list, description="Magias conhecidas")
    cantrips_known: List[Spell] = Field(default_factory=list, description="Truques conhecidos")

    # Capacidades especiais
    ritual_casting: bool = Field(default=False, description="Conjuração ritual")
    innate_spellcasting: Dict[str, List[Spell]] = Field(default_factory=dict, description="Conjuração inata")


# ===========================
# HABILIDADES ESPECIAIS
# ===========================

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
    """Modelo completo para NPCs Enhanced"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    id: Optional[ObjectId] = Field(None, description="ID do NPC")
    campaign_id: ObjectId = Field(..., description="ID da campanha")

    # Informações básicas
    name: str = Field(..., min_length=2, max_length=100, description="Nome do NPC")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição")
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
    stats: NPCStats = Field(default_factory=NPCStats, description="Estatísticas")
    challenge_rating: Optional[str] = Field(None, description="Challenge Rating")
    experience_points: Optional[int] = Field(None, ge=0, description="XP concedido")

    # Sistema de combate
    attacks: List[Attack] = Field(default_factory=list, description="Ataques")
    spellcasting: NPCSpellcasting = Field(default_factory=NPCSpellcasting, description="Conjuração")
    abilities: List[NPCAbility] = Field(default_factory=list, description="Habilidades especiais")
    legendary_actions: List[LegendaryAction] = Field(default_factory=list, description="Ações lendárias")
    legendary_actions_per_turn: int = Field(default=3, ge=0, le=5, description="Ações lendárias por turno")
    lair_actions: List[LairAction] = Field(default_factory=list, description="Ações de covil")

    # Proficiências
    skills: Optional[NPCSkills] = Field(None, description="Perícias")
    saving_throws: Optional[NPCSavingThrows] = Field(None, description="Testes de resistência")
    damage_resistances: List[str] = Field(default_factory=list, description="Resistências a dano")
    damage_immunities: List[str] = Field(default_factory=list, description="Imunidades a dano")
    condition_immunities: List[str] = Field(default_factory=list, description="Imunidades a condições")
    senses: List[str] = Field(default_factory=list, description="Sentidos")
    languages: List[str] = Field(default_factory=list, description="Idiomas")

    # Relacionamentos
    relationships: Dict[str, str] = Field(default_factory=dict, description="Relacionamentos")

    # Informações de roleplay
    personality_traits: List[str] = Field(default_factory=list, description="Traços de personalidade")
    ideals: List[str] = Field(default_factory=list, description="Ideais")
    bonds: List[str] = Field(default_factory=list, description="Vínculos")
    flaws: List[str] = Field(default_factory=list, description="Defeitos")
    goals: Optional[str] = Field(None, max_length=500, description="Objetivos")
    secrets: Optional[str] = Field(None, max_length=500, description="Segredos")

    # Status do jogo
    is_alive: bool = Field(default=True, description="Se está vivo")
    is_active: bool = Field(default=True, description="Se está ativo na campanha")
    current_hit_points: Optional[int] = Field(None, description="PV atuais")

    # Metadados
    created_date: Optional[datetime] = Field(None, description="Data de criação")
    updated_date: Optional[datetime] = Field(None, description="Data de atualização")
    created_by: Optional[ObjectId] = Field(None, description="Criado por")

    # Notas do mestre
    gm_notes: Optional[str] = Field(None, max_length=2000, description="Notas do GM")

    # Configurações de exibição
    avatar_url: Optional[str] = Field(None, description="URL do avatar")
    token_url: Optional[str] = Field(None, description="URL do token")
    show_to_players: bool = Field(default=True, description="Visível para jogadores")
    is_important: bool = Field(default=False, description="NPC importante")
    tags: List[str] = Field(default_factory=list, description="Tags")

    def calculate_derived_stats(self):
        """Calcula estatísticas derivadas"""
        # Implementar cálculos automáticos quando necessário
        pass


# ===========================
# SCHEMAS PARA API - CORRIGIDOS
# ===========================

class EnhancedNPCCreate(BaseModel):
    """Schema para criação de NPC - CORRIGIDO para aceitar string no campaign_id"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    # CORRIGIDO: Aceitar string e converter para ObjectId
    campaign_id: Union[str, ObjectId] = Field(..., description="ID da campanha")
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

    @validator('campaign_id', pre=True)
    def convert_campaign_id(cls, v):
        """Converte string para ObjectId"""
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
            else:
                raise ValueError(f"campaign_id inválido: {v}")
        return v


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
    current_hit_points: Optional[int] = None
    created_date: str
    updated_date: str
    created_by: Optional[str] = None
    gm_notes: Optional[str] = None
    avatar_url: Optional[str] = None
    token_url: Optional[str] = None
    show_to_players: bool
    is_important: bool
    tags: List[str]


# ===========================
# SCHEMAS PARA OPERAÇÕES
# ===========================

class DiceRollRequest(BaseModel):
    """Request para rolagem de dados"""
    npc_id: str
    roll_type: str = Field(...,
                           description="Tipo: attack, damage, spell_attack, spell_damage, ability_check, saving_throw")
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
    cast_level: Optional[int] = Field(None, ge=0, le=9, description="Nível de conjuração")
    use_spell_slot: bool = Field(True, description="Se deve consumir slot")


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

    def __len__(self) -> int:
        """Return the number of NPCs in the result"""
        return len(self.npcs)

    def __bool__(self) -> bool:
        """Return True if there are NPCs in the result"""
        return len(self.npcs) > 0

    def __iter__(self):
        """Allow iteration over the NPCs"""
        return iter(self.npcs)

    def __getitem__(self, index):
        """Allow indexing of NPCs"""
        return self.npcs[index]