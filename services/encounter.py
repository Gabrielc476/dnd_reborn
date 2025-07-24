from database.repositories.campaign import (
    get_campaign_by_id,
    get_encounter_from_campaign,
    update_encounter_in_campaign,
    remove_encounter_from_campaign
)
from bson import ObjectId


def get_encounter_service(campaign_id: str, encounter_id: str, user_id: str) -> dict:
    """
    Busca um encontro específico de uma campanha

    Args:
        campaign_id: ID da campanha
        encounter_id: ID do encontro
        user_id: ID do usuário solicitante

    Returns:
        dict: Resultado com success e dados do encontro ou erro
    """
    try:
        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(encounter_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se usuário tem acesso
        if str(campaign.game_master_id) != user_id:
            for player in campaign.players:
                if str(player.user_id) == user_id and player.is_active:
                    break
            else:
                return {"success": False, "error": "Acesso negado"}

        # Buscar encontro
        encounter = get_encounter_from_campaign(campaign_id, encounter_id)
        if not encounter:
            return {"success": False, "error": "Encontro não encontrado"}

        return {
            "success": True,
            "encounter": encounter.dict()
        }
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_encounters_service(campaign_id: str, user_id: str) -> dict:
    """
    Busca todos os encontros de uma campanha

    Args:
        campaign_id: ID da campanha
        user_id: ID do usuário solicitante

    Returns:
        dict: Resultado com success e lista de encontros ou erro
    """
    try:
        if not ObjectId.is_valid(campaign_id):
            return {"success": False, "error": "ID de campanha inválido"}

        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar acesso
        if str(campaign.game_master_id) != user_id:
            for player in campaign.players:
                if str(player.user_id) == user_id and player.is_active:
                    break
            else:
                return {"success": False, "error": "Acesso negado"}

        # Retornar encontros simplificados
        encounters = []
        for enc in campaign.encounters:
            encounters.append({
                "id": str(enc.id),
                "name": enc.name,
                "description": enc.description,
                "difficulty": enc.difficulty,
                "is_completed": enc.is_completed,
                "session_number": enc.session_number,
                "created_date": enc.created_date.isoformat()
            })

        return {
            "success": True,
            "encounters": encounters,
            "count": len(encounters)
        }
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def update_encounter_service(campaign_id: str, encounter_id: str, data: dict, user_id: str) -> dict:
    """
    Atualiza um encontro específico

    Args:
        campaign_id: ID da campanha
        encounter_id: ID do encontro
        data: Dados para atualização
        user_id: ID do usuário solicitante

    Returns:
        dict: Resultado com success e mensagem ou erro
    """
    try:
        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(encounter_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se usuário é GM
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o GM pode editar encontros"}

        # Campos permitidos para atualização
        allowed_fields = [
            "name", "description", "difficulty", "location",
            "rewards_xp", "is_completed", "session_number", "notes"
        ]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        # Atualizar encontro
        success = update_encounter_in_campaign(campaign_id, encounter_id, update_data)

        if success:
            return {"success": True, "message": "Encontro atualizado com sucesso"}
        return {"success": False, "error": "Falha ao atualizar encontro"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def delete_encounter_service(campaign_id: str, encounter_id: str, user_id: str) -> dict:
    """
    Remove um encontro de uma campanha

    Args:
        campaign_id: ID da campanha
        encounter_id: ID do encontro
        user_id: ID do usuário solicitante

    Returns:
        dict: Resultado com success e mensagem ou erro
    """
    try:
        # Validar IDs
        if not ObjectId.is_valid(campaign_id) or not ObjectId.is_valid(encounter_id):
            return {"success": False, "error": "ID inválido"}

        # Verificar se campanha existe
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return {"success": False, "error": "Campanha não encontrada"}

        # Verificar se usuário é GM
        if str(campaign.game_master_id) != user_id:
            return {"success": False, "error": "Apenas o GM pode remover encontros"}

        # Remover encontro
        success = remove_encounter_from_campaign(campaign_id, encounter_id)

        if success:
            return {"success": True, "message": "Encontro removido com sucesso"}
        return {"success": False, "error": "Falha ao remover encontro"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}