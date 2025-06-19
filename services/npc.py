from typing import Dict, Any, List, Optional
from database.schemas.npc import NPC, NPCCreate, NPCResponse, NPCUpdate
from database.repositories.npc import (
    create_npc,
    get_npc_by_id,
    get_npcs_by_campaign,
    get_npcs_by_type,
    get_npcs_by_location,
    get_npcs_by_faction,
    get_active_npcs_by_campaign,
    get_alive_npcs_by_campaign,
    search_npcs_by_name,
    update_npc,
    delete_npc,
    kill_npc,
    revive_npc,
    activate_npc,
    deactivate_npc,
    add_npc_relationship,
    remove_npc_relationship,
    add_npc_ability,
    remove_npc_ability,
    add_npc_personality_trait,
    remove_npc_personality_trait,
    get_npcs_by_multiple_criteria,
    get_npc_stats_summary
)
from database.repositories.campaign import get_campaign_by_id
from pydantic import ValidationError
from bson import ObjectId


def create_npc_service(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Valida dados e cria novo NPC"""
    try:
        # Validar campos obrigatórios básicos
        required_fields = ["campaign_id", "name"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Converter campaign_id de string para ObjectId se necessário
        if isinstance(data["campaign_id"], str):
            try:
                data["campaign_id"] = ObjectId(data["campaign_id"])
            except Exception:
                return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(str(data["campaign_id"]))
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode criar NPCs"}

        # Validar dados com schema Pydantic
        try:
            npc = NPCCreate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Criar NPC no banco
        npc_id = create_npc(npc)

        return {
            "success": True,
            "npc_id": str(npc_id),
            "message": "NPC criado com sucesso"
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Busca NPC por ID com verificação de acesso"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Buscar NPC
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário tem acesso ao NPC
        if not has_npc_access(npc, user_id):
            return {"success": False, "error": "Acesso negado a este NPC"}

        return {
            "success": True,
            "npc": npc_to_response(npc, user_id)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_campaign_npcs_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Busca todos os NPCs de uma campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar NPCs
        npcs = get_npcs_by_campaign(campaign_id)

        # Converter para response format
        npcs_response = [npc_to_response(npc, user_id) for npc in npcs]

        return {
            "success": True,
            "npcs": npcs_response,
            "count": len(npcs_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npcs_by_type_service(campaign_id: str, npc_type: str, user_id: str) -> Dict[str, Any]:
    """Busca NPCs por tipo"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar NPCs
        npcs = get_npcs_by_type(campaign_id, npc_type)

        # Converter para response format
        npcs_response = [npc_to_response(npc, user_id) for npc in npcs]

        return {
            "success": True,
            "npcs": npcs_response,
            "count": len(npcs_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def search_npcs_service(campaign_id: str, query: str, user_id: str) -> Dict[str, Any]:
    """Busca NPCs por nome"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        if not query or len(query.strip()) < 2:
            return {"success": False, "error": "Query de busca deve ter pelo menos 2 caracteres"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar NPCs
        npcs = search_npcs_by_name(campaign_id, query.strip())

        # Converter para response format
        npcs_response = [npc_to_response(npc, user_id) for npc in npcs]

        return {
            "success": True,
            "npcs": npcs_response,
            "count": len(npcs_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npcs_by_location_service(campaign_id: str, location: str, user_id: str) -> Dict[str, Any]:
    """Busca NPCs por localização"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar NPCs
        npcs = get_npcs_by_location(campaign_id, location)

        # Converter para response format
        npcs_response = [npc_to_response(npc, user_id) for npc in npcs]

        return {
            "success": True,
            "npcs": npcs_response,
            "count": len(npcs_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_npc_service(npc_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Atualiza NPC existente"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        existing_npc = get_npc_by_id(npc_id)
        if not existing_npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(existing_npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode editar NPCs"}

        # Remover campos que não devem ser atualizados
        data.pop("campaign_id", None)  # Campaign ID não pode ser alterado

        # Validar dados com schema Pydantic
        try:
            npc_update = NPCUpdate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Atualizar NPC no banco
        update_data = npc_update.dict(exclude_unset=True)
        success = update_npc(npc_id, update_data)

        if success:
            return {
                "success": True,
                "message": "NPC atualizado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar NPC"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Remove NPC (apenas GM pode deletar)"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode deletar NPCs"}

        # Deletar NPC
        success = delete_npc(npc_id)

        if success:
            return {
                "success": True,
                "message": "NPC deletado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao deletar NPC"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def kill_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Marca NPC como morto (apenas GM)"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode alterar status dos NPCs"}

        # Verificar se NPC já está morto
        if not npc.is_alive:
            return {"success": False, "error": "NPC já está morto"}

        # Marcar como morto
        success = kill_npc(npc_id)

        if success:
            return {
                "success": True,
                "message": "NPC marcado como morto"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar status do NPC"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def revive_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Marca NPC como vivo (apenas GM)"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode alterar status dos NPCs"}

        # Verificar se NPC já está vivo
        if npc.is_alive:
            return {"success": False, "error": "NPC já está vivo"}

        # Marcar como vivo
        success = revive_npc(npc_id)

        if success:
            return {
                "success": True,
                "message": "NPC revivido com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar status do NPC"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_npc_relationship_service(npc_id: str, target_name: str, relationship_type: str, user_id: str) -> Dict[str, Any]:
    """Adiciona relacionamento ao NPC (apenas GM)"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode editar relacionamentos"}

        # Validar campos
        if not target_name or not relationship_type:
            return {"success": False, "error": "Nome do alvo e tipo de relacionamento são obrigatórios"}

        # Adicionar relacionamento
        success = add_npc_relationship(npc_id, target_name, relationship_type)

        if success:
            return {
                "success": True,
                "message": "Relacionamento adicionado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar relacionamento"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_npc_ability_service(npc_id: str, ability_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Adiciona habilidade ao NPC (apenas GM)"""
    try:
        # Validar se npc_id é válido
        if not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID de NPC inválido"}

        # Verificar se NPC existe
        npc = get_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se o usuário é o GM da campanha
        campaign = get_campaign_by_id(str(npc.campaign_id))
        if not campaign or str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode editar habilidades"}

        # Validar campos obrigatórios
        if not ability_data.get("name") or not ability_data.get("description"):
            return {"success": False, "error": "Nome e descrição da habilidade são obrigatórios"}

        # Adicionar habilidade
        success = add_npc_ability(npc_id, ability_data)

        if success:
            return {
                "success": True,
                "message": "Habilidade adicionada com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar habilidade"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npc_stats_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Busca estatísticas dos NPCs da campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar estatísticas
        stats = get_npc_stats_summary(campaign_id)

        return {
            "success": True,
            "stats": stats
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npcs_filtered_service(
        campaign_id: str,
        user_id: str,
        npc_type: Optional[str] = None,
        location: Optional[str] = None,
        faction: Optional[str] = None,
        is_alive: Optional[bool] = None,
        is_active: Optional[bool] = None
) -> Dict[str, Any]:
    """Busca NPCs com múltiplos filtros"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "campaign_id inválido"}

        # Verificar se a campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar NPCs com filtros
        npcs = get_npcs_by_multiple_criteria(
            campaign_id=campaign_id,
            npc_type=npc_type,
            location=location,
            faction=faction,
            is_alive=is_alive,
            is_active=is_active
        )

        # Converter para response format
        npcs_response = [npc_to_response(npc, user_id) for npc in npcs]

        return {
            "success": True,
            "npcs": npcs_response,
            "count": len(npcs_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# FUNÇÕES AUXILIARES
# ================================

def has_npc_access(npc: NPC, user_id: str) -> bool:
    """Verifica se o usuário tem acesso ao NPC"""
    # Buscar a campanha do NPC
    campaign = get_campaign_by_id(str(npc.campaign_id))
    if not campaign:
        return False

    return has_campaign_access(campaign, user_id)


def has_campaign_access(campaign, user_id: str) -> bool:
    """Verifica se o usuário tem acesso à campanha"""
    # GM sempre tem acesso
    if str(campaign.game_master_id) == user_id:
        return True

    # Campanha pública pode ser vista por todos
    if campaign.is_public:
        return True

    # Jogadores da campanha têm acesso
    for player in campaign.players:
        if str(player.user_id) == user_id:
            return True

    return False


def npc_to_response(npc: NPC, user_id: str) -> Dict[str, Any]:
    """Converte NPC para formato de resposta"""
    # Buscar a campanha para verificar permissões
    campaign = get_campaign_by_id(str(npc.campaign_id))
    is_gm = campaign and str(campaign.game_master_id) == user_id

    response = {
        "id": str(npc.id),
        "campaign_id": str(npc.campaign_id),
        "name": npc.name,
        "description": npc.description,
        "race": npc.race,
        "npc_class": npc.npc_class,
        "npc_type": npc.npc_type,
        "alignment": npc.alignment,
        "location": npc.location,
        "occupation": npc.occupation,
        "faction": npc.faction,
        "personality_traits": npc.personality_traits,
        "goals": npc.goals,
        "is_alive": npc.is_alive,
        "is_active": npc.is_active,
        "created_date": npc.created_date,
        "updated_date": npc.updated_date
    }

    # Informações de combate para todos
    if npc.stats:
        response["stats"] = npc.stats.dict()

    response["challenge_rating"] = npc.challenge_rating
    response["abilities"] = [ability.dict() for ability in npc.abilities]

    # Informações sensíveis apenas para o GM
    if is_gm:
        response["secrets"] = npc.secrets
        response["gm_notes"] = npc.gm_notes
        response["relationships"] = npc.relationships
    else:
        # Jogadores não veem segredos, notas do GM ou alguns relacionamentos
        response["secrets"] = None
        response["gm_notes"] = None
        # Mostrar apenas relacionamentos que não sejam secretos
        response["relationships"] = {
            name: rel_type for name, rel_type in npc.relationships.items()
            if rel_type not in ["segredo", "conspiração", "plano_secreto"]
        }

    return response