from flask import request, jsonify, Blueprint, g
from middleware.auth import token_required, get_current_user_id
from services.character import (
    create_character_service,
    get_character_service,
    get_user_characters_service,
    get_campaign_characters_service,
    update_character_service,
    delete_character_service
)

character_bp = Blueprint('character', __name__)


@character_bp.route('/', methods=['POST'])
@token_required
def create_character():
    """Rota para criar novo personagem"""
    try:
        data = request.get_json()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Usar user_id do token
        data['user_id'] = get_current_user_id()

        # Chamar service de criação
        result = create_character_service(data)

        if result.get("success"):
            return jsonify({
                "message": result.get("message"),
                "character_id": result.get("character_id")
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@character_bp.route('/<character_id>', methods=['GET'])
@token_required
def get_character(character_id):
    """Rota para buscar personagem por ID"""
    try:
        # Chamar service de busca
        result = get_character_service(character_id)

        if result.get("success"):
            character = result.get("character")

            # Verificar se o personagem pertence ao usuário autenticado
            if character.get("user_id") != get_current_user_id():
                return jsonify({"error": "Acesso negado a este personagem"}), 403

            return jsonify({
                "character": character
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@character_bp.route('/', methods=['GET'])
@token_required
def get_my_characters():
    """Rota para buscar todos os personagens do usuário autenticado"""
    try:
        user_id = get_current_user_id()

        # Chamar service de busca
        result = get_user_characters_service(user_id)

        if result.get("success"):
            return jsonify({
                "characters": result.get("characters"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@character_bp.route('/campaign/<campaign_id>', methods=['GET'])
@token_required
def get_campaign_characters(campaign_id):
    """Rota para buscar todos os personagens de uma campanha"""
    try:
        # Chamar service de busca
        result = get_campaign_characters_service(campaign_id)

        if result.get("success"):
            return jsonify({
                "characters": result.get("characters"),
                "count": result.get("count")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@character_bp.route('/<character_id>', methods=['PUT'])
@token_required
def update_character(character_id):
    """Rota para atualizar personagem"""
    try:
        data = request.get_json()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Verificar se o personagem pertence ao usuário antes de atualizar
        char_result = get_character_service(character_id)
        if not char_result.get("success"):
            return jsonify({"error": "Personagem não encontrado"}), 404

        if char_result.get("character").get("user_id") != get_current_user_id():
            return jsonify({"error": "Acesso negado para atualizar este personagem"}), 403

        # Garantir que o user_id não seja alterado
        data['user_id'] = get_current_user_id()

        # Chamar service de atualização
        result = update_character_service(character_id, data)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@character_bp.route('/<character_id>', methods=['DELETE'])
@token_required
def delete_character(character_id):
    """Rota para deletar personagem"""
    try:
        user_id = get_current_user_id()

        # Chamar service de deleção (já verifica permissão internamente)
        result = delete_character_service(character_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500