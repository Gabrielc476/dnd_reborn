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
            return {"success": False, "error": "Acesso negado"}

        # Converter para response format
        campaign_response = campaign_to_response(campaign)

        # Se não for GM, remover notas privadas
        if str(campaign.game_master_id) != user_id:
            campaign_response.pop("gm_notes", None)

        return {
            "success": True,
            "campaign": campaign_response
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_gm_campaigns_service(user_id: str) -> Dict[str, Any]:
    """Busca campanhas onde o usuário é Game Master"""
    try:
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "ID de usuário inválido"}

        # Buscar campanhas
        campaigns = get_campaigns_by_gm(ObjectId(user_id))

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
    """Busca campanhas onde o usuário é jogador"""
    try:
        if not ObjectId.is_valid(user_id):
            return {"success": False, "error": "ID de usuário inválido"}

        # Buscar campanhas
        campaigns = get_campaigns_by_player(ObjectId(user_id))

        # Converter para response format e remover notas do GM
        campaigns_response = []
        for camp in campaigns:
            response = campaign_to_response(camp)
            response.pop("gm_notes", None)
            campaigns_response.append(response)

        return {
            "success": True,
            "campaigns": campaigns_response,
            "count": len(campaigns_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_public_campaigns_service() -> Dict[str, Any]:
    """Busca campanhas públicas"""
    try:
        # Buscar campanhas públicas
        campaigns = get_public_campaigns()

        # Converter para response format e remover notas do GM
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

        # Validar dados de atualização
        try:
            campaign_update = CampaignUpdate(**data)
        except ValidationError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

        # Atualizar campanha
        success = update_campaign(campaign_id, data)

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
    """Deleta campanha existente"""
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
    """Service para usuário entrar em uma campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se a campanha é pública
        if not campaign.is_public:
            return {"success": False, "error": "Esta campanha não está aberta para novos jogadores"}

        # Verificar se o usuário já está na campanha
        if is_user_in_campaign(campaign_id, user_id):
            return {"success": False, "error": "Você já é membro desta campanha"}

        # Verificar se a campanha não está cheia
        if is_campaign_full(campaign_id):
            return {"success": False, "error": "Campanha já atingiu o número máximo de jogadores"}

        # Preparar dados do jogador
        player_data = {
            "user_id": ObjectId(user_id),
            "character_id": ObjectId(character_id) if character_id else None,
            "notes": "",
            "is_active": True
        }

        # Adicionar jogador à campanha
        success = add_player_to_campaign(campaign_id, player_data)

        if success:
            return {
                "success": True,
                "message": "Você entrou na campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao entrar na campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def leave_campaign_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Service para usuário sair de uma campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM (GM não pode sair da própria campanha)
        if str(campaign.game_master_id) == user_id:
            return {"success": False, "error": "Game Master não pode sair da própria campanha"}

        # Verificar se o usuário está na campanha
        if not is_user_in_campaign(campaign_id, user_id):
            return {"success": False, "error": "Você não é membro desta campanha"}

        # Remover jogador da campanha
        success = remove_player_from_campaign(campaign_id, user_id)

        if success:
            return {
                "success": True,
                "message": "Você saiu da campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao sair da campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# PLAYER MANAGEMENT SERVICES - NOVOS SERVICES
# ================================

def add_player_to_campaign_service(campaign_id: str, target_user_id: str, data: Dict[str, Any],
                                   requester_user_id: str) -> Dict[str, Any]:
    """Service para GM adicionar jogador à campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o solicitante é o GM da campanha
        if str(campaign.game_master_id) != requester_user_id:
            return {"success": False, "error": "Apenas o Game Master pode adicionar jogadores"}

        # Verificar se a campanha não está cheia
        if is_campaign_full(campaign_id):
            return {"success": False, "error": "Campanha já atingiu o número máximo de jogadores"}

        # Verificar se o usuário já está na campanha
        if is_user_in_campaign(campaign_id, target_user_id):
            return {"success": False, "error": "Usuário já é membro desta campanha"}

        # Preparar dados do jogador
        player_data = {
            "user_id": ObjectId(target_user_id),
            "character_id": ObjectId(data.get("character_id")) if data.get("character_id") else None,
            "notes": data.get("notes", ""),
            "is_active": True
        }

        # Adicionar jogador à campanha
        success = add_player_to_campaign(campaign_id, player_data)

        if success:
            return {
                "success": True,
                "message": "Jogador adicionado à campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar jogador à campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def remove_player_from_campaign_service(campaign_id: str, player_id: str, requester_user_id: str) -> Dict[str, Any]:
    """Service para GM remover jogador da campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o solicitante é o GM da campanha
        if str(campaign.game_master_id) != requester_user_id:
            return {"success": False, "error": "Apenas o Game Master pode remover jogadores"}

        # Verificar se o jogador está na campanha
        if not is_user_in_campaign(campaign_id, player_id):
            return {"success": False, "error": "Usuário não é membro desta campanha"}

        # Remover jogador da campanha
        success = remove_player_from_campaign(campaign_id, player_id)

        if success:
            return {
                "success": True,
                "message": "Jogador removido da campanha com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao remover jogador da campanha"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_player_in_campaign_service(campaign_id: str, player_id: str, data: Dict[str, Any], requester_user_id: str) -> \
Dict[str, Any]:
    """Service para GM atualizar informações do jogador na campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o solicitante é o GM da campanha
        if str(campaign.game_master_id) != requester_user_id:
            return {"success": False, "error": "Apenas o Game Master pode atualizar informações de jogadores"}

        # Verificar se o jogador está na campanha
        if not is_user_in_campaign(campaign_id, player_id):
            return {"success": False, "error": "Usuário não é membro desta campanha"}

        # Preparar dados de atualização (apenas campos permitidos)
        allowed_fields = ["character_id", "notes", "is_active"]
        update_data = {}

        for field in allowed_fields:
            if field in data:
                if field == "character_id" and data[field]:
                    update_data[field] = ObjectId(data[field])
                else:
                    update_data[field] = data[field]

        # Se não há dados para atualizar
        if not update_data:
            return {"success": False, "error": "Nenhum dado válido para atualização"}

        # Atualizar jogador na campanha
        success = update_player_in_campaign(campaign_id, player_id, update_data)

        if success:
            return {
                "success": True,
                "message": "Informações do jogador atualizadas com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao atualizar informações do jogador"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# ENCOUNTER MANAGEMENT SERVICES
# ================================

def add_encounter_service(campaign_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para adicionar encontro à campanha"""
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
            return {"success": False, "error": "Apenas o Game Master pode adicionar encontros"}

        # Validar campos obrigatórios
        required_fields = ["name", "description"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # ✅ GARANTIR que created_date seja adicionado
        from datetime import datetime
        if "created_date" not in data:
            data["created_date"] = datetime.utcnow()

        # Adicionar encontro à campanha
        success = add_encounter_to_campaign(campaign_id, data)

        if success:
            return {
                "success": True,
                "message": "Encontro adicionado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar encontro"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# LOOT MANAGEMENT SERVICES
# ================================

def add_loot_service(campaign_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para adicionar loot à campanha"""
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
            return {"success": False, "error": "Apenas o Game Master pode adicionar loot"}

        # Validar campos obrigatórios
        required_fields = ["name", "description"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Adicionar loot à campanha
        success = add_loot_to_campaign(campaign_id, data)

        if success:
            return {
                "success": True,
                "message": "Item de loot adicionado com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao adicionar loot"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def assign_loot_service(campaign_id: str, loot_name: str, player_id: str, user_id: str) -> Dict[str, Any]:
    """Service para atribuir loot a um jogador"""
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
            return {"success": False, "error": "Apenas o Game Master pode atribuir loot"}

        # Verificar se o jogador está na campanha
        if not is_user_in_campaign(campaign_id, player_id):
            return {"success": False, "error": "Jogador não é membro desta campanha"}

        # Atribuir loot ao jogador
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
    """Service para obter estatísticas da campanha"""
    try:
        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário tem acesso à campanha
        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado"}

        # Obter estatísticas
        stats = get_campaign_summary_stats(campaign_id)

        return {
            "success": True,
            "stats": stats
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# NPC ENHANCED SERVICES - NOVOS SERVICES
# ================================

def create_enhanced_npc_service(campaign_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para criar NPC Enhanced"""
    try:
        from database.repositories.enhanced_npc import create_enhanced_npc
        from database.schemas.enhanced_npc import EnhancedNPCCreate

        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode criar NPCs"}

        # Garantir que o campaign_id seja usado
        data['campaign_id'] = campaign_id

        # Validar e criar NPC
        try:
            npc_data = EnhancedNPCCreate(**data)
            npc_id = create_enhanced_npc(npc_data)

            return {
                "success": True,
                "message": f"NPC {data.get('name')} criado com sucesso",
                "npc_id": str(npc_id)
            }
        except ValueError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_enhanced_npcs_service(
        campaign_id: str,
        user_id: str,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        per_page: int = 50
) -> Dict[str, Any]:
    """Service para buscar NPCs Enhanced da campanha"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npcs_by_campaign
        from database.schemas.enhanced_npc import NPCSearchFilters

        # Validar se campaign_id é válido
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        # Verificar se campanha existe e usuário tem acesso
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado"}

        # Criar objeto NPCSearchFilters a partir do dicionário
        try:
            npc_filters = NPCSearchFilters(**filters) if filters else NPCSearchFilters()
        except ValueError as e:
            return {"success": False, "error": f"Filtros inválidos: {str(e)}"}

        # Buscar NPCs
        search_result = get_enhanced_npcs_by_campaign(campaign_id, npc_filters, page, per_page)

        # Converter NPCs para dicionários
        npcs_data = []
        is_gm = str(campaign.game_master_id) == user_id

        for npc in search_result.npcs:
            # Use model_dump for Pydantic v2 or dict() for v1
            npc_dict = npc.model_dump() if hasattr(npc, 'model_dump') else npc.dict()

            # Se não é GM, remover informações sensíveis
            if not is_gm:
                npc_dict.pop('gm_notes', None)
                npc_dict.pop('secrets', None)

            npcs_data.append(npc_dict)

        return {
            "success": True,
            "npcs": npcs_data,
            "total": search_result.total,
            "page": search_result.page,
            "per_page": search_result.per_page,
            "count": len(npcs_data)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_enhanced_npc_service(campaign_id: str, npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPC Enhanced específico"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe e usuário tem acesso
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado"}

        # Buscar NPC
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        # Verificar se pertence à campanha
        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        # Convert to dict properly
        npc_data = npc.model_dump() if hasattr(npc, 'model_dump') else npc.dict()

        # Se não é GM, remover informações sensíveis
        is_gm = str(campaign.game_master_id) == user_id
        if not is_gm:
            npc_data.pop('gm_notes', None)
            npc_data.pop('secrets', None)

        return {
            "success": True,
            "npc": npc_data
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}

def update_enhanced_npc_service(campaign_id: str, npc_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para atualizar NPC Enhanced"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id, update_enhanced_npc
        from database.schemas.enhanced_npc import EnhancedNPCUpdate

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode atualizar NPCs"}

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        # Atualizar NPC
        try:
            update_data = EnhancedNPCUpdate(**data)
            success = update_enhanced_npc(npc_id, update_data)

            if success:
                return {
                    "success": True,
                    "message": "NPC atualizado com sucesso"
                }
            else:
                return {"success": False, "error": "Falha ao atualizar NPC"}

        except ValueError as e:
            return {"success": False, "error": f"Dados inválidos: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_enhanced_npc_service(campaign_id: str, npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para deletar NPC Enhanced"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id, delete_enhanced_npc

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode deletar NPCs"}

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        success = delete_enhanced_npc(npc_id)

        if success:
            return {
                "success": True,
                "message": "NPC removido com sucesso"
            }
        else:
            return {"success": False, "error": "Falha ao remover NPC"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def roll_dice_for_npc_service(campaign_id: str, npc_id: str, roll_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para executar rolagem de dados para NPC"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id, roll_dice_for_npc
        from database.schemas.enhanced_npc import DiceRollRequest

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe e usuário tem acesso
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        if not has_campaign_access(campaign, user_id):
            return {"success": False, "error": "Acesso negado"}

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        # Executar rolagem
        try:
            roll_request = DiceRollRequest(**roll_data)
            result = roll_dice_for_npc(npc_id, roll_request)

            return {
                "success": True,
                "roll_result": result
            }

        except ValueError as e:
            return {"success": False, "error": f"Dados de rolagem inválidos: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def cast_spell_for_npc_service(campaign_id: str, npc_id: str, spell_data: Dict[str, Any], user_id: str) -> Dict[
    str, Any]:
    """Service para lançar magia para NPC"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id, cast_spell_for_npc
        from database.schemas.enhanced_npc import CastSpellRequest

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha (apenas GM pode lançar magias)
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode lançar magias"}

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        # Lançar magia
        try:
            spell_request = CastSpellRequest(**spell_data)
            result = cast_spell_for_npc(npc_id, spell_request)

            return {
                "success": True,
                "spell_result": result
            }

        except ValueError as e:
            return {"success": False, "error": f"Dados da magia inválidos: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_npc_hit_points_service(campaign_id: str, npc_id: str, hp_data: Dict[str, Any], user_id: str) -> Dict[
    str, Any]:
    """Service para atualizar pontos de vida do NPC"""
    try:
        from database.repositories.enhanced_npc import get_enhanced_npc_by_id, update_npc_hit_points
        from database.schemas.enhanced_npc import UpdateHitPointsRequest

        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(npc_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se o usuário é o GM da campanha
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o Game Master pode atualizar pontos de vida"}

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return {"success": False, "error": "NPC não encontrado"}

        if str(npc.campaign_id) != campaign_id:
            return {"success": False, "error": "NPC não pertence a esta campanha"}

        # Atualizar pontos de vida
        try:
            hp_request = UpdateHitPointsRequest(**hp_data)
            result = update_npc_hit_points(npc_id, hp_request)

            return {
                "success": True,
                "new_hit_points": result["current_hit_points"],
                "hit_points_change": result["hit_points_change"],
                "status": result["status"]
            }

        except ValueError as e:
            return {"success": False, "error": f"Dados dos pontos de vida inválidos: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# NPC LEGACY SERVICES - FUNÇÕES EXISTENTES (MANTIDAS)
# ================================

def create_npc_service(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para criar NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import create_npc_service as legacy_create_npc

        # Chamar service legado existente
        return legacy_create_npc(data, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_campaign_npcs_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPCs legados da campanha"""
    try:
        # Importar dependências do NPC legado
        from services.npc import get_campaign_npcs_service as legacy_get_npcs

        # Chamar service legado existente
        return legacy_get_npcs(campaign_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPC legado específico"""
    try:
        # Importar dependências do NPC legado
        from services.npc import get_npc_service as legacy_get_npc

        # Chamar service legado existente
        return legacy_get_npc(npc_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_npc_service(npc_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Service para atualizar NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import update_npc_service as legacy_update_npc

        # Chamar service legado existente
        return legacy_update_npc(npc_id, data, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para deletar NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import delete_npc_service as legacy_delete_npc

        # Chamar service legado existente
        return legacy_delete_npc(npc_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def kill_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para matar NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import kill_npc_service as legacy_kill_npc

        # Chamar service legado existente
        return legacy_kill_npc(npc_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def revive_npc_service(npc_id: str, user_id: str) -> Dict[str, Any]:
    """Service para reviver NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import revive_npc_service as legacy_revive_npc

        # Chamar service legado existente
        return legacy_revive_npc(npc_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_npc_relationship_service(npc_id: str, target_name: str, relationship_type: str, user_id: str) -> Dict[str, Any]:
    """Service para adicionar relacionamento ao NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import add_npc_relationship_service as legacy_add_relationship

        # Chamar service legado existente
        return legacy_add_relationship(npc_id, target_name, relationship_type, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def add_npc_ability_service(npc_id: str, ability_name: str, ability_description: str, user_id: str) -> Dict[str, Any]:
    """Service para adicionar habilidade ao NPC legado"""
    try:
        # Importar dependências do NPC legado
        from services.npc import add_npc_ability_service as legacy_add_ability

        # Chamar service legado existente
        return legacy_add_ability(npc_id, ability_name, ability_description, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npcs_by_type_service(campaign_id: str, npc_type: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPCs legados por tipo"""
    try:
        # Importar dependências do NPC legado
        from services.npc import get_npcs_by_type_service as legacy_get_by_type

        # Chamar service legado existente
        return legacy_get_by_type(campaign_id, npc_type, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npcs_by_location_service(campaign_id: str, location: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPCs legados por localização"""
    try:
        # Importar dependências do NPC legado
        from services.npc import get_npcs_by_location_service as legacy_get_by_location

        # Chamar service legado existente
        return legacy_get_by_location(campaign_id, location, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def search_npcs_service(campaign_id: str, query: str, user_id: str) -> Dict[str, Any]:
    """Service para buscar NPCs legados por nome"""
    try:
        # Importar dependências do NPC legado
        from services.npc import search_npcs_service as legacy_search_npcs

        # Chamar service legado existente
        return legacy_search_npcs(campaign_id, query, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_npc_stats_service(campaign_id: str, user_id: str) -> Dict[str, Any]:
    """Service para obter estatísticas dos NPCs legados"""
    try:
        # Importar dependências do NPC legado
        from services.npc import get_npc_stats_service as legacy_get_stats

        # Chamar service legado existente
        return legacy_get_stats(campaign_id, user_id)

    except ImportError:
        return {"success": False, "error": "Service de NPC legado não encontrado"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


# ================================
# HELPER FUNCTIONS
# ================================

def has_campaign_access(campaign: Campaign, user_id: str) -> bool:
    """Verifica se o usuário tem acesso à campanha"""
    # GM sempre tem acesso
    if str(campaign.game_master_id) == user_id:
        return True

    # Verificar se é jogador
    for player in campaign.players:
        if str(player.user_id) == user_id and player.is_active:
            return True

    # Se campanha é pública, qualquer um pode ver
    if campaign.is_public:
        return True

    return False


def campaign_to_response(campaign: Campaign) -> Dict[str, Any]:
    """Converte objeto Campaign para formato de response"""
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "description": campaign.description,
        "game_master_id": str(campaign.game_master_id),
        "setting": campaign.setting,
        "world_name": campaign.world_name,
        "max_players": campaign.max_players,
        "tags": campaign.tags,
        "is_public": campaign.is_public,
        "status": campaign.status,
        "recruitment_message": campaign.recruitment_message,
        "gm_notes": campaign.gm_notes,
        "players": [
            {
                "user_id": str(player.user_id),
                "character_id": str(player.character_id) if player.character_id else None,
                "notes": player.notes,
                "is_active": player.is_active,
                "joined_date": player.joined_date.isoformat() if player.joined_date else None
            }
            for player in campaign.players
        ],
        "encounters": [
            {
                "name": encounter.name,
                "description": encounter.description,
                "difficulty": encounter.difficulty,
                "is_completed": encounter.is_completed,
                "created_date": encounter.created_date.isoformat() if encounter.created_date else None
            }
            for encounter in campaign.encounters
        ],
        "loot": [
            {
                "name": loot.name,
                "description": loot.description,
                "item_type": loot.item_type,
                "rarity": loot.rarity,
                "value": loot.value,
                "quantity": loot.quantity,
                "assigned_to_player": str(loot.assigned_to_player) if loot.assigned_to_player else None
            }
            for loot in campaign.loot
        ],
        "npcs": [str(npc_id) for npc_id in campaign.npcs],
        "created_date": campaign.created_date.isoformat() if campaign.created_date else None,
        "updated_date": campaign.updated_date.isoformat() if campaign.updated_date else None
    }


def is_campaign_full(campaign_id: str) -> bool:
    """Verifica se a campanha atingiu o limite máximo de jogadores"""
    try:
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return True  # Se não encontrar, considerar "cheia" por segurança

        current_players = len([p for p in campaign.players if p.is_active])
        return current_players >= campaign.max_players
    except Exception:
        return True  # Em caso de erro, considerar "cheia" por segurança