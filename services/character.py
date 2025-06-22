from typing import Dict, Any, List, Optional
from database.schemas.character import (
    Character,
    CharacterCreate,
    CharacterResponse,
    RaceInfo,
    create_race_info_from_frontend_data,
    get_combined_ability_bonuses,
    format_race_display_name
)
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
    """Valida dados, calcula estatísticas e cria novo personagem com suporte a subraças"""
    try:
        # Validar campos obrigatórios básicos
        required_fields = ["basic_info", "attributes", "stats"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Validar informações básicas
        basic_info = data.get("basic_info", {})
        if not basic_info.get("name"):
            return {"success": False, "error": "Nome do personagem é obrigatório"}

        if not basic_info.get("race_info"):
            return {"success": False, "error": "Informações de raça são obrigatórias"}

        # Validar se user_id está presente (será adicionado pela rota)
        if "user_id" not in data:
            return {"success": False, "error": "user_id é obrigatório"}

        # Converter user_id de string para ObjectId se necessário
        if isinstance(data["user_id"], str):
            try:
                data["user_id"] = ObjectId(data["user_id"])
            except Exception:
                return {"success": False, "error": "user_id inválido"}

        # Validar se campaign_id é válido (se fornecido)
        if data.get("campaign_id"):
            if isinstance(data["campaign_id"], str):
                try:
                    data["campaign_id"] = ObjectId(data["campaign_id"])
                except Exception:
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

        # Calcular estatísticas derivadas (incluindo bônus raciais)
        calculated_stats = calculate_character_stats_with_race(temp_character)

        # Adicionar estatísticas calculadas aos dados antes de salvar
        character_data = character.dict(by_alias=True, exclude_unset=True)
        character_data["calculated_stats"] = calculated_stats

        # Criar personagem no banco com estatísticas já calculadas
        from database.repositories.character import characters_collection
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
            "character": character_to_response_with_race(character)
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
        characters_response = [character_to_response_with_race(char) for char in characters]

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
        characters_response = [character_to_response_with_race(char) for char in characters]

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

        # Converter user_id de string para ObjectId se necessário
        if data.get("user_id") and isinstance(data["user_id"], str):
            try:
                data["user_id"] = ObjectId(data["user_id"])
            except Exception:
                return {"success": False, "error": "user_id inválido"}

        # Validar se campaign_id é válido (se fornecido)
        if data.get("campaign_id"):
            if isinstance(data["campaign_id"], str):
                try:
                    data["campaign_id"] = ObjectId(data["campaign_id"])
                except Exception:
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

        # Calcular estatísticas derivadas (incluindo bônus raciais)
        calculated_stats = calculate_character_stats_with_race(temp_character)

        # Adicionar estatísticas calculadas aos dados de atualização
        update_data = character_update.dict(by_alias=True, exclude_unset=True)
        update_data["calculated_stats"] = calculated_stats

        # Atualizar personagem no banco
        from database.repositories.character import characters_collection
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


def calculate_character_stats_with_race(character: Character) -> Dict[str, Any]:
    """
    Calcula todas as estatísticas derivadas de um personagem incluindo bônus raciais
    """
    # Usar a função original de cálculo
    base_stats = calculate_character_stats(character)

    # Adicionar informações específicas de raça/subraça
    race_info = character.basic_info.race_info
    combined_bonuses = get_combined_ability_bonuses(race_info)

    # Calcular atributos finais com bônus raciais
    final_attributes = {}
    for ability, base_score in character.attributes.dict().items():
        racial_bonus = combined_bonuses.get(ability, 0)
        final_attributes[ability] = base_score + racial_bonus

    # Atualizar estatísticas com valores finais
    race_stats = {
        "race_info": {
            "display_name": format_race_display_name(race_info),
            "race_name": race_info.race_name,
            "subrace_name": race_info.subrace_name,
            "combined_bonuses": combined_bonuses,
            "racial_traits": race_info.racial_traits,
            "languages": race_info.languages,
            "proficiencies": race_info.proficiencies,
        },
        "final_attributes": final_attributes,
        "base_attributes": character.attributes.dict(),
    }

    # Combinar com estatísticas base
    return {**base_stats, **race_stats}


def character_to_response_with_race(character: Character) -> Dict[str, Any]:
    """Converte Character para formato de resposta incluindo informações de raça/subraça"""
    response = {
        "id": str(character.id),
        "user_id": str(character.user_id),
        "campaign_id": str(character.campaign_id) if character.campaign_id else None,
        "basic_info": {
            "name": character.basic_info.name,
            "race_info": {
                "race_name": character.basic_info.race_info.race_name,
                "race_index": character.basic_info.race_info.race_index,
                "subrace_name": character.basic_info.race_info.subrace_name,
                "subrace_index": character.basic_info.race_info.subrace_index,
                "display_name": format_race_display_name(character.basic_info.race_info),
                "speed": character.basic_info.race_info.speed,
                "size": character.basic_info.race_info.size,
                "ability_bonuses": character.basic_info.race_info.ability_bonuses,
                "racial_traits": character.basic_info.race_info.racial_traits,
                "languages": character.basic_info.race_info.languages,
                "proficiencies": character.basic_info.race_info.proficiencies,
            },
            "character_class": character.basic_info.character_class,
            "level": character.basic_info.level,
            "background": character.basic_info.background,
            "alignment": character.basic_info.alignment,
        },
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


def get_character_summary_with_race(character: Character) -> Dict[str, Any]:
    """Retorna resumo do personagem incluindo informações de raça/subraça"""
    return {
        "id": str(character.id),
        "user_id": str(character.user_id),
        "campaign_id": str(character.campaign_id) if character.campaign_id else None,
        "name": character.basic_info.name,
        "race_display_name": format_race_display_name(character.basic_info.race_info),
        "race_name": character.basic_info.race_info.race_name,
        "subrace_name": character.basic_info.race_info.subrace_name,
        "character_class": character.basic_info.character_class,
        "level": character.basic_info.level,
        "hit_points": character.stats.hit_points,
        "armor_class": character.stats.armor_class,
    }