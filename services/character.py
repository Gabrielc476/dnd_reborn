from typing import Dict, Any, List, Optional
from database.schemas.character import Character, CharacterCreate, CharacterResponse
from database.repositories.character import (
    create_character,
    get_character_by_id,
    get_characters_by_user,
    get_characters_by_campaign,
    update_character,
    delete_character
)
from utils.calculate_modifiers import calculate_character_stats
from pydantic import ValidationError
from bson import ObjectId


def create_character_service(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida dados, calcula estatísticas e cria novo personagem"""
    try:
        # Validar campos obrigatórios básicos
        required_fields = ["user_id", "basic_info", "attributes", "stats"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Validar se user_id é válido
        if not ObjectId.is_valid(data["user_id"]):
            return {"success": False, "error": "user_id inválido"}

        # Validar se campaign_id é válido (se fornecido)
        if data.get("campaign_id") and not ObjectId.is_valid(data["campaign_id"]):
            return {"success": False, "error": "campaign_id inválido"}

        # Validar dados com schema Pydantic
        try:
            character = CharacterCreate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Criar Character temporário para calcular estatísticas
        temp_character = Character(
            user_id=character.user_id,
            campaign_id=character.campaign_id,
            basic_info=character.basic_info,
            attributes=character.attributes,
            skills=character.skills,
            stats=character.stats,
            combat=character.combat,
            magic=character.magic
        )

        # Calcular estatísticas derivadas
        calculated_stats = calculate_character_stats(temp_character)

        # Adicionar estatísticas calculadas aos dados antes de salvar
        character_data = character.dict(by_alias=True, exclude_unset=True)
        character_data["calculated_stats"] = calculated_stats

        # Criar personagem no banco com estatísticas já calculadas
        from repositories.character import characters_collection
        result = characters_collection.insert_one(character_data)
        character_id = result.inserted_id

        return {
            "success": True,
            "character_id": str(character_id),
            "message": "Personagem criado com sucesso"
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_character_service(character_id: str) -> Dict[str, Any]:
    """Busca personagem por ID (estatísticas já estão calculadas)"""
    try:
        # Validar se character_id é válido
        if not ObjectId.is_valid(character_id):
            return {"success": False, "error": "ID de personagem inválido"}

        # Buscar personagem
        character = get_character_by_id(character_id)
        if not character:
            return {"success": False, "error": "Personagem não encontrado"}

        return {
            "success": True,
            "character": character_to_response(character)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_user_characters_service(user_id: str) -> Dict[str, Any]:
    """Busca todos os personagens de um usuário"""
    try:
        # Validar se user_id é válido
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "user_id inválido"}

        # Buscar personagens
        characters = get_characters_by_user(user_id)

        # Converter para response format
        characters_response = [character_to_response(char) for char in characters]

        return {
            "success": True,
            "characters": characters_response,
            "count": len(characters_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_campaign_characters_service(campaign_id: str) -> Dict[str, Any]:
    """Busca todos os personagens de uma campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Buscar personagens
        characters = get_characters_by_campaign(campaign_id)

        # Converter para response format
        characters_response = [character_to_response(char) for char in characters]

        return {
            "success": True,
            "characters": characters_response,
            "count": len(characters_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_character_service(character_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Atualiza personagem existente e recalcula estatísticas"""
    try:
        # Validar se character_id é válido
        if not ObjectId.is_valid(character_id):
            return {"success": False, "error": "ID de personagem inválido"}

        # Verificar se personagem existe
        existing_character = get_character_by_id(character_id)
        if not existing_character:
            return {"success": False, "error": "Personagem não encontrado"}

        # Validar se user_id é válido (se fornecido)
        if data.get("user_id") and not ObjectId.is_valid(data["user_id"]):
            return {"success": False, "error": "user_id inválido"}

        # Validar se campaign_id é válido (se fornecido)
        if data.get("campaign_id") and not ObjectId.is_valid(data["campaign_id"]):
            return {"success": False, "error": "campaign_id inválido"}

        # Validar dados com schema Pydantic
        try:
            character_update = CharacterCreate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Criar Character temporário para calcular estatísticas
        temp_character = Character(
            user_id=character_update.user_id,
            campaign_id=character_update.campaign_id,
            basic_info=character_update.basic_info,
            attributes=character_update.attributes,
            skills=character_update.skills,
            stats=character_update.stats,
            combat=character_update.combat,
            magic=character_update.magic
        )

        # Calcular estatísticas derivadas
        calculated_stats = calculate_character_stats(temp_character)

        # Adicionar estatísticas calculadas aos dados de atualização
        update_data = character_update.dict(by_alias=True, exclude_unset=True)
        update_data["calculated_stats"] = calculated_stats

        # Atualizar personagem no banco
        from repositories.character import characters_collection
        result = characters_collection.update_one(
            {"_id": ObjectId(character_id)},
            {"$set": update_data}
        )

        if result.modified_count > 0:
            return {
                "success": True,
                "message": "Personagem atualizado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar personagem"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_character_service(character_id: str, user_id: str) -> Dict[str, Any]:
    """Remove personagem (com verificação de proprietário)"""
    try:
        # Validar se character_id é válido
        if not ObjectId.is_valid(character_id):
            return {"success": False, "error": "ID de personagem inválido"}

        # Validar se user_id é válido
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "user_id inválido"}

        # Verificar se personagem existe e pertence ao usuário
        character = get_character_by_id(character_id)
        if not character:
            return {"success": False, "error": "Personagem não encontrado"}

        if str(character.user_id) != user_id:
            return {"success": False, "error": "Você não tem permissão para deletar este personagem"}

        # Deletar personagem
        success = delete_character(character_id)

        if success:
            return {
                "success": True,
                "message": "Personagem deletado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao deletar personagem"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def character_to_response(character: Character) -> Dict[str, Any]:
    """Converte Character para formato de resposta"""
    response = {
        "id": str(character.id),
        "user_id": str(character.user_id),
        "campaign_id": str(character.campaign_id) if character.campaign_id else None,
        "basic_info": character.basic_info.dict(),
        "attributes": character.attributes.dict(),
        "skills": character.skills.dict(),
        "stats": character.stats.dict(),
        "combat": character.combat.dict(),
        "magic": character.magic.dict()
    }

    # Incluir estatísticas calculadas se existirem
    if character.calculated_stats:
        response["calculated_stats"] = character.calculated_stats

    return response