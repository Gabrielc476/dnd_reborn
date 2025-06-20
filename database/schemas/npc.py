from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ================================
# SCHEMA SEPARADO PARA NPCs
# ================================

class NPCType(str, Enum):
    """Tipos de NPC"""
    ALLY = "aliado"
    NEUTRAL = "neutro"
    ENEMY = "inimigo"
    MERCHANT = "mercador"
    QUEST_GIVER = "missões"
    BACKGROUND = "cenário"


class NPCStats(BaseModel):
    """Estatísticas básicas do NPC"""
    armor_class: int = Field(default=10, ge=1, le=30)
    hit_points: int = Field(default=1, ge=1)
    speed: str = Field(default="30 ft")

    # Atributos (opcionais para NPCs simples)
    strength: Optional[int] = Field(None, ge=1, le=30)
    dexterity: Optional[int] = Field(None, ge=1, le=30)
    constitution: Optional[int] = Field(None, ge=1, le=30)
    intelligence: Optional[int] = Field(None, ge=1, le=30)
    wisdom: Optional[int] = Field(None, ge=1, le=30)
    charisma: Optional[int] = Field(None, ge=1, le=30)


class NPCAbility(BaseModel):
    """Habilidade especial do NPC"""
    name: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=300)
    usage: Optional[str] = None  # "1/dia", "recarga 5-6", etc.


class NPC(BaseModel):
    """Modelo completo para NPCs"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    id: Optional[ObjectId] = None
    campaign_id: ObjectId  # Campanha à qual o NPC pertence

    # Informações básicas
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    race: Optional[str] = None
    npc_class: Optional[str] = Field(None, alias="class")  # "guerreiro", "mago", etc.

    # Tipo e comportamento
    npc_type: NPCType = NPCType.NEUTRAL
    alignment: Optional[str] = None

    # Localização e contexto
    location: Optional[str] = None
    occupation: Optional[str] = None

    # Estatísticas (opcional para NPCs narrativos)
    stats: Optional[NPCStats] = None
    challenge_rating: Optional[str] = None  # "1/4", "1", "5", etc.

    # Habilidades especiais
    abilities: List[NPCAbility] = []

    # Relacionamentos
    faction: Optional[str] = None
    relationships: Dict[str, str] = {}  # {"player_name": "amigo", "outro_npc": "rival"}

    # Informações de roleplay
    personality_traits: List[str] = []
    goals: Optional[str] = None
    secrets: Optional[str] = None

    # Status
    is_alive: bool = True
    is_active: bool = True  # Se está ativo na campanha atual

    # Notas do mestre
    gm_notes: Optional[str] = Field(None, max_length=1000)

    # Metadados
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)


# Schema para criação de NPC
class NPCCreate(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    campaign_id: ObjectId
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    race: Optional[str] = None
    npc_class: Optional[str] = Field(None, alias="class")
    npc_type: NPCType = NPCType.NEUTRAL
    alignment: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    stats: Optional[NPCStats] = None
    challenge_rating: Optional[str] = None
    abilities: List[NPCAbility] = []
    faction: Optional[str] = None
    relationships: Dict[str, str] = {}
    personality_traits: List[str] = []
    goals: Optional[str] = None
    secrets: Optional[str] = None
    gm_notes: Optional[str] = Field(None, max_length=1000)


# Schema para atualização de NPC
class NPCUpdate(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    race: Optional[str] = None
    npc_class: Optional[str] = Field(None, alias="class")
    npc_type: Optional[NPCType] = None
    alignment: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    stats: Optional[NPCStats] = None
    challenge_rating: Optional[str] = None
    abilities: Optional[List[NPCAbility]] = None
    faction: Optional[str] = None
    relationships: Optional[Dict[str, str]] = None
    personality_traits: Optional[List[str]] = None
    goals: Optional[str] = None
    secrets: Optional[str] = None
    is_alive: Optional[bool] = None
    is_active: Optional[bool] = None
    gm_notes: Optional[str] = Field(None, max_length=1000)


# Schema para resposta de NPC
class NPCResponse(BaseModel):
    model_config = ConfigDict(
        use_enum_values=True,
        validate_by_name=True,
        populate_by_name=True
    )

    id: str
    campaign_id: str
    name: str
    description: Optional[str]
    race: Optional[str]
    npc_class: Optional[str] = Field(None, alias="class")
    npc_type: NPCType
    alignment: Optional[str]
    location: Optional[str]
    occupation: Optional[str]
    stats: Optional[NPCStats]
    challenge_rating: Optional[str]
    abilities: List[NPCAbility]
    faction: Optional[str]
    relationships: Dict[str, str]
    personality_traits: List[str]
    goals: Optional[str]
    secrets: Optional[str]
    is_alive: bool
    is_active: bool
    gm_notes: Optional[str]
    created_date: datetime
    updated_date: datetime


# Schema resumido para listagem de NPCs
class NPCSummary(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    campaign_id: str
    name: str
    npc_type: NPCType
    location: Optional[str]
    is_alive: bool
    is_active: bool