from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class CampaignStatus(str, Enum):
    """Status possíveis de uma campanha"""
    ACTIVE = "ativa"
    PAUSED = "pausada"
    COMPLETED = "finalizada"
    RECRUITING = "recrutando"


class CampaignPlayer(BaseModel):
    """Informações de um jogador na campanha"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: ObjectId
    character_id: Optional[ObjectId] = None
    joined_date: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    notes: Optional[str] = None


class Encounter(BaseModel):
    """Modelo para encontros/combates"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    difficulty: str = Field(default="medium")  # "easy", "medium", "hard", "deadly"
    npcs: List[ObjectId] = []  # IDs dos NPCs envolvidos
    location: Optional[str] = None
    rewards_xp: int = Field(default=0, ge=0)
    is_completed: bool = False
    session_number: Optional[int] = None
    notes: Optional[str] = None


class LootItem(BaseModel):
    """Item de loot/tesouro"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=300)
    item_type: str = Field(default="misc")  # "weapon", "armor", "magic", "misc", "gold"
    value: int = Field(default=0, ge=0)  # Valor em moedas de ouro
    quantity: int = Field(default=1, ge=1)
    is_magic: bool = False
    rarity: str = Field(default="common")  # "common", "uncommon", "rare", "very_rare", "legendary"
    found_in_encounter: Optional[str] = None  # Nome do encontro onde foi encontrado
    assigned_to_player: Optional[ObjectId] = None  # ID do jogador que ficou com o item


# Modelo completo da campanha
class Campaign(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True
    )

    id: Optional[ObjectId] = None
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)

    # Mestre da campanha
    game_master_id: ObjectId

    # Jogadores
    players: List[CampaignPlayer] = []
    max_players: int = Field(default=6, ge=1, le=10)

    # Status
    status: CampaignStatus = CampaignStatus.RECRUITING

    # Mundo e ambientação
    setting: Optional[str] = None  # "Forgotten Realms", "Homebrew", etc.
    world_name: Optional[str] = None

    # NPCs da campanha
    npcs: List[ObjectId] = []  # IDs dos NPCs da campanha

    # Encontros
    encounters: List[Encounter] = []

    # Sistema de loot
    loot: List[LootItem] = []

    # Metadados
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

    # Informações extras
    tags: List[str] = []  # ["roleplay", "combat", "exploration", "political"]
    is_public: bool = False  # Se a campanha pode ser vista por outros usuários
    recruitment_message: Optional[str] = None  # Mensagem para recrutamento de jogadores

    # Notas gerais do mestre
    gm_notes: Optional[str] = Field(None, max_length=2000)


# Schema para criação de campanha
class CampaignCreate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    game_master_id: ObjectId
    max_players: int = Field(default=6, ge=1, le=10)
    setting: Optional[str] = None
    world_name: Optional[str] = None
    tags: List[str] = []
    is_public: bool = False
    recruitment_message: Optional[str] = None
    gm_notes: Optional[str] = Field(None, max_length=2000)


# Schema para atualização de campanha
class CampaignUpdate(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        use_enum_values=True
    )

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[CampaignStatus] = None
    max_players: Optional[int] = Field(None, ge=1, le=10)
    setting: Optional[str] = None
    world_name: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    recruitment_message: Optional[str] = None
    gm_notes: Optional[str] = Field(None, max_length=2000)


# Schema para resposta da API
class CampaignResponse(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    name: str
    description: Optional[str]
    game_master_id: str
    players: List[CampaignPlayer]
    max_players: int
    status: CampaignStatus
    setting: Optional[str]
    world_name: Optional[str]
    npcs: List[str]  # IDs como strings
    encounters: List[Encounter]
    loot: List[LootItem]
    created_date: datetime
    updated_date: datetime
    tags: List[str]
    is_public: bool
    recruitment_message: Optional[str]
    gm_notes: Optional[str]


# Schema para listagem de campanhas (versão resumida)
class CampaignSummary(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    name: str
    game_master_id: str
    player_count: int
    max_players: int
    status: CampaignStatus
    created_date: datetime
    tags: List[str]
    is_public: bool


# Schema para adicionar jogador à campanha
class AddPlayerRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: ObjectId
    character_id: Optional[ObjectId] = None


# Schema para atualizar informações de jogador
class UpdatePlayerRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    character_id: Optional[ObjectId] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None