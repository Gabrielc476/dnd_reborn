from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional, List, Dict


# Modelo para rolagens de dados
class DiceRoll(BaseModel):
    dice_count: int = Field(..., ge=1)  # Quantidade de dados (ex: 2 em "2d6")
    dice_sides: int = Field(..., ge=2)  # Lados do dado (ex: 6 em "2d6")
    modifier: int = 0  # Modificador (ex: +3 em "2d6+3")

    def __str__(self):
        if self.modifier == 0:
            return f"{self.dice_count}d{self.dice_sides}"
        elif self.modifier > 0:
            return f"{self.dice_count}d{self.dice_sides}+{self.modifier}"
        else:
            return f"{self.dice_count}d{self.dice_sides}{self.modifier}"


# Modelo para ataques físicos/armas
class Attack(BaseModel):
    name: str
    attack_bonus: int = 0
    damage: DiceRoll
    damage_type: str = "cortante"
    range: str = "Corpo a corpo"
    description: Optional[str] = None


# Modelo para uma magia individual
class Spell(BaseModel):
    name: str
    level: int = Field(..., ge=0, le=9)
    school: str
    description: Optional[str] = None

    # Informações de ataque/dano (para magias ofensivas)
    is_attack_spell: bool = False
    attack_bonus: Optional[int] = None
    damage: Optional[DiceRoll] = None
    damage_type: Optional[str] = None
    save_dc: Optional[int] = None
    save_ability: Optional[str] = None
    range: str = "Toque"


# Modelo para os 6 atributos básicos do D&D
class Attributes(BaseModel):
    strength: int = Field(..., ge=3, le=20)
    dexterity: int = Field(..., ge=3, le=20)
    constitution: int = Field(..., ge=3, le=20)
    intelligence: int = Field(..., ge=3, le=20)
    wisdom: int = Field(..., ge=3, le=20)
    charisma: int = Field(..., ge=3, le=20)


# Modelo para informações de raça e subraça
class RaceInfo(BaseModel):
    """Informações sobre a raça selecionada"""
    race_name: str
    race_index: str
    subrace_name: Optional[str] = None
    subrace_index: Optional[str] = None
    speed: int = 30
    size: str = "Medium"

    # Bônus de atributos combinados (raça + subraça)
    ability_bonuses: Dict[str, int] = {}  # ex: {"strength": 1, "constitution": 2}

    # Traços raciais
    racial_traits: List[str] = []
    languages: List[str] = []
    proficiencies: List[str] = []


# Modelo para informações básicas do personagem
class BasicInfo(BaseModel):
    model_config = ConfigDict(
        validate_by_name=True,  # Era allow_population_by_field_name no v1
        populate_by_name=True  # Permite usar tanto field name quanto alias
    )

    name: str = Field(..., min_length=2, max_length=50)
    race_info: RaceInfo  # ← NOVO: substitui race individual
    character_class: str = Field(..., alias="class")
    level: int = Field(default=1, ge=1, le=20)
    background: str
    alignment: Optional[str] = None


# Modelo para perícias do D&D
class Skills(BaseModel):
    # Força
    athletics: bool = False

    # Destreza
    acrobatics: bool = False
    sleight_of_hand: bool = False
    stealth: bool = False

    # Inteligência
    arcana: bool = False
    history: bool = False
    investigation: bool = False
    nature: bool = False
    religion: bool = False

    # Sabedoria
    animal_handling: bool = False
    insight: bool = False
    medicine: bool = False
    perception: bool = False
    survival: bool = False

    # Carisma
    deception: bool = False
    intimidation: bool = False
    performance: bool = False
    persuasion: bool = False


# Modelo para status/stats derivados
class Stats(BaseModel):
    hit_points: int = Field(..., ge=1)
    armor_class: int = Field(..., ge=10, le=30)
    experience_points: int = Field(default=0, ge=0)


# Modelo para sistema de combate
class Combat(BaseModel):
    attacks: List[Attack] = []


# Modelo para sistema de magias
class Magic(BaseModel):
    spellcaster: bool = False
    spellcasting_ability: Optional[str] = None
    known_spells: List[Spell] = []

    # Slots de magia por nível (1-9)
    spell_slots_1: int = 0
    spell_slots_2: int = 0
    spell_slots_3: int = 0
    spell_slots_4: int = 0
    spell_slots_5: int = 0
    spell_slots_6: int = 0
    spell_slots_7: int = 0
    spell_slots_8: int = 0
    spell_slots_9: int = 0


# Modelo completo do personagem
class Character(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        validate_by_name=True,
        populate_by_name=True
    )

    id: Optional[ObjectId] = None
    user_id: ObjectId
    campaign_id: Optional[ObjectId] = None  # Referência à campanha (pode ser None se não estiver em campanha)
    basic_info: BasicInfo  # ← ATUALIZADO: agora inclui race_info com subraça
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic
    calculated_stats: Optional[Dict] = None  # Estatísticas calculadas salvas no banco


# Schema para criação de personagem
class CharacterCreate(BaseModel):
    model_config = ConfigDict(
        validate_by_name=True,
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

    user_id: ObjectId
    campaign_id: Optional[ObjectId] = None  # ID da campanha (opcional)
    basic_info: BasicInfo  # ← ATUALIZADO: inclui race_info
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic


# Schema para resposta
class CharacterResponse(BaseModel):
    model_config = ConfigDict(
        validate_by_name=True,
        populate_by_name=True
    )

    id: str
    user_id: str
    campaign_id: Optional[str] = None
    basic_info: BasicInfo  # ← ATUALIZADO: inclui race_info
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic


# Schema para listar personagens (versão resumida)
class CharacterSummary(BaseModel):
    model_config = ConfigDict(
        validate_by_name=True,
        populate_by_name=True
    )

    id: str
    user_id: str
    campaign_id: Optional[str] = None
    name: str
    race_name: str  # ← NOVO: nome da raça
    subrace_name: Optional[str] = None  # ← NOVO: nome da subraça
    character_class: str = Field(alias="class")
    level: int


# ===========================
# FUNÇÕES AUXILIARES PARA SUBRAÇAS
# ===========================

def create_race_info_from_frontend_data(race_data: dict, subrace_data: Optional[dict] = None) -> RaceInfo:
    """
    Cria RaceInfo a partir dos dados do frontend

    Args:
        race_data: Dados da raça do frontend (DndRace)
        subrace_data: Dados da subraça do frontend (DndSubrace, opcional)

    Returns:
        RaceInfo: Objeto com informações combinadas da raça e subraça
    """
    # Combinar bônus de atributos
    combined_bonuses = {}

    # Adicionar bônus da raça
    for bonus in race_data.get("ability_bonuses", []):
        ability_key = bonus["ability_score"]["index"]
        combined_bonuses[ability_key] = combined_bonuses.get(ability_key, 0) + bonus["bonus"]

    # Adicionar bônus da subraça (se existir)
    if subrace_data:
        for bonus in subrace_data.get("ability_bonuses", []):
            ability_key = bonus["ability_score"]["index"]
            combined_bonuses[ability_key] = combined_bonuses.get(ability_key, 0) + bonus["bonus"]

    # Combinar traços raciais
    racial_traits = []
    if "traits" in race_data:
        racial_traits.extend([trait["name"] for trait in race_data["traits"]])
    if subrace_data and "racial_traits" in subrace_data:
        racial_traits.extend([trait["name"] for trait in subrace_data["racial_traits"]])

    # Combinar proficiências
    proficiencies = []
    if "starting_proficiencies" in race_data:
        proficiencies.extend([prof["name"] for prof in race_data["starting_proficiencies"]])
    if subrace_data and "starting_proficiencies" in subrace_data:
        proficiencies.extend([prof["name"] for prof in subrace_data["starting_proficiencies"]])

    # Combinar linguagens
    languages = []
    if "languages" in race_data:
        languages.extend([lang["name"] for lang in race_data["languages"]])
    if subrace_data and "languages" in subrace_data:
        languages.extend([lang["name"] for lang in subrace_data["languages"]])

    return RaceInfo(
        race_name=race_data["name"],
        race_index=race_data["index"],
        subrace_name=subrace_data["name"] if subrace_data else None,
        subrace_index=subrace_data["index"] if subrace_data else None,
        speed=race_data.get("speed", 30),
        size=race_data.get("size", "Medium"),
        ability_bonuses=combined_bonuses,
        racial_traits=racial_traits,
        languages=languages,
        proficiencies=proficiencies
    )


def get_combined_ability_bonuses(race_info: RaceInfo) -> Dict[str, int]:
    """
    Retorna os bônus de atributos combinados da raça e subraça

    Args:
        race_info: Informações da raça/subraça do personagem

    Returns:
        Dict[str, int]: Dicionário com os bônus por atributo
    """
    return race_info.ability_bonuses.copy()


def format_race_display_name(race_info: RaceInfo) -> str:
    """
    Formata o nome da raça para exibição

    Args:
        race_info: Informações da raça/subraça

    Returns:
        str: Nome formatado (ex: "Elfo (Alto Elfo)" ou apenas "Humano")
    """
    if race_info.subrace_name:
        return f"{race_info.race_name} ({race_info.subrace_name})"
    return race_info.race_name