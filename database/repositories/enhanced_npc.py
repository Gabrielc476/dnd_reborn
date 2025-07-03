# ===========================
# REPOSITÓRIO E SERVIÇOS ATUALIZADOS PARA NPCs
# database/repositories/enhanced_npc.py
# ===========================

from typing import Dict, Any, List, Optional, Union
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime
import logging

from database.schemas.enhanced_npc import (
    EnhancedNPC,
    EnhancedNPCCreate,
    EnhancedNPCUpdate,
    EnhancedNPCResponse,
    NPCSearchFilters,
    NPCSearchResult,
    DiceRollRequest,
    UpdateHitPointsRequest,
    CastSpellRequest,
    RollResult,
    DiceRoll
)
from database.db import mydb

logger = logging.getLogger(__name__)

# Obter coleção do MongoDB seguindo a mesma estrutura dos outros repositórios
npcs_collection = mydb["npcs"]


# ===========================
# FUNÇÕES CRUD BÁSICAS
# ===========================

def create_enhanced_npc(npc_data: EnhancedNPCCreate, created_by: Optional[ObjectId] = None) -> str:
    """Cria um novo NPC aprimorado"""
    try:
        # Converter para modelo completo
        npc = EnhancedNPC(**npc_data.dict())

        # Definir metadados
        npc.created_by = created_by
        npc.created_date = datetime.utcnow()
        npc.updated_date = datetime.utcnow()

        # Calcular estatísticas derivadas
        npc.calculate_derived_stats()

        # Preparar dados para inserção
        npc_dict = npc.dict(by_alias=True, exclude={"id"})
        npc_dict["campaign_id"] = ObjectId(npc_data.campaign_id)
        if created_by:
            npc_dict["created_by"] = ObjectId(created_by)

        # Inserir no banco
        result = npcs_collection.insert_one(npc_dict)

        # Adicionar o NPC à lista de NPCs da campanha (mantendo integração existente)
        try:
            from database.repositories.campaign import add_npc_to_campaign
            add_npc_to_campaign(str(npc_data.campaign_id), str(result.inserted_id))
        except ImportError:
            # Se a função não existir, continuar sem erro
            logger.warning("Função add_npc_to_campaign não encontrada, pulando integração")

        logger.info(f"NPC criado com sucesso: {npc.name} (ID: {result.inserted_id})")
        return str(result.inserted_id)

    except Exception as e:
        logger.error(f"Erro ao criar NPC: {str(e)}")
        raise


def get_enhanced_npc_by_id(npc_id: str) -> Optional[EnhancedNPC]:
    """Busca NPC por ID"""
    try:
        if not ObjectId.is_valid(npc_id):
            return None

        npc_data = npcs_collection.find_one({"_id": ObjectId(npc_id)})

        if npc_data:
            npc_data["id"] = npc_data["_id"]
            return EnhancedNPC(**npc_data)

        return None

    except Exception as e:
        logger.error(f"Erro ao buscar NPC {npc_id}: {str(e)}")
        return None


def update_enhanced_npc(npc_id: str, updates: EnhancedNPCUpdate) -> bool:
    """Atualiza um NPC existente"""
    try:
        if not ObjectId.is_valid(npc_id):
            return False

        # Preparar dados de atualização
        update_dict = {}
        for field, value in updates.dict(exclude_unset=True, by_alias=True).items():
            if value is not None:
                update_dict[field] = value

        # Adicionar timestamp de atualização
        update_dict["updated_date"] = datetime.utcnow()

        # Recalcular estatísticas se necessário
        if any(key in update_dict for key in ["stats", "challenge_rating", "spellcasting"]):
            # Buscar NPC atual para recalcular
            current_npc = get_enhanced_npc_by_id(npc_id)
            if current_npc:
                # Aplicar updates ao modelo atual
                for field, value in update_dict.items():
                    if hasattr(current_npc, field):
                        setattr(current_npc, field, value)

                # Recalcular estatísticas
                current_npc.calculate_derived_stats()

                # Atualizar campos calculados
                if current_npc.stats.proficiency_bonus:
                    update_dict["stats.proficiency_bonus"] = current_npc.stats.proficiency_bonus
                if current_npc.stats.passive_perception:
                    update_dict["stats.passive_perception"] = current_npc.stats.passive_perception
                if current_npc.spellcasting.spell_save_dc:
                    update_dict["spellcasting.spell_save_dc"] = current_npc.spellcasting.spell_save_dc
                if current_npc.spellcasting.spell_attack_bonus:
                    update_dict["spellcasting.spell_attack_bonus"] = current_npc.spellcasting.spell_attack_bonus

        # Executar atualização
        result = npcs_collection.update_one(
            {"_id": ObjectId(npc_id)},
            {"$set": update_dict}
        )

        success = result.modified_count > 0
        if success:
            logger.info(f"NPC {npc_id} atualizado com sucesso")

        return success

    except Exception as e:
        logger.error(f"Erro ao atualizar NPC {npc_id}: {str(e)}")
        return False


def delete_enhanced_npc(npc_id: str) -> bool:
    """Remove um NPC"""
    try:
        if not ObjectId.is_valid(npc_id):
            return False

        # Primeiro buscar o NPC para obter o campaign_id (seguindo padrão existente)
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return False

        # Remover o NPC da collection
        result = npcs_collection.delete_one({"_id": ObjectId(npc_id)})

        # Remover a referência do NPC da campanha (mantendo integração existente)
        if result.deleted_count > 0:
            try:
                from database.repositories.campaign import remove_npc_from_campaign
                remove_npc_from_campaign(str(npc.campaign_id), npc_id)
            except ImportError:
                # Se a função não existir, continuar sem erro
                logger.warning("Função remove_npc_from_campaign não encontrada, pulando integração")

        success = result.deleted_count > 0
        if success:
            logger.info(f"NPC {npc_id} removido com sucesso")

        return success

    except Exception as e:
        logger.error(f"Erro ao remover NPC {npc_id}: {str(e)}")
        return False


# ===========================
# FUNÇÕES DE BUSCA E FILTROS
# ===========================

def get_enhanced_npcs_by_campaign(
        campaign_id: str,
        filters: Optional[NPCSearchFilters] = None,
        page: int = 1,
        per_page: int = 50,
        sort_by: str = "name",
        sort_order: int = 1
) -> NPCSearchResult:
    """Busca NPCs de uma campanha com filtros"""
    try:
        if not ObjectId.is_valid(campaign_id):
            return NPCSearchResult(npcs=[], total=0, page=page, per_page=per_page,
                                   filters_applied=filters or NPCSearchFilters())

        # Construir query base
        query = {"campaign_id": ObjectId(campaign_id)}

        # Aplicar filtros
        if filters:
            if filters.name:
                query["name"] = {"$regex": filters.name, "$options": "i"}

            if filters.npc_type:
                query["npc_type"] = {"$in": [t.value for t in filters.npc_type]}

            if filters.creature_type:
                query["creature_type"] = {"$in": [t.value for t in filters.creature_type]}

            if filters.location:
                query["location"] = {"$in": filters.location}

            if filters.faction:
                query["faction"] = {"$in": filters.faction}

            if filters.challenge_rating_min is not None or filters.challenge_rating_max is not None:
                cr_query = {}
                if filters.challenge_rating_min is not None:
                    cr_query["$gte"] = str(filters.challenge_rating_min)
                if filters.challenge_rating_max is not None:
                    cr_query["$lte"] = str(filters.challenge_rating_max)
                query["challenge_rating"] = cr_query

            if filters.is_alive is not None:
                query["is_alive"] = filters.is_alive

            if filters.is_active is not None:
                query["is_active"] = filters.is_active

            if filters.has_attacks is not None:
                if filters.has_attacks:
                    query["attacks"] = {"$exists": True, "$ne": []}
                else:
                    query["$or"] = [
                        {"attacks": {"$exists": False}},
                        {"attacks": {"$eq": []}}
                    ]

            if filters.is_spellcaster is not None:
                query["spellcasting.is_spellcaster"] = filters.is_spellcaster

            if filters.is_important is not None:
                query["is_important"] = filters.is_important

            if filters.tags:
                query["tags"] = {"$in": filters.tags}

        # Contar total
        total = npcs_collection.count_documents(query)

        # Buscar NPCs com paginação
        skip = (page - 1) * per_page
        cursor = npcs_collection.find(query).sort(sort_by, sort_order).skip(skip).limit(per_page)

        # Converter para lista de NPCs
        npcs = []
        for npc_data in cursor:
            npc_data["id"] = str(npc_data["_id"])
            npc_data["campaign_id"] = str(npc_data["campaign_id"])
            if npc_data.get("created_by"):
                npc_data["created_by"] = str(npc_data["created_by"])

            # Converter datas para string
            if npc_data.get("created_date"):
                npc_data["created_date"] = npc_data["created_date"].isoformat()
            if npc_data.get("updated_date"):
                npc_data["updated_date"] = npc_data["updated_date"].isoformat()

            npcs.append(EnhancedNPCResponse(**npc_data))

        return NPCSearchResult(
            npcs=npcs,
            total=total,
            page=page,
            per_page=per_page,
            filters_applied=filters or NPCSearchFilters()
        )

    except Exception as e:
        logger.error(f"Erro ao buscar NPCs da campanha {campaign_id}: {str(e)}")
        return NPCSearchResult(npcs=[], total=0, page=page, per_page=per_page,
                               filters_applied=filters or NPCSearchFilters())


def search_enhanced_npcs(
        campaign_id: str,
        search_term: str,
        search_fields: List[str] = None
) -> List[EnhancedNPCResponse]:
    """Busca textual em NPCs"""
    try:
        if not ObjectId.is_valid(campaign_id):
            return []

        if not search_fields:
            search_fields = ["name", "description", "race", "npc_class", "location", "occupation"]

        # Construir query de busca textual
        search_queries = []
        for field in search_fields:
            search_queries.append({field: {"$regex": search_term, "$options": "i"}})

        query = {
            "campaign_id": ObjectId(campaign_id),
            "$or": search_queries
        }

        # Buscar NPCs
        cursor = npcs_collection.find(query).sort("name", 1)

        npcs = []
        for npc_data in cursor:
            npc_data["id"] = str(npc_data["_id"])
            npc_data["campaign_id"] = str(npc_data["campaign_id"])
            if npc_data.get("created_by"):
                npc_data["created_by"] = str(npc_data["created_by"])

            if npc_data.get("created_date"):
                npc_data["created_date"] = npc_data["created_date"].isoformat()
            if npc_data.get("updated_date"):
                npc_data["updated_date"] = npc_data["updated_date"].isoformat()

            npcs.append(EnhancedNPCResponse(**npc_data))

        return npcs

    except Exception as e:
        logger.error(f"Erro na busca textual de NPCs: {str(e)}")
        return []


# ===========================
# FUNÇÕES DE COMBATE E DADOS
# ===========================

def roll_dice_for_npc(
        npc_id: str,
        roll_request: DiceRollRequest
) -> Optional[RollResult]:
    """Executa rolagem de dados para um NPC"""
    try:
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return None

        dice_roll = None

        # Determinar qual dado rolar baseado no tipo
        if roll_request.roll_type == "attack" and roll_request.target_id:
            # Buscar ataque específico
            attack = next((a for a in npc.attacks if a.id == roll_request.target_id), None)
            if attack:
                modifier = roll_request.modifier_override or attack.attack_bonus
                dice_roll = DiceRoll(dice_count=1, dice_sides=20, modifier=modifier)

        elif roll_request.roll_type == "damage" and roll_request.target_id:
            # Buscar dano do ataque
            attack = next((a for a in npc.attacks if a.id == roll_request.target_id), None)
            if attack:
                dice_roll = attack.damage
                if roll_request.modifier_override is not None:
                    dice_roll.modifier = roll_request.modifier_override

        elif roll_request.roll_type == "spell_attack" and roll_request.target_id:
            # Buscar ataque de magia
            spell = next((s for s in npc.spellcasting.spells_known if s.id == roll_request.target_id), None)
            if spell and spell.attack_bonus is not None:
                modifier = roll_request.modifier_override or spell.attack_bonus
                dice_roll = DiceRoll(dice_count=1, dice_sides=20, modifier=modifier)

        elif roll_request.roll_type == "spell_damage" and roll_request.target_id:
            # Buscar dano de magia
            spell = next((s for s in npc.spellcasting.spells_known if s.id == roll_request.target_id), None)
            if spell and spell.damage:
                dice_roll = spell.damage
                if roll_request.modifier_override is not None:
                    dice_roll.modifier = roll_request.modifier_override

        elif roll_request.roll_type == "ability_check":
            # Teste de atributo genérico
            modifier = roll_request.modifier_override or 0
            dice_roll = DiceRoll(dice_count=1, dice_sides=20, modifier=modifier)

        elif roll_request.roll_type == "saving_throw":
            # Teste de resistência genérico
            modifier = roll_request.modifier_override or 0
            dice_roll = DiceRoll(dice_count=1, dice_sides=20, modifier=modifier)

        if not dice_roll:
            return None

        # Executar rolagem
        result = _execute_dice_roll(dice_roll, roll_request.advantage, roll_request.disadvantage)

        logger.info(f"Rolagem executada para {npc.name}: {roll_request.roll_type} = {result.total}")
        return result

    except Exception as e:
        logger.error(f"Erro ao executar rolagem para NPC {npc_id}: {str(e)}")
        return None


def update_npc_hit_points(request: UpdateHitPointsRequest) -> bool:
    """Atualiza pontos de vida de um NPC"""
    try:
        updates = {
            "stats.current_hit_points": request.new_hit_points,
            "updated_date": datetime.utcnow()
        }

        if request.temporary_hit_points is not None:
            updates["stats.temporary_hit_points"] = request.temporary_hit_points

        if request.max_hit_points is not None:
            updates["stats.hit_points"] = request.max_hit_points

        # Verificar se NPC morreu ou reviveu
        if request.new_hit_points <= 0:
            updates["is_alive"] = False
        elif request.new_hit_points > 0:
            # Verificar se estava morto antes
            npc = get_enhanced_npc_by_id(request.npc_id)
            if npc and not npc.is_alive:
                updates["is_alive"] = True

        result = npcs_collection.update_one(
            {"_id": ObjectId(request.npc_id)},
            {"$set": updates}
        )

        success = result.modified_count > 0
        if success:
            logger.info(f"Pontos de vida do NPC {request.npc_id} atualizados para {request.new_hit_points}")

        return success

    except Exception as e:
        logger.error(f"Erro ao atualizar HP do NPC {request.npc_id}: {str(e)}")
        return False


def cast_spell_for_npc(request: CastSpellRequest) -> Optional[RollResult]:
    """Conjura uma magia para um NPC"""
    try:
        npc = get_enhanced_npc_by_id(request.npc_id)
        if not npc:
            return None

        # Buscar magia
        spell = next((s for s in npc.spellcasting.spells_known if s.id == request.spell_id), None)
        if not spell:
            # Tentar buscar em truques
            spell = next((s for s in npc.spellcasting.cantrips_known if s.id == request.spell_id), None)

        if not spell:
            return None

        # Verificar e consumir slot de magia se necessário
        cast_level = request.cast_level or spell.level

        if request.use_spell_slot and spell.level > 0:
            # Encontrar slot disponível
            spell_slot = next((slot for slot in npc.spellcasting.spell_slots
                               if slot.level == cast_level and slot.current_slots > 0), None)

            if not spell_slot:
                logger.warning(f"NPC {request.npc_id} não tem slots de nível {cast_level} disponíveis")
                return None

            # Consumir slot
            npcs_collection.update_one(
                {
                    "_id": ObjectId(request.npc_id),
                    "spellcasting.spell_slots.level": cast_level
                },
                {
                    "$inc": {"spellcasting.spell_slots.$.current_slots": -1},
                    "$set": {"updated_date": datetime.utcnow()}
                }
            )

        # Se é magia de ataque com dano, rolar dano
        if spell.is_attack_spell and spell.damage:
            damage_roll = spell.damage

            # Aplicar upcast se conjurada em nível superior
            if cast_level > spell.level and spell.upcast_damage:
                level_diff = cast_level - spell.level
                damage_roll = DiceRoll(
                    dice_count=spell.damage.dice_count + (spell.upcast_damage.dice_count * level_diff),
                    dice_sides=spell.damage.dice_sides,
                    modifier=spell.damage.modifier + (spell.upcast_damage.modifier * level_diff)
                )

            result = _execute_dice_roll(damage_roll)

            logger.info(
                f"Magia {spell.name} conjurada por NPC {request.npc_id} no nível {cast_level}: {result.total} de dano")
            return result

        # Para outras magias, apenas registrar a conjuração
        logger.info(f"Magia {spell.name} conjurada por NPC {request.npc_id} no nível {cast_level}")
        return None

    except Exception as e:
        logger.error(f"Erro ao conjurar magia para NPC {request.npc_id}: {str(e)}")
        return None


# ===========================
# FUNÇÕES DE STATUS E UTILIDADES
# ===========================

def kill_enhanced_npc(npc_id: str) -> bool:
    """Marca um NPC como morto"""
    return update_enhanced_npc(npc_id, EnhancedNPCUpdate(
        is_alive=False,
        current_hit_points=0
    ))


def revive_enhanced_npc(npc_id: str) -> bool:
    """Revive um NPC"""
    npc = get_enhanced_npc_by_id(npc_id)
    if not npc:
        return False

    return update_enhanced_npc(npc_id, EnhancedNPCUpdate(
        is_alive=True,
        current_hit_points=npc.stats.hit_points  # Restaurar HP máximo
    ))


def activate_enhanced_npc(npc_id: str) -> bool:
    """Ativa um NPC na campanha"""
    return update_enhanced_npc(npc_id, EnhancedNPCUpdate(is_active=True))


def deactivate_enhanced_npc(npc_id: str) -> bool:
    """Desativa um NPC na campanha"""
    return update_enhanced_npc(npc_id, EnhancedNPCUpdate(is_active=False))


def get_campaign_npc_stats(campaign_id: str) -> Dict[str, Any]:
    """Obtém estatísticas dos NPCs de uma campanha"""
    try:
        if not ObjectId.is_valid(campaign_id):
            return {}

        pipeline = [
            {"$match": {"campaign_id": ObjectId(campaign_id)}},
            {"$group": {
                "_id": None,
                "total": {"$sum": 1},
                "alive": {"$sum": {"$cond": ["$is_alive", 1, 0]}},
                "active": {"$sum": {"$cond": ["$is_active", 1, 0]}},
                "spellcasters": {"$sum": {"$cond": ["$spellcasting.is_spellcaster", 1, 0]}},
                "with_attacks": {"$sum": {"$cond": [{"$gt": [{"$size": {"$ifNull": ["$attacks", []]}}, 0]}, 1, 0]}},
                "important": {"$sum": {"$cond": ["$is_important", 1, 0]}},
                "by_type": {"$push": "$npc_type"}
            }},
            {"$project": {
                "_id": 0,
                "total": 1,
                "alive": 1,
                "dead": {"$subtract": ["$total", "$alive"]},
                "active": 1,
                "inactive": {"$subtract": ["$total", "$active"]},
                "spellcasters": 1,
                "with_attacks": 1,
                "important": 1,
                "by_type": 1
            }}
        ]

        result = list(npcs_collection.aggregate(pipeline))

        if result:
            stats = result[0]

            # Contar por tipo
            type_counts = {}
            for npc_type in stats["by_type"]:
                type_counts[npc_type] = type_counts.get(npc_type, 0) + 1

            stats["by_type"] = type_counts
            return stats

        return {
            "total": 0,
            "alive": 0,
            "dead": 0,
            "active": 0,
            "inactive": 0,
            "spellcasters": 0,
            "with_attacks": 0,
            "important": 0,
            "by_type": {}
        }

    except Exception as e:
        logger.error(f"Erro ao obter estatísticas dos NPCs: {str(e)}")
        return {}


# ===========================
# FUNÇÕES AUXILIARES PRIVADAS
# ===========================

def _execute_dice_roll(
        dice_roll: DiceRoll,
        advantage: bool = False,
        disadvantage: bool = False
) -> RollResult:
    """Executa uma rolagem de dados"""
    import random

    # Para vantagem/desvantagem, apenas aplicamos em d20
    is_d20 = dice_roll.dice_count == 1 and dice_roll.dice_sides == 20

    if is_d20 and (advantage or disadvantage):
        # Rolar dois d20s
        roll1 = random.randint(1, 20)
        roll2 = random.randint(1, 20)

        if advantage:
            total = max(roll1, roll2) + dice_roll.modifier
            rolls = [roll1, roll2]
        else:  # disadvantage
            total = min(roll1, roll2) + dice_roll.modifier
            rolls = [roll1, roll2]
    else:
        # Rolagem normal
        rolls = [random.randint(1, dice_roll.dice_sides) for _ in range(dice_roll.dice_count)]
        total = sum(rolls) + dice_roll.modifier

    formula = str(dice_roll)

    return RollResult(
        total=total,
        rolls=rolls,
        modifier=dice_roll.modifier,
        formula=formula,
        timestamp=datetime.utcnow(),
        advantage=advantage,
        disadvantage=disadvantage
    )


# ===========================
# FUNÇÕES DE MIGRAÇÃO
# ===========================

def migrate_legacy_npcs_to_enhanced():
    """Migra NPCs antigos para o novo formato"""
    try:
        logger.info("Iniciando migração de NPCs legados...")

        # Buscar NPCs antigos que não têm o novo formato
        legacy_npcs = npcs_collection.find({
            "$or": [
                {"attacks": {"$exists": False}},
                {"spellcasting": {"$exists": False}},
                {"stats.attributes": {"$exists": False}}
            ]
        })

        migrated_count = 0

        for npc_data in legacy_npcs:
            try:
                # Aplicar migração
                updates = {}

                # Adicionar ataques vazios se não existir
                if "attacks" not in npc_data:
                    updates["attacks"] = []

                # Adicionar sistema de conjuração se não existir
                if "spellcasting" not in npc_data:
                    updates["spellcasting"] = {
                        "is_spellcaster": False,
                        "spells_known": [],
                        "cantrips_known": [],
                        "spell_slots": []
                    }

                # Migrar stats se necessário
                if "stats" in npc_data and "attributes" not in npc_data["stats"]:
                    # Usar atributos padrão se não existirem
                    updates["stats.attributes"] = {
                        "strength": npc_data["stats"].get("strength", 10),
                        "dexterity": npc_data["stats"].get("dexterity", 10),
                        "constitution": npc_data["stats"].get("constitution", 10),
                        "intelligence": npc_data["stats"].get("intelligence", 10),
                        "wisdom": npc_data["stats"].get("wisdom", 10),
                        "charisma": npc_data["stats"].get("charisma", 10)
                    }

                # Adicionar campos novos
                if "size" not in npc_data:
                    updates["size"] = "Médio"

                if "creature_type" not in npc_data:
                    updates["creature_type"] = "Humanoide"

                if "abilities" not in npc_data:
                    updates["abilities"] = []

                if "legendary_actions" not in npc_data:
                    updates["legendary_actions"] = []

                if "lair_actions" not in npc_data:
                    updates["lair_actions"] = []

                if "tags" not in npc_data:
                    updates["tags"] = []

                if "show_to_players" not in npc_data:
                    updates["show_to_players"] = True

                if "is_important" not in npc_data:
                    updates["is_important"] = False

                # Aplicar updates
                if updates:
                    npcs_collection.update_one(
                        {"_id": npc_data["_id"]},
                        {"$set": updates}
                    )
                    migrated_count += 1

            except Exception as e:
                logger.error(f"Erro ao migrar NPC {npc_data.get('_id')}: {str(e)}")
                continue

        logger.info(f"Migração concluída. {migrated_count} NPCs migrados.")
        return migrated_count

    except Exception as e:
        logger.error(f"Erro na migração de NPCs: {str(e)}")
        return 0