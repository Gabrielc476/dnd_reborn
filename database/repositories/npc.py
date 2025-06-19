from bson import ObjectId
from typing import Optional, List, Dict, Any
from database.db import mydb
from database.schemas.npc import NPC, NPCCreate

npcs_collection = mydb["npcs"]


def create_npc(npc: NPCCreate) -> ObjectId:
    """Insere um novo NPC no banco"""
    npc_dict = npc.dict(by_alias=True, exclude_unset=True)
    result = npcs_collection.insert_one(npc_dict)

    # Adicionar o NPC à lista de NPCs da campanha
    from database.repositories.campaign import add_npc_to_campaign
    add_npc_to_campaign(str(npc.campaign_id), str(result.inserted_id))

    return result.inserted_id


def get_npc_by_id(npc_id: str) -> Optional[NPC]:
    """Retorna NPC pelo ID"""
    npc_data = npcs_collection.find_one({"_id": ObjectId(npc_id)})
    if npc_data:
        npc_data["id"] = npc_data["_id"]
        return NPC(**npc_data)
    return None


def get_npcs_by_campaign(campaign_id: str) -> List[NPC]:
    """Retorna todos os NPCs de uma campanha"""
    npcs_data = list(npcs_collection.find({"campaign_id": ObjectId(campaign_id)}))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_npcs_by_type(campaign_id: str, npc_type: str) -> List[NPC]:
    """Retorna NPCs de um tipo específico em uma campanha"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "npc_type": npc_type
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_npcs_by_location(campaign_id: str, location: str) -> List[NPC]:
    """Retorna NPCs de uma localização específica"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "location": location
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_npcs_by_faction(campaign_id: str, faction: str) -> List[NPC]:
    """Retorna NPCs de uma facção específica"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "faction": faction
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_npcs_by_challenge_rating(campaign_id: str, cr: str) -> List[NPC]:
    """Retorna NPCs por Challenge Rating"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "challenge_rating": cr
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_active_npcs_by_campaign(campaign_id: str) -> List[NPC]:
    """Retorna apenas NPCs ativos de uma campanha"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "is_active": True
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_alive_npcs_by_campaign(campaign_id: str) -> List[NPC]:
    """Retorna apenas NPCs vivos de uma campanha"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "is_alive": True
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def get_dead_npcs_by_campaign(campaign_id: str) -> List[NPC]:
    """Retorna NPCs mortos de uma campanha"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "is_alive": False
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def search_npcs_by_name(campaign_id: str, name_pattern: str) -> List[NPC]:
    """Busca NPCs por nome (busca parcial, case-insensitive)"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "name": {"$regex": name_pattern, "$options": "i"}
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def search_npcs_by_occupation(campaign_id: str, occupation: str) -> List[NPC]:
    """Busca NPCs por ocupação"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        "occupation": {"$regex": occupation, "$options": "i"}
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


def update_npc(npc_id: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza um NPC existente"""
    from datetime import datetime
    update_data["updated_date"] = datetime.utcnow()

    result = npcs_collection.update_one(
        {"_id": ObjectId(npc_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


def delete_npc(npc_id: str) -> bool:
    """Remove um NPC do banco"""
    # Primeiro buscar o NPC para obter o campaign_id
    npc = get_npc_by_id(npc_id)
    if not npc:
        return False

    # Remover o NPC da collection
    result = npcs_collection.delete_one({"_id": ObjectId(npc_id)})

    # Remover a referência do NPC da campanha
    if result.deleted_count > 0:
        from database.repositories.campaign import remove_npc_from_campaign
        remove_npc_from_campaign(str(npc.campaign_id), npc_id)

    return result.deleted_count > 0


def kill_npc(npc_id: str) -> bool:
    """Marca um NPC como morto"""
    return update_npc(npc_id, {"is_alive": False})


def revive_npc(npc_id: str) -> bool:
    """Marca um NPC como vivo"""
    return update_npc(npc_id, {"is_alive": True})


def activate_npc(npc_id: str) -> bool:
    """Ativa um NPC na campanha"""
    return update_npc(npc_id, {"is_active": True})


def deactivate_npc(npc_id: str) -> bool:
    """Desativa um NPC na campanha"""
    return update_npc(npc_id, {"is_active": False})


# ================================
# FUNÇÕES PARA RELACIONAMENTOS
# ================================

def add_npc_relationship(npc_id: str, target_name: str, relationship_type: str) -> bool:
    """Adiciona um relacionamento ao NPC"""
    npc = get_npc_by_id(npc_id)
    if not npc:
        return False

    relationships = npc.relationships.copy()
    relationships[target_name] = relationship_type

    return update_npc(npc_id, {"relationships": relationships})


def remove_npc_relationship(npc_id: str, target_name: str) -> bool:
    """Remove um relacionamento do NPC"""
    npc = get_npc_by_id(npc_id)
    if not npc:
        return False

    relationships = npc.relationships.copy()
    if target_name in relationships:
        del relationships[target_name]
        return update_npc(npc_id, {"relationships": relationships})

    return False


def get_npcs_with_relationship(campaign_id: str, target_name: str) -> List[NPC]:
    """Retorna NPCs que têm relacionamento com um alvo específico"""
    npcs_data = list(npcs_collection.find({
        "campaign_id": ObjectId(campaign_id),
        f"relationships.{target_name}": {"$exists": True}
    }))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


# ================================
# FUNÇÕES PARA HABILIDADES
# ================================

def add_npc_ability(npc_id: str, ability_data: Dict[str, Any]) -> bool:
    """Adiciona uma habilidade ao NPC"""
    result = npcs_collection.update_one(
        {"_id": ObjectId(npc_id)},
        {"$push": {"abilities": ability_data}}
    )
    return result.modified_count > 0


def remove_npc_ability(npc_id: str, ability_name: str) -> bool:
    """Remove uma habilidade do NPC"""
    result = npcs_collection.update_one(
        {"_id": ObjectId(npc_id)},
        {"$pull": {"abilities": {"name": ability_name}}}
    )
    return result.modified_count > 0


def update_npc_ability(npc_id: str, ability_name: str, update_data: Dict[str, Any]) -> bool:
    """Atualiza uma habilidade específica do NPC"""
    # Criar o objeto de atualização usando operador posicional
    set_data = {}
    for key, value in update_data.items():
        set_data[f"abilities.$.{key}"] = value

    result = npcs_collection.update_one(
        {
            "_id": ObjectId(npc_id),
            "abilities.name": ability_name
        },
        {"$set": set_data}
    )
    return result.modified_count > 0


# ================================
# FUNÇÕES PARA TRAÇOS DE PERSONALIDADE
# ================================

def add_npc_personality_trait(npc_id: str, trait: str) -> bool:
    """Adiciona um traço de personalidade ao NPC"""
    result = npcs_collection.update_one(
        {"_id": ObjectId(npc_id)},
        {"$push": {"personality_traits": trait}}
    )
    return result.modified_count > 0


def remove_npc_personality_trait(npc_id: str, trait: str) -> bool:
    """Remove um traço de personalidade do NPC"""
    result = npcs_collection.update_one(
        {"_id": ObjectId(npc_id)},
        {"$pull": {"personality_traits": trait}}
    )
    return result.modified_count > 0


# ================================
# FUNÇÕES DE BUSCA AVANÇADA
# ================================

def get_npcs_by_multiple_criteria(
        campaign_id: str,
        npc_type: Optional[str] = None,
        location: Optional[str] = None,
        faction: Optional[str] = None,
        is_alive: Optional[bool] = None,
        is_active: Optional[bool] = None
) -> List[NPC]:
    """Busca NPCs por múltiplos critérios"""

    filter_criteria = {"campaign_id": ObjectId(campaign_id)}

    if npc_type:
        filter_criteria["npc_type"] = npc_type
    if location:
        filter_criteria["location"] = location
    if faction:
        filter_criteria["faction"] = faction
    if is_alive is not None:
        filter_criteria["is_alive"] = is_alive
    if is_active is not None:
        filter_criteria["is_active"] = is_active

    npcs_data = list(npcs_collection.find(filter_criteria))
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs


# ================================
# FUNÇÕES AUXILIARES E ESTATÍSTICAS
# ================================

def get_npc_count_by_campaign(campaign_id: str) -> int:
    """Retorna o total de NPCs em uma campanha"""
    return npcs_collection.count_documents({"campaign_id": ObjectId(campaign_id)})


def get_npc_count_by_type(campaign_id: str, npc_type: str) -> int:
    """Retorna a quantidade de NPCs de um tipo específico"""
    return npcs_collection.count_documents({
        "campaign_id": ObjectId(campaign_id),
        "npc_type": npc_type
    })


def get_npc_count_by_location(campaign_id: str, location: str) -> int:
    """Retorna a quantidade de NPCs em uma localização"""
    return npcs_collection.count_documents({
        "campaign_id": ObjectId(campaign_id),
        "location": location
    })


def get_unique_locations_in_campaign(campaign_id: str) -> List[str]:
    """Retorna todas as localizações únicas onde há NPCs na campanha"""
    locations = npcs_collection.distinct("location", {"campaign_id": ObjectId(campaign_id)})
    return [loc for loc in locations if loc is not None]


def get_unique_factions_in_campaign(campaign_id: str) -> List[str]:
    """Retorna todas as facções únicas na campanha"""
    factions = npcs_collection.distinct("faction", {"campaign_id": ObjectId(campaign_id)})
    return [faction for faction in factions if faction is not None]


def get_npc_stats_summary(campaign_id: str) -> Dict[str, Any]:
    """Retorna estatísticas resumidas dos NPCs da campanha"""
    total_npcs = get_npc_count_by_campaign(campaign_id)

    if total_npcs == 0:
        return {
            "total_npcs": 0,
            "alive_npcs": 0,
            "dead_npcs": 0,
            "active_npcs": 0,
            "inactive_npcs": 0,
            "by_type": {},
            "unique_locations": [],
            "unique_factions": []
        }

    alive_count = npcs_collection.count_documents({
        "campaign_id": ObjectId(campaign_id),
        "is_alive": True
    })

    active_count = npcs_collection.count_documents({
        "campaign_id": ObjectId(campaign_id),
        "is_active": True
    })

    # Contagem por tipo
    pipeline = [
        {"$match": {"campaign_id": ObjectId(campaign_id)}},
        {"$group": {"_id": "$npc_type", "count": {"$sum": 1}}}
    ]
    type_counts = {}
    for result in npcs_collection.aggregate(pipeline):
        type_counts[result["_id"]] = result["count"]

    return {
        "total_npcs": total_npcs,
        "alive_npcs": alive_count,
        "dead_npcs": total_npcs - alive_count,
        "active_npcs": active_count,
        "inactive_npcs": total_npcs - active_count,
        "by_type": type_counts,
        "unique_locations": get_unique_locations_in_campaign(campaign_id),
        "unique_factions": get_unique_factions_in_campaign(campaign_id)
    }


def get_all_npcs() -> List[NPC]:
    """Retorna todos os NPCs do sistema (para administração)"""
    npcs_data = list(npcs_collection.find())
    npcs = []
    for npc_data in npcs_data:
        npc_data["id"] = npc_data["_id"]
        npcs.append(NPC(**npc_data))
    return npcs