from pydantic import BaseModel, Field
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


# Modelo para informações básicas do personagem
class BasicInfo(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    race: str
    character_class: str = Field(..., alias="class")
    level: int = Field(default=1, ge=1, le=20)
    background: str
    alignment: Optional[str] = None

    class Config:
        allow_population_by_field_name = True


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
    id: Optional[ObjectId] = None
    user_id: ObjectId
    campaign_id: Optional[ObjectId] = None  # Referência à campanha (pode ser None se não estiver em campanha)
    basic_info: BasicInfo
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic
    calculated_stats: Optional[Dict] = None  # Estatísticas calculadas salvas no banco

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


# Schema para criação de personagem
class CharacterCreate(BaseModel):
    user_id: ObjectId
    campaign_id: Optional[ObjectId] = None  # ID da campanha (opcional)
    basic_info: BasicInfo
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True


# Schema para resposta
class CharacterResponse(BaseModel):
    id: str
    user_id: str
    campaign_id: Optional[str] = None
    basic_info: BasicInfo
    attributes: Attributes
    skills: Skills
    stats: Stats
    combat: Combat
    magic: Magic

    class Config:
        allow_population_by_field_name = True


# Schema para listar personagens (versão resumida)
class CharacterSummary(BaseModel):
    id: str
    user_id: str
    campaign_id: Optional[str] = None
    name: str
    race: str
    character_class: str = Field(alias="class")
    level: int

    class Config:
        allow_population_by_field_name = True