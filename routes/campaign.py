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
    get_campaign_stats_service
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

campaign_bp = Blueprint('campaign', __name__)


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
        user_id = get_current_user_id()

        # Chamar service de busca
        result = get_gm_campaigns_service(user_id)

        if result.get("success"):
            return jsonify({
                "campaigns": result.get("campaigns"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
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
    """Rota para buscar estatísticas da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service de estatísticas
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
# ROTAS PARA NPCs
# ================================

@campaign_bp.route('/<campaign_id>/npcs', methods=['POST'])
@token_required
def create_npc(campaign_id):
    """Rota para criar novo NPC (apenas GM)"""
    try:
        data = request.get_json()
        user_id = get_current_user_id()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Garantir que o campaign_id seja usado
        data['campaign_id'] = campaign_id

        # Chamar service de criação
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
    """Rota para buscar todos os NPCs de uma campanha"""
    try:
        user_id = get_current_user_id()

        # Verificar filtros opcionais
        npc_type = request.args.get('type')
        location = request.args.get('location')
        faction = request.args.get('faction')
        is_alive = request.args.get('is_alive')
        is_active = request.args.get('is_active')
        search_query = request.args.get('search')

        # Converter parâmetros booleanos
        if is_alive is not None:
            is_alive = is_alive.lower() == 'true'
        if is_active is not None:
            is_active = is_active.lower() == 'true'

        # Se há busca por nome, usar service de busca
        if search_query:
            result = search_npcs_service(campaign_id, search_query, user_id)
        # Se há filtros, usar service de filtros
        elif any([npc_type, location, faction, is_alive is not None, is_active is not None]):
            result = get_npcs_filtered_service(
                campaign_id, user_id, npc_type, location, faction, is_alive, is_active
            )
        # Senão, buscar todos os NPCs
        else:
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

        # Chamar service de busca
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

        # Chamar service de atualização
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

        # Chamar service de deleção
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
    """Rota para marcar NPC como morto (apenas GM)"""
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

        # Chamar service para adicionar habilidade
        result = add_npc_ability_service(npc_id, data, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign_bp.route('/<campaign_id>/npcs/by-type/<npc_type>', methods=['GET'])
@token_required
def get_npcs_by_type(campaign_id, npc_type):
    """Rota para buscar NPCs por tipo"""
    try:
        user_id = get_current_user_id()

        # Chamar service de busca por tipo
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


@campaign_bp.route('/<campaign_id>/npcs/by-location/<location>', methods=['GET'])
@token_required
def get_npcs_by_location(campaign_id, location):
    """Rota para buscar NPCs por localização"""
    try:
        user_id = get_current_user_id()

        # Chamar service de busca por localização
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


@campaign_bp.route('/<campaign_id>/npcs/stats', methods=['GET'])
@token_required
def get_npc_stats(campaign_id):
    """Rota para buscar estatísticas dos NPCs da campanha"""
    try:
        user_id = get_current_user_id()

        # Chamar service de estatísticas
        result = get_npc_stats_service(campaign_id, user_id)

        if result.get("success"):
            return jsonify({
                "stats": result.get("stats")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500