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


# ===========================
# ROTAS ENHANCED NPCs
# ===========================

@campaign_bp.route('/<campaign_id>/npcs/enhanced', methods=['POST'])
@token_required
def create_enhanced_npc_route(campaign_id):
    """Criar NPC Enhanced"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Verificar se usuário é GM da campanha (usar sua função existente)
        # Assumindo que você já tem uma função similar
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem criar NPCs"}), 403

        # Garantir que o campaign_id seja usado
        data['campaign_id'] = campaign_id

        # Validar e criar NPC
        try:
            npc_data = EnhancedNPCCreate(**data)
            npc_id = create_enhanced_npc(npc_data, ObjectId(user_id))

            return jsonify({
                "success": True,
                "message": f"NPC {data.get('name')} criado com sucesso",
                "npc_id": npc_id
            }), 201

        except ValueError as e:
            return jsonify({"error": f"Dados inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced', methods=['GET'])
@token_required
def get_enhanced_npcs_route(campaign_id):
    """Buscar NPCs Enhanced com filtros"""
    try:
        user_id = get_current_user_id()

        # Verificar acesso à campanha (usar sua função existente)
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        # Extrair parâmetros da query
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)

        # Construir filtros
        filters = NPCSearchFilters()

        if request.args.get('name'):
            filters.name = request.args.get('name')

        if request.args.getlist('npc_type'):
            from database.schemas.enhanced_npc import NPCType
            filters.npc_type = [NPCType(t) for t in request.args.getlist('npc_type')]

        if request.args.get('is_alive'):
            filters.is_alive = request.args.get('is_alive').lower() == 'true'

        if request.args.get('is_active'):
            filters.is_active = request.args.get('is_active').lower() == 'true'

        # Executar busca
        result = get_enhanced_npcs_by_campaign(campaign_id, filters, page, per_page)

        return jsonify({
            "success": True,
            "npcs": [npc.dict() for npc in result.npcs],
            "total": result.total,
            "page": result.page,
            "per_page": result.per_page
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>', methods=['GET'])
@token_required
def get_enhanced_npc_route(campaign_id, npc_id):
    """Buscar NPC Enhanced por ID"""
    try:
        user_id = get_current_user_id()

        # Verificar acesso à campanha
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        npc = get_enhanced_npc_by_id(npc_id)

        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

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
            return jsonify({"error": "Apenas GMs podem editar NPCs"}), 403

        # Verificar se NPC existe e pertence à campanha
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

        # Validar e atualizar
        try:
            updates = EnhancedNPCUpdate(**data)
            success = update_enhanced_npc(npc_id, updates)

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
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

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


# ===========================
# ROTAS DE ROLAGEM DE DADOS
# ===========================

@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/roll', methods=['POST'])
@token_required
def roll_dice_for_npc_route(campaign_id, npc_id):
    """Executar rolagem de dados para NPC"""
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
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

        # Executar rolagem
        try:
            roll_request = DiceRollRequest(**data)
            result = roll_dice_for_npc(npc_id, roll_request)

            if result:
                return jsonify({
                    "success": True,
                    "result": result.dict()
                }), 200
            else:
                return jsonify({"error": "Falha ao executar rolagem"}), 500

        except ValueError as e:
            return jsonify({"error": f"Dados de rolagem inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/cast-spell', methods=['POST'])
@token_required
def cast_spell_route(campaign_id, npc_id):
    """Conjurar magia"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados da magia não fornecidos"}), 400

        # Verificar acesso à campanha
        if not user_has_access_to_campaign(user_id, campaign_id):
            return jsonify({"error": "Acesso negado à campanha"}), 403

        # Verificar se NPC existe
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

        # Conjurar magia
        try:
            cast_request = CastSpellRequest(**data)
            result = cast_spell_for_npc(cast_request)

            response_data = {
                "success": True,
                "message": "Magia conjurada com sucesso"
            }

            if result:
                response_data["result"] = result.dict()

            return jsonify(response_data), 200

        except ValueError as e:
            return jsonify({"error": f"Dados de conjuração inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@campaign_bp.route('/<campaign_id>/npcs/enhanced/<npc_id>/hit-points', methods=['PUT'])
@token_required
def update_hit_points_route(campaign_id, npc_id):
    """Atualizar pontos de vida"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados dos pontos de vida não fornecidos"}), 400

        # Verificar se é GM ou tem permissão
        if not user_is_gm_of_campaign(user_id, campaign_id):
            return jsonify({"error": "Apenas GMs podem alterar HP"}), 403

        # Verificar se NPC existe
        npc = get_enhanced_npc_by_id(npc_id)
        if not npc:
            return jsonify({"error": "NPC não encontrado"}), 404

        if str(npc.campaign_id) != campaign_id:
            return jsonify({"error": "NPC não pertence a esta campanha"}), 403

        # Atualizar HP
        try:
            data['npc_id'] = npc_id
            hp_request = UpdateHitPointsRequest(**data)
            success = update_npc_hit_points(hp_request)

            if success:
                return jsonify({
                    "success": True,
                    "message": "Pontos de vida atualizados com sucesso"
                }), 200
            else:
                return jsonify({"error": "Falha ao atualizar pontos de vida"}), 500

        except ValueError as e:
            return jsonify({"error": f"Dados de HP inválidos: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


# ===========================
# FUNÇÕES AUXILIARES CORRIGIDAS
# ===========================

def user_is_gm_of_campaign(user_id: str, campaign_id: str) -> bool:
    """Verifica se usuário é GM da campanha"""
    try:
        from database.repositories.campaign import get_campaign_by_id
        from bson import ObjectId

        # Validar ObjectId
        if not ObjectId.is_valid(campaign_id):
            return False

        campaign = get_campaign_by_id(campaign_id)
        if campaign:
            # CORRIGIDO: campaign é objeto Pydantic, usar atributo direto
            return str(campaign.game_master_id) == user_id
        return False
    except Exception as e:
        print(f"Erro ao verificar GM: {e}")
        return False


def user_has_access_to_campaign(user_id: str, campaign_id: str) -> bool:
    """Verifica se usuário tem acesso à campanha"""
    try:
        from database.repositories.campaign import get_campaign_by_id
        from bson import ObjectId

        # Validar ObjectId
        if not ObjectId.is_valid(campaign_id):
            return False

        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            return False

        # Verificar se é GM
        if str(campaign.game_master_id) == user_id:
            return True

        # Verificar se a campanha é pública
        if campaign.is_public:
            return True

        # Verificar se é jogador
        for player in campaign.players:
            if str(player.user_id) == user_id:
                return True

        return False
    except Exception as e:
        print(f"Erro ao verificar acesso à campanha: {e}")
        return False