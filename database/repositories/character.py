from bson import ObjectId
from typing import Optional, List
from database.db import mydb
from database.schemas.character import Character, CharacterCreate

characters_collection = mydb["characters"]

def create_character(character: CharacterCreate) -> ObjectId:
    """Insere um novo personagem no banco"""
    character_dict = character.dict(by_alias=True, exclude_unset=True)
    result = characters_collection.insert_one(character_dict)
    return result.inserted_id

def get_character_by_id(character_id: str) -> Optional[Character]:
    """Retorna personagem pelo ID"""
    character_data = characters_collection.find_one({"_id": ObjectId(character_id)})
    if character_data:
        character_data["id"] = character_data["_id"]
        return Character(**character_data)
    return None

def get_characters_by_user(user_id: str) -> List[Character]:
    """Retorna todos os personagens de um usuário"""
    characters_data = list(characters_collection.find({"user_id": ObjectId(user_id)}))
    characters = []
    for char_data in characters_data:
        char_data["id"] = char_data["_id"]
        characters.append(Character(**char_data))
    return characters

def get_characters_by_campaign(campaign_id: str) -> List[Character]:
    """Retorna todos os personagens de uma campanha"""
    characters_data = list(characters_collection.find({"campaign_id": ObjectId(campaign_id)}))
    characters = []
    for char_data in characters_data:
        char_data["id"] = char_data["_id"]
        characters.append(Character(**char_data))
    return characters

def update_character(character_id: str, character: CharacterCreate) -> bool:
    """Atualiza um personagem existente"""
    update_data = character.dict(by_alias=True, exclude_unset=True)
    result = characters_collection.update_one(
        {"_id": ObjectId(character_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

def delete_character(character_id: str) -> bool:
    """Remove um personagem do banco"""
    result = characters_collection.delete_one({"_id": ObjectId(character_id)})
    return result.deleted_count > 0