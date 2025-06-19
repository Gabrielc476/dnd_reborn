from typing import Dict, Any, List, Optional
from database.schemas.campaign import Campaign, CampaignCreate, CampaignResponse, CampaignUpdate
from database.repositories.campaign import (
    create_campaign,
    get_campaign_by_id,
    get_campaigns_by_gm,
    get_campaigns_by_player,
    get_public_campaigns,
    get_campaigns_by_status,
    search_campaigns_by_name,
    update_campaign,
    delete_campaign,
    add_player_to_campaign,
    remove_player_from_campaign,
    update_player_in_campaign,
    is_user_in_campaign,
    is_campaign_full,
    add_encounter_to_campaign,
    update_encounter_in_campaign,
    remove_encounter_from_campaign,
    add_loot_to_campaign,
    update_loot_in_campaign,
    remove_loot_from_campaign,
    assign_loot_to_player,
    get_campaign_summary_stats
)
from pydantic import ValidationError
from bson import ObjectId


def create_campaign_service(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida dados e cria nova campanha"""
    try:
        # Validar campos obrigatórios básicos
        required_fields = ["name", "game_master_id"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Converter game_master_id de string para ObjectId se necessário
        if isinstance(data["game_master_id"], str):
            try:
                data["game_master_id"] = ObjectId(data["game_master_id"])
            except Exception:
                return {"success": False, "error": "game_master_id inválido"}

        # Validar dados com schema Pydantic
        try:
            campaign = CampaignCreate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Criar campanha no banco
        campaign_id = create_campaign(campaign)

        return {
            "success": True,
            "campaign_id": str(campaign_id),
            "message": "Campanha criada com sucesso"
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_campaign_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Busca campanha por ID com verificação de acesso"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Buscar campanha
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        return {
            "success": True,
            "campaign": campaign_to_response(campaign)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_gm_campaigns_service(gm_id: str) -> Dict[str, Any]:
    """Busca todas as campanhas de um Game Master"""
    try:
        # Validar se gm_id é válido
        if not ObjectId.is_valid(gm_id):
            return {"success": False, "error": "gm_id inválido"}

        # Buscar campanhas
        campaigns = get_campaigns_by_gm(gm_id)

        # Converter para response format
        campaigns_response = [campaign_to_response(camp) for camp in campaigns]

        return {
            "success": True,
            "campaigns": campaigns_response,
            "count": len(campaigns_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_player_campaigns_service(user_id: str) -> Dict[str, Any]:
    """Busca todas as campanhas onde o usuário é jogador"""
    try:
        # Validar se user_id é válido
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "user_id inválido"}

        # Buscar campanhas
        campaigns = get_campaigns_by_player(user_id)

        # Converter para response format
        campaigns_response = [campaign_to_response(camp) for camp in campaigns]

        return {
            "success": True,
            "campaigns": campaigns_response,
            "count": len(campaigns_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_public_campaigns_service() -> Dict[str, Any]:
    """Busca todas as campanhas públicas"""
    try:
        # Buscar campanhas públicas
        campaigns = get_public_campaigns()

        # Converter para response format (ocultar informações sensíveis)
        campaigns_response = []
        for camp in campaigns:
            response = campaign_to_response(camp)
            # Remover notas do GM para campanhas públicas
            response.pop("gm_notes", None)
            campaigns_response.append(response)

        return {
            "success": True,
            "campaigns": campaigns_response,
            "count": len(campaigns_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def search_campaigns_service(query: str, user_id: str) -> Dict[str, Any]:
    """Busca campanhas por nome"""
    try:
        if not query or len(query.strip()) < 2:
            return {"success": False, "error": "Query de busca deve ter pelo menos 2 caracteres"}

        # Buscar campanhas
        campaigns = search_campaigns_by_name(query.strip())

        # Filtrar apenas campanhas que o usuário pode ver
        accessible_campaigns = []
        for campaign in campaigns:
            if campaign.is_public or has_campaign_access(campaign, user_id):
                accessible_campaigns.append(campaign)

        # Converter para response format
        campaigns_response = [campaign_to_response(camp) for camp in accessible_campaigns]

        return {
            "success": True,
            "campaigns": campaigns_response,
            "count": len(campaigns_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_campaign_service(campaign_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Atualiza campanha existente"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        existing_campaign = get_campaign_by_id(campaign_id)
        if not existing_campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(existing_campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode editar a campanha"}

        # Remover campos que não devem ser atualizados
        data.pop("game_master_id", None)  # GM não pode ser alterado
        data.pop("players", None)  # Jogadores são gerenciados por endpoints específicos

        # Validar dados com schema Pydantic
        try:
            campaign_update = CampaignUpdate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Atualizar campanha no banco
        update_data = campaign_update.dict(exclude_unset=True)
        success = update_campaign(campaign_id, update_data)

        if success:
            return {
                "success": True,
                "message": "Campanha atualizada com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_campaign_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Remove campanha (apenas o GM pode deletar)"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode deletar a campanha"}

        # Deletar campanha
        success = delete_campaign(campaign_id)

        if success:
            return {
                "success": True,
                "message": "Campanha deletada com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao deletar campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def join_campaign_service(campaign_id: str, user_id: str, character_id: Optional[str] = None) -> Dict[str, Any]:
    """Adiciona jogador à campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Validar se user_id é válido
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "user_id inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se a campanha está aceitando jogadores
        if campaign.status != "recrutando":
            return {"success": False, "error": "Campanha não está aceitando novos jogadores"}

        # Verificar se o usuário já está na campanha
        if is_user_in_campaign(campaign_id, user_id):
            return {"success": False, "error": "Usuário já está nesta campanha"}

        # Verificar se a campanha não está cheia
        if is_campaign_full(campaign_id):
            return {"success": False, "error": "Campanha está cheia"}

        # Verificar se o usuário não é o GM
        if str(campaign.game_master_id) == user_id:
            return {"success": False, "error": "Game Master não pode ser jogador da própria campanha"}

        # Validar character_id se fornecido
        if character_id:
            if not ObjectId.is_valid(character_id):
                return {"success": False, "error": "character_id inválido"}
            character_id = ObjectId(character_id)

        # Preparar dados do jogador
        player_data = {
            "user_id": ObjectId(user_id),
            "character_id": character_id,
            "is_active": True,
            "notes": None
        }

        # Adicionar jogador à campanha
        success = add_player_to_campaign(campaign_id, player_data)

        if success:
            return {
                "success": True,
                "message": "Entrou na campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao entrar na campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def leave_campaign_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Remove jogador da campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se usuário está na campanha
        if not is_user_in_campaign(campaign_id, user_id):
            return {"success": False, "error": "Usuário não está nesta campanha"}

        # Remover jogador da campanha
        success = remove_player_from_campaign(campaign_id, user_id)

        if success:
            return {
                "success": True,
                "message": "Saiu da campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao sair da campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_encounter_service(campaign_id: str, encounter_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Adiciona encontro à campanha (apenas GM)"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode adicionar encontros"}

        # Validar campos obrigatórios
        if not encounter_data.get("name"):
            return {"success": False, "error": "Nome do encontro é obrigatório"}

        # Adicionar encontro
        success = add_encounter_to_campaign(campaign_id, encounter_data)

        if success:
            return {
                "success": True,
                "message": "Encontro adicionado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar encontro"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_loot_service(campaign_id: str, loot_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Adiciona loot à campanha (apenas GM)"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode adicionar loot"}

        # Validar campos obrigatórios
        if not loot_data.get("name"):
            return {"success": False, "error": "Nome do item é obrigatório"}

        # Adicionar loot
        success = add_loot_to_campaign(campaign_id, loot_data)

        if success:
            return {
                "success": True,
                "message": "Loot adicionado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar loot"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def assign_loot_service(campaign_id: str, loot_name: str, player_id: str, user_id: str) -> Dict[str, Any]:
    """Atribui loot a um jogador (apenas GM)"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode atribuir loot"}

        # Verificar se o player_id é válido
        if not ObjectId.is_valid(player_id):
            return {"success": False, "error": "player_id inválido"}

        # Verificar se o jogador está na campanha
        if not is_user_in_campaign(campaign_id, player_id):
            return {"success": False, "error": "Jogador não está nesta campanha"}

        # Atribuir loot
        success = assign_loot_to_player(campaign_id, loot_name, player_id)

        if success:
            return {
                "success": True,
                "message": "Loot atribuído com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atribuir loot"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_campaign_stats_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Busca estatísticas da campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado a esta campanha"}

        # Buscar estatísticas
        stats = get_campaign_summary_stats(campaign_id)

        return {
            "success": True,
            "stats": stats
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# FUNÇÕES AUXILIARES
# ================================

def has_campaign_access(campaign: Campaign, user_id: str) -> bool:
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


def campaign_to_response(campaign: Campaign) -> Dict[str, Any]:
    """Converte Campaign para formato de resposta"""
    response = {
        "id": str(campaign.id),
        "name": campaign.name,
        "description": campaign.description,
        "game_master_id": str(campaign.game_master_id),
        "players": [
            {
                "user_id": str(player.user_id),
                "character_id": str(player.character_id) if player.character_id else None,
                "joined_date": player.joined_date,
                "is_active": player.is_active,
                "notes": player.notes
            } for player in campaign.players
        ],
        "max_players": campaign.max_players,
        "status": campaign.status,
        "setting": campaign.setting,
        "world_name": campaign.world_name,
        "npcs": [str(npc_id) for npc_id in campaign.npcs],
        "encounters": [encounter.dict() for encounter in campaign.encounters],
        "loot": [loot.dict() for loot in campaign.loot],
        "created_date": campaign.created_date,
        "updated_date": campaign.updated_date,
        "tags": campaign.tags,
        "is_public": campaign.is_public,
        "recruitment_message": campaign.recruitment_message,
        "gm_notes": campaign.gm_notes
    }

    return response