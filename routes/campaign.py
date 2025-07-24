# routes/campaign.py - Rotas completas para gerenciamento de campanhas
from bson import ObjectId
from flask import request, jsonify, Blueprint
from middleware.auth import token_required, get_current_user_id
from services.campaign import (
    create_campaign_service,
    get_campaign_service,
    get_gm_campaigns_service,
    get_player_campaigns_service,
    get_public_campaigns_service,
    search_campaigns_service,
    update_campaign_service,
    delete_campaign_service,
    join_campaign_service,
    leave_campaign_service,
    add_encounter_service,
    add_loot_service,
    assign_loot_service,
    get_campaign_stats_service,
    # Services para player management
    add_player_to_campaign_service,
    remove_player_from_campaign_service,
    update_player_in_campaign_service
)
from services.encounter import (
    get_encounter_service,
    get_encounters_service,
    update_encounter_service,
    delete_encounter_service
)
from services.npc import (
    create_npc_service,
    get_npc_service,
    get_campaign_npcs_service,
    get_npcs_by_type_service,
    get_npcs_by_location_service,
    search_npcs_service,
    update_npc_service,
    delete_npc_service,
    kill_npc_service,
    revive_npc_service,
    add_npc_relationship_service,
    add_npc_ability_service,
    get_npc_stats_service,
    get_npcs_filtered_service
)

from database.repositories.enhanced_npc import (
    create_enhanced_npc,
    get_enhanced_npc_by_id,
    update_enhanced_npc,
    delete_enhanced_npc,
    get_enhanced_npcs_by_campaign,
    roll_dice_for_npc,
    cast_spell_for_npc,
    update_npc_hit_points
)
from database.schemas.enhanced_npc import (
    EnhancedNPCCreate,
    EnhancedNPCUpdate,
    DiceRollRequest,
    CastSpellRequest,
    UpdateHitPointsRequest,
    NPCSearchFilters
)
import logging

logger = logging.getLogger(__name__)

campaign_bp = Blueprint('campaign', __name__)


# ================================
# HELPER FUNCTIONS
# ================================

def user_is_gm_of_campaign(user_id: str, campaign_id: str) -> bool:
    """Verifica se o usuário é GM da campanha"""
    from database.repositories.campaign import get_campaign_by_id
    campaign = get_campaign_by_id(campaign_id)
    return campaign and str(campaign.game_master_id) == user_id


def user_has_access_to_campaign(user_id: str, campaign_id: str) -> bool:
    """Verifica se o usuário tem acesso à campanha (GM ou jogador)"""
    from database.repositories.campaign import get_campaign_by_id
    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        return False

    # GM tem acesso
    if str(campaign.game_master_id) == user_id:
        return True

    # Verificar se é jogador
    for player in campaign.players:
        if str(player.user_id) == user_id and player.is_active:
            return True

    return False


# ================================
# ROTAS PARA CAMPANHAS
# ================================

@campaign_bp.route('/', methods=['POST'])
@token_required
def create_campaign():
    """Rota para criar nova campanha"""
    try:
        data = request.get_json()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Usar user_id do token como GM
        data['game_master_id'] = get_current_user_id()

        # Chamar service de criação
        result = create_campaign_service(data)

        if result.get("success"):
            return jsonify({
                "message": result.get("message"),
                "campaign_id": result.get("campaign_id")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>', methods=['GET'])
@token_required
def get_campaign(campaign_id):
    """Rota para buscar campanha por ID"""
    try:
        user_id = get_current_user_id()

        # Chamar service de busca
        result = get_campaign_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "campaign": result.get("campaign")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/my', methods=['GET'])
@token_required
def get_my_campaigns():
    """Rota para buscar campanhas onde sou Game Master"""
    try:
        # Obter user_id do token
        user_id = get_current_user_id()

        # Validar se user_id é válido
        if not user_id:
            return jsonify({"error": "User ID não encontrado"}), 400

        # Chamar service de busca
        result = get_gm_campaigns_service(user_id)

        if result.get("success"):
            campaigns = result.get("campaigns")
            count = result.get("count")

            # Preparar resposta
            response_data = {"campaigns": campaigns, "count": count}
            return jsonify(response_data), 200
        else:
            error_msg = result.get("error")
            return jsonify({"error": error_msg}), 404

    except Exception as e:
        # Log da exception com mensagem e tipo de erro
        logger.error(f"Exceção em get_my_campaigns: {e}")
        logger.error(f"Tipo da exceção: {type(e)}")
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/joined', methods=['GET'])
@token_required
def get_joined_campaigns():
    """Rota para buscar campanhas onde sou jogador"""
    try:
        user_id = get_current_user_id()

        # Chamar service de busca
        result = get_player_campaigns_service(user_id)

        if result.get("success"):
            return jsonify({
                "campaigns": result.get("campaigns"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/public', methods=['GET'])
@token_required
def get_public_campaigns():
    """Rota para buscar campanhas públicas"""
    try:
        # Chamar service de busca
        result = get_public_campaigns_service()

        if result.get("success"):
            return jsonify({
                "campaigns": result.get("campaigns"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/search', methods=['GET'])
@token_required
def search_campaigns():
    """Rota para buscar campanhas por nome"""
    try:
        query = request.args.get('q', '').strip()
        user_id = get_current_user_id()

        if not query:
            return jsonify({"error": "Parâmetro 'q' é obrigatório"}), 400

        # Chamar service de busca
        result = search_campaigns_service(query, user_id)

        if result.get("success"):
            return jsonify({
                "campaigns": result.get("campaigns"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>', methods=['PUT'])
@token_required
def update_campaign(campaign_id):
    """Rota para atualizar campanha (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service de atualização
        result = update_campaign_service(campaign_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>', methods=['DELETE'])
@token_required
def delete_campaign(campaign_id):
    """Rota para deletar campanha (apenas GM)"""
    try:
        user_id = get_current_user_id()

        # Chamar service de deleção
        result = delete_campaign_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/join', methods=['POST'])
@token_required
def join_campaign(campaign_id):
    """Rota para entrar em uma campanha"""
    try:
        data = request.get_json() or {}
        user_id = get_current_user_id()
        character_id = data.get('character_id')

        # Chamar service para entrar na campanha
        result = join_campaign_service(campaign_id, user_id, character_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/leave', methods=['POST'])
@token_required
def leave_campaign(campaign_id):
    """Rota para sair de uma campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service para sair da campanha
        result = leave_campaign_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================================
# PLAYER MANAGEMENT ROUTES
# ================================

@campaign_bp.route('/<campaign_id>/players', methods=['POST'])
@token_required
def add_player_to_campaign_route(campaign_id):
    """Rota para GM adicionar jogador à campanha"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Validar campos obrigatórios
        target_user_id = data.get('user_id')
        if not target_user_id:
            return jsonify({"error": "user_id é obrigatório"}), 400

        # Chamar service para adicionar jogador
        result = add_player_to_campaign_service(campaign_id, target_user_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "success": True,
                "message": result.get("message")
            }), 201
        else:
            return jsonify({
                "success": False,
                "error": result.get("error")
            }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@campaign_bp.route('/<campaign_id>/players/<player_id>', methods=['DELETE'])
@token_required
def remove_player_from_campaign_route(campaign_id, player_id):
    """Rota para GM remover jogador da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service para remover jogador
        result = remove_player_from_campaign_service(campaign_id, player_id, user_id)

        if result.get("success"):
            return jsonify({
                "success": True,
                "message": result.get("message")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error")
            }), 403

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@campaign_bp.route('/<campaign_id>/players/<player_id>', methods=['PUT'])
@token_required
def update_player_in_campaign_route(campaign_id, player_id):
    """Rota para GM atualizar informações do jogador na campanha"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service para atualizar jogador
        result = update_player_in_campaign_service(campaign_id, player_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "success": True,
                "message": result.get("message")
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error")
            }), 403

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ================================
# ENCOUNTER MANAGEMENT
# ================================

@campaign_bp.route('/<campaign_id>/encounters', methods=['POST'])
@token_required
def add_encounter(campaign_id):
    """Rota para adicionar encontro à campanha (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service para adicionar encontro
        result = add_encounter_service(campaign_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/encounters', methods=['GET'])
@token_required
def get_campaign_encounters(campaign_id):
    """Rota para listar encontros de uma campanha"""
    try:
        user_id = get_current_user_id()

        # Service para buscar encontros
        result = get_encounters_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/encounters/<encounter_id>', methods=['GET'])
@token_required
def get_encounter(campaign_id, encounter_id):
    """Rota para buscar um encontro específico"""
    try:
        user_id = get_current_user_id()
        result = get_encounter_service(campaign_id, encounter_id, user_id)

        if result.get("success"):
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/encounters/<encounter_id>', methods=['PUT'])
@token_required
def update_encounter(campaign_id, encounter_id):
    """Rota para atualizar um encontro"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        result = update_encounter_service(campaign_id, encounter_id, data, user_id)

        if result.get("success"):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/encounters/<encounter_id>', methods=['DELETE'])
@token_required
def delete_encounter(campaign_id, encounter_id):
    """Rota para deletar um encontro"""
    try:
        user_id = get_current_user_id()
        result = delete_encounter_service(campaign_id, encounter_id, user_id)

        if result.get("success"):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================================
# LOOT MANAGEMENT
# ================================

@campaign_bp.route('/<campaign_id>/loot', methods=['POST'])
@token_required
def add_loot(campaign_id):
    """Rota para adicionar loot à campanha (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service para adicionar loot
        result = add_loot_service(campaign_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/loot/<loot_name>/assign', methods=['POST'])
@token_required
def assign_loot(campaign_id, loot_name):
    """Rota para atribuir loot a um jogador (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data or not data.get('player_id'):
            return jsonify({"error": "player_id é obrigatório"}), 400

        player_id = data.get('player_id')

        # Chamar service para atribuir loot
        result = assign_loot_service(campaign_id, loot_name, player_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/stats', methods=['GET'])
@token_required
def get_campaign_stats(campaign_id):
    """Rota para obter estatísticas da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service para obter estatísticas
        result = get_campaign_stats_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "stats": result.get("stats")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================================
# NPC MANAGEMENT - LEGACY ROUTES
# ================================

@campaign_bp.route('/<campaign_id>/npcs', methods=['POST'])
@token_required
def create_npc(campaign_id):
    """Rota para criar NPC na campanha (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Adicionar campaign_id aos dados
        data['campaign_id'] = campaign_id

        # Chamar service para criar NPC
        result = create_npc_service(data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message"),
                "npc_id": result.get("npc_id")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs', methods=['GET'])
@token_required
def get_campaign_npcs(campaign_id):
    """Rota para buscar NPCs da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service para buscar NPCs
        result = get_campaign_npcs_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "npcs": result.get("npcs"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>', methods=['GET'])
@token_required
def get_npc(campaign_id, npc_id):
    """Rota para buscar NPC específico"""
    try:
        user_id = get_current_user_id()

        # Chamar service para buscar NPC
        result = get_npc_service(npc_id, user_id)

        if result.get("success"):
            return jsonify({
                "npc": result.get("npc")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>', methods=['PUT'])
@token_required
def update_npc(campaign_id, npc_id):
    """Rota para atualizar NPC (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service para atualizar NPC
        result = update_npc_service(npc_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>', methods=['DELETE'])
@token_required
def delete_npc(campaign_id, npc_id):
    """Rota para deletar NPC (apenas GM)"""
    try:
        user_id = get_current_user_id()

        # Chamar service para deletar NPC
        result = delete_npc_service(npc_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>/kill', methods=['POST'])
@token_required
def kill_npc(campaign_id, npc_id):
    """Rota para matar NPC (apenas GM)"""
    try:
        user_id = get_current_user_id()

        # Chamar service para matar NPC
        result = kill_npc_service(npc_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>/revive', methods=['POST'])
@token_required
def revive_npc(campaign_id, npc_id):
    """Rota para reviver NPC (apenas GM)"""
    try:
        user_id = get_current_user_id()

        # Chamar service para reviver NPC
        result = revive_npc_service(npc_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>/relationships', methods=['POST'])
@token_required
def add_npc_relationship(campaign_id, npc_id):
    """Rota para adicionar relacionamento ao NPC (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        target_name = data.get('target_name')
        relationship_type = data.get('relationship_type')

        if not target_name or not relationship_type:
            return jsonify({"error": "target_name e relationship_type são obrigatórios"}), 400

        # Chamar service para adicionar relacionamento
        result = add_npc_relationship_service(npc_id, target_name, relationship_type, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/<npc_id>/abilities', methods=['POST'])
@token_required
def add_npc_ability(campaign_id, npc_id):
    """Rota para adicionar habilidade ao NPC (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        ability_name = data.get('name')
        ability_description = data.get('description')

        if not ability_name or not ability_description:
            return jsonify({"error": "name e description são obrigatórios"}), 400

        # Chamar service para adicionar habilidade
        result = add_npc_ability_service(npc_id, ability_name, ability_description, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/type/<npc_type>', methods=['GET'])
@token_required
def get_npcs_by_type(campaign_id, npc_type):
    """Rota para buscar NPCs por tipo"""
    try:
        user_id = get_current_user_id()

        # Chamar service para buscar NPCs por tipo
        result = get_npcs_by_type_service(campaign_id, npc_type, user_id)

        if result.get("success"):
            return jsonify({
                "npcs": result.get("npcs"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/location/<location>', methods=['GET'])
@token_required
def get_npcs_by_location(campaign_id, location):
    """Rota para buscar NPCs por localização"""
    try:
        user_id = get_current_user_id()

        # Chamar service para buscar NPCs por localização
        result = get_npcs_by_location_service(campaign_id, location, user_id)

        if result.get("success"):
            return jsonify({
                "npcs": result.get("npcs"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/search', methods=['GET'])
@token_required
def search_npcs(campaign_id):
    """Rota para buscar NPCs por nome"""
    try:
        query = request.args.get('q', '').strip()
        user_id = get_current_user_id()

        if not query:
            return jsonify({"error": "Parâmetro 'q' é obrigatório"}), 400

        # Chamar service para buscar NPCs por nome
        result = search_npcs_service(campaign_id, query, user_id)

        if result.get("success"):
            return jsonify({
                "npcs": result.get("npcs"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/filtered', methods=['GET'])
@token_required
def get_npcs_filtered(campaign_id):
    """Rota para buscar NPCs com filtros múltiplos"""
    try:
        user_id = get_current_user_id()

        # Chamar service para buscar NPCs filtrados
        result = get_npcs_filtered_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "npcs": result.get("npcs"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/stats', methods=['GET'])
@token_required
def get_npc_stats_route(campaign_id):
    """Rota para obter estatísticas dos NPCs da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service para obter estatísticas de NPCs
        result = get_npc_stats_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "stats": result.get("stats")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================
# ENHANCED NPC ROUTES - SISTEMA AVANÇADO
# ===========================

@campaign_bp.route('/<campaign_id>/npcs/enhanced', methods=['POST'])
@token_required
def create_enhanced_npc_route(campaign_id):
    """Criar NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados do NPC não fornecidos"}), 400

        # Verificar se é GM
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem criar NPCs"}), 403

        # Adicionar campaign_id aos dados
        data['campaign_id'] = campaign_id

        # Criar NPC Enhanced
        try:
            npc_data = EnhancedNPCCreate(**data)
            npc_id = create_enhanced_npc(npc_data)

            if npc_id:
                return jsonify({
                    "success": True,
                    "message": "NPC Enhanced criado com sucesso",
                    "npc_id": str(npc_id)
                }), 201
            else:
                return jsonify({"error": "Falha ao criar NPC"}), 500

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced', methods=['GET'])
@token_required
def get_enhanced_npcs_route(campaign_id):

    """Listar NPCs Enhanced da campanha"""
    try:
        user_id = get_current_user_id()

        # Verificar acesso à campanha
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        # Obter parâmetros de paginação
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)
        sort_by = request.args.get('sort_by', 'name')
        sort_order = int(request.args.get('sort_order', 1))

        # Obter filtros opcionais
        filters = NPCSearchFilters()
        if request.args.get('name'):
            filters.name = request.args.get('name')

        # Buscar NPCs Enhanced
        result = get_enhanced_npcs_by_campaign(
            campaign_id, filters, page, per_page, sort_by, sort_order
        )

        return jsonify({
            "success": True,
            "npcs": [npc.dict() for npc in result.npcs],
            "total": result.total,
            "page": result.page,
            "per_page": result.per_page,
            "total_pages": (result.total + per_page - 1) // per_page
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>', methods=['GET'])
@token_required
def get_enhanced_npc_route(campaign_id, npc_id):
    """Buscar NPC Enhanced específico"""
    try:
        user_id = get_current_user_id()

        # Verificar acesso à campanha
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        # Buscar NPC
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        # Verificar se pertence à campanha
        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

        return jsonify({
            "success": True,
            "npc": npc.dict()
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>', methods=['PUT'])
@token_required
def update_enhanced_npc_route(campaign_id, npc_id):
    """Atualizar NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Verificar se é GM
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem atualizar NPCs"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc or str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não encontrado nesta campanha"}), 404

        try:
            # Atualizar NPC
            update_data = EnhancedNPCUpdate(**data)
            success = update_enhanced_npc(npc_id, update_data)

            if success:
                return jsonify({
                    "success": True,
                    "message": "NPC atualizado com sucesso"
                }), 200
            else:
                return jsonify({"error": "Falha ao atualizar NPC"}), 500

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>', methods=['DELETE'])
@token_required
def delete_enhanced_npc_route(campaign_id, npc_id):
    """Deletar NPC Enhanced"""
    try:
        user_id = get_current_user_id()

        # Verificar se é GM
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem deletar NPCs"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc or str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não encontrado nesta campanha"}), 404

        # Deletar NPC
        success = delete_enhanced_npc(npc_id)

        if success:
            return jsonify({
                "success": True,
                "message": "NPC removido com sucesso"
            }), 200
        else:
            return jsonify({"error": "Falha ao remover NPC"}), 500

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/roll-dice', methods=['POST'])
@token_required
def roll_dice_for_npc_route(campaign_id, npc_id):
    """Rolar dados para NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados da rolagem não fornecidos"}), 400

        # Verificar acesso à campanha
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc or str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não encontrado nesta campanha"}), 404

        try:
            dice_request = DiceRollRequest(**data)
            result = roll_dice_for_npc(npc_id, dice_request)

            return jsonify({
                "success": True,
                "result": result.dict()
            }), 200

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/cast-spell', methods=['POST'])
@token_required
def cast_spell_for_npc_route(campaign_id, npc_id):
    """Lançar magia para NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados da magia não fornecidos"}), 400

        # Verificar se é GM (só GMs podem lançar magias)
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem lançar magias"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc or str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não encontrado nesta campanha"}), 404

        try:
            spell_request = CastSpellRequest(**data)
            result = cast_spell_for_npc(npc_id, spell_request)

            return jsonify({
                "success": True,
                "result": result.dict()
            }), 200

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/hit-points', methods=['PUT'])
@token_required
def update_npc_hit_points_route(campaign_id, npc_id):
    """Atualizar HP do NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados de HP não fornecidos"}), 400

        # Verificar se é GM
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem atualizar HP"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc or str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não encontrado nesta campanha"}), 404

        try:
            hp_request = UpdateHitPointsRequest(**data)
            result = update_npc_hit_points(npc_id, hp_request)

            return jsonify({
                "success": True,
                "result": result.dict()
            }), 200

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500