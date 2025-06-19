from bson import ObjectId
from typing import Optional, List, Dict, Any
from database.db import mydb
from database.schemas.campaign import Campaign, CampaignCreate

campaigns_collection = mydb["campaigns"]


def create_campaign(campaign: CampaignCreate) -> ObjectId:
    """Insere uma nova campanha no banco"""
    campaign_dict = campaign.dict(by_alias=True, exclude_unset=True)

    # Adicionar campos padrão
    campaign_dict["npcs"] = []
    campaign_dict["encounters"] = []
    campaign_dict["loot"] = []
    campaign_dict["status"] = "recrutando"

    result = campaigns_collection.insert_one(campaign_dict)
    return result.inserted_id


def get_campaign_by_id(campaign_id: str) -> Optional[Campaign]:
    """Retorna campanha pelo ID"""
    campaign_data = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
    if campaign_data:
        campaign_data["id"] = campaign_data["_id"]
        return Campaign(**campaign_data)
    return None


def get_campaigns_by_gm(gm_id: str) -> List[Campaign]:
    """Retorna todas as campanhas de um Game Master"""
    campaigns_data = list(campaigns_collection.find({"game_master_id": ObjectId(gm_id)}))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def get_campaigns_by_player(user_id: str) -> List[Campaign]:
    """Retorna todas as campanhas onde o usuário é jogador"""
    campaigns_data = list(campaigns_collection.find({
        "players.user_id": ObjectId(user_id)
    }))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def get_public_campaigns() -> List[Campaign]:
    """Retorna todas as campanhas públicas"""
    campaigns_data = list(campaigns_collection.find({"is_public": True}))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def get_campaigns_by_status(status: str) -> List[Campaign]:
    """Retorna campanhas por status"""
    campaigns_data = list(campaigns_collection.find({"status": status}))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def get_campaigns_by_tags(tags: List[str]) -> List[Campaign]:
    """Retorna campanhas que contêm pelo menos uma das tags"""
    campaigns_data = list(campaigns_collection.find({"tags": {"$in": tags}}))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def search_campaigns_by_name(name_pattern: str) -> List[Campaign]:
    """Busca campanhas por nome (busca parcial, case-insensitive)"""
    campaigns_data = list(campaigns_collection.find({
        "name": {"$regex": name_pattern, "$options": "i"}
    }))
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def update_campaign(campaign_id: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza uma campanha existente"""
    from datetime import datetime
    update_data["updated_date"] = datetime.utcnow()

    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


def delete_campaign(campaign_id: str) -> bool:
    """Remove uma campanha do banco"""
    result = campaigns_collection.delete_one({"_id": ObjectId(campaign_id)})
    return result.deleted_count > 0


# ================================
# FUNÇÕES PARA JOGADORES
# ================================

def add_player_to_campaign(campaign_id: str, player_data: Dict[str, Any]) -> bool:
    """Adiciona um jogador à campanha"""
    from datetime import datetime
    player_data["joined_date"] = datetime.utcnow()

    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$push": {"players": player_data}}
    )
    return result.modified_count > 0


def remove_player_from_campaign(campaign_id: str, user_id: str) -> bool:
    """Remove um jogador da campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$pull": {"players": {"user_id": ObjectId(user_id)}}}
    )
    return result.modified_count > 0


def update_player_in_campaign(campaign_id: str, user_id: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza informações de um jogador na campanha"""
    # Criar o objeto de atualização usando operador posicional
    set_data = {}
    for key, value in update_data.items():
        set_data[f"players.$.{key}"] = value

    result = campaigns_collection.update_one(
        {
            "_id": ObjectId(campaign_id),
            "players.user_id": ObjectId(user_id)
        },
        {"$set": set_data}
    )
    return result.modified_count > 0


def get_campaign_players_count(campaign_id: str) -> int:
    """Retorna a quantidade de jogadores ativos na campanha"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return 0
    return len([p for p in campaign.players if p.is_active])


def is_campaign_full(campaign_id: str) -> bool:
    """Verifica se a campanha está com o número máximo de jogadores"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return True

    active_players = len([p for p in campaign.players if p.is_active])
    return active_players >= campaign.max_players


def is_user_in_campaign(campaign_id: str, user_id: str) -> bool:
    """Verifica se um usuário está na campanha"""
    campaign_data = campaigns_collection.find_one({
        "_id": ObjectId(campaign_id),
        "players.user_id": ObjectId(user_id)
    })
    return campaign_data is not None


# ================================
# FUNÇÕES PARA ENCONTROS
# ================================

def add_encounter_to_campaign(campaign_id: str, encounter_data: Dict[str, Any]) -> bool:
    """Adiciona um encontro à campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$push": {"encounters": encounter_data}}
    )
    return result.modified_count > 0


def update_encounter_in_campaign(campaign_id: str, encounter_name: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza um encontro específico na campanha"""
    # Criar o objeto de atualização usando operador posicional
    set_data = {}
    for key, value in update_data.items():
        set_data[f"encounters.$.{key}"] = value

    result = campaigns_collection.update_one(
        {
            "_id": ObjectId(campaign_id),
            "encounters.name": encounter_name
        },
        {"$set": set_data}
    )
    return result.modified_count > 0


def remove_encounter_from_campaign(campaign_id: str, encounter_name: str) -> bool:
    """Remove um encontro da campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$pull": {"encounters": {"name": encounter_name}}}
    )
    return result.modified_count > 0


def get_completed_encounters(campaign_id: str) -> List[Dict[str, Any]]:
    """Retorna todos os encontros completados da campanha"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return []
    return [e.dict() for e in campaign.encounters if e.is_completed]


def get_pending_encounters(campaign_id: str) -> List[Dict[str, Any]]:
    """Retorna todos os encontros pendentes da campanha"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return []
    return [e.dict() for e in campaign.encounters if not e.is_completed]


# ================================
# FUNÇÕES PARA LOOT
# ================================

def add_loot_to_campaign(campaign_id: str, loot_data: Dict[str, Any]) -> bool:
    """Adiciona um item de loot à campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$push": {"loot": loot_data}}
    )
    return result.modified_count > 0


def update_loot_in_campaign(campaign_id: str, loot_name: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza um item de loot específico na campanha"""
    # Criar o objeto de atualização usando operador posicional
    set_data = {}
    for key, value in update_data.items():
        set_data[f"loot.$.{key}"] = value

    result = campaigns_collection.update_one(
        {
            "_id": ObjectId(campaign_id),
            "loot.name": loot_name
        },
        {"$set": set_data}
    )
    return result.modified_count > 0


def remove_loot_from_campaign(campaign_id: str, loot_name: str) -> bool:
    """Remove um item de loot da campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$pull": {"loot": {"name": loot_name}}}
    )
    return result.modified_count > 0


def assign_loot_to_player(campaign_id: str, loot_name: str, player_id: str) -> bool:
    """Atribui um item de loot a um jogador específico"""
    result = campaigns_collection.update_one(
        {
            "_id": ObjectId(campaign_id),
            "loot.name": loot_name
        },
        {"$set": {"loot.$.assigned_to_player": ObjectId(player_id)}}
    )
    return result.modified_count > 0


def get_unassigned_loot(campaign_id: str) -> List[Dict[str, Any]]:
    """Retorna todos os itens de loot não atribuídos"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return []
    return [l.dict() for l in campaign.loot if not l.assigned_to_player]


def get_player_loot(campaign_id: str, player_id: str) -> List[Dict[str, Any]]:
    """Retorna todos os itens de loot de um jogador específico"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return []
    return [l.dict() for l in campaign.loot if l.assigned_to_player == ObjectId(player_id)]


# ================================
# FUNÇÕES PARA NPCs (REFERÊNCIAS)
# ================================

def add_npc_to_campaign(campaign_id: str, npc_id: str) -> bool:
    """Adiciona uma referência de NPC à campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$push": {"npcs": ObjectId(npc_id)}}
    )
    return result.modified_count > 0


def remove_npc_from_campaign(campaign_id: str, npc_id: str) -> bool:
    """Remove uma referência de NPC da campanha"""
    result = campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$pull": {"npcs": ObjectId(npc_id)}}
    )
    return result.modified_count > 0


# ================================
# FUNÇÕES AUXILIARES E ESTATÍSTICAS
# ================================

def get_campaign_summary_stats(campaign_id: str) -> Dict[str, Any]:
    """Retorna estatísticas resumidas da campanha"""
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return {}

    return {
        "total_players": len(campaign.players),
        "active_players": len([p for p in campaign.players if p.is_active]),
        "max_players": campaign.max_players,
        "total_npcs": len(campaign.npcs),
        "total_encounters": len(campaign.encounters),
        "completed_encounters": len([e for e in campaign.encounters if e.is_completed]),
        "pending_encounters": len([e for e in campaign.encounters if not e.is_completed]),
        "total_loot_items": len(campaign.loot),
        "assigned_loot": len([l for l in campaign.loot if l.assigned_to_player]),
        "unassigned_loot": len([l for l in campaign.loot if not l.assigned_to_player]),
        "total_loot_value": sum([l.value * l.quantity for l in campaign.loot])
    }


def get_all_campaigns() -> List[Campaign]:
    """Retorna todas as campanhas do sistema"""
    campaigns_data = list(campaigns_collection.find())
    campaigns = []
    for campaign_data in campaigns_data:
        campaign_data["id"] = campaign_data["_id"]
        campaigns.append(Campaign(**campaign_data))
    return campaigns


def get_campaigns_count() -> int:
    """Retorna o total de campanhas no sistema"""
    return campaigns_collection.count_documents({})