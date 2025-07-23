from flask import request, jsonify, Blueprint, g
from middleware.auth import token_required, get_current_user_id
import logging
from services.character import (
    create_character_service,
    get_character_service,
    get_user_characters_service,
    get_campaign_characters_service,
    update_character_service,
    delete_character_service
)

character_bp = Blueprint('character', __name__)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

@character_bp.route('/', methods=['POST'])
@token_required
def create_character():
    """Rota para criar novo personagem"""
    try:
        logger.info("Iniciando criação de personagem")
        logger.info(f"Headers: {dict(request.headers)}")

        data = request.get_json()
        logger.info(f"Dados recebidos: {data}")

        if not data:
            logger.error("Dados não fornecidos na requisição")
            return jsonify({"error": "Dados não fornecidos"}), 400

        user_id = get_current_user_id()
        data['user_id'] = user_id
        logger.info(f"User ID do token: {user_id}")

        required_fields = ['basic_info', 'attributes', 'skills']
        for field in required_fields:
            if field not in data:
                logger.error(f"Campo obrigatório faltando: {field}")

        logger.info("Chamando serviço de criação de personagem")
        result = create_character_service(data)
        logger.info(f"Resultado do serviço: {result}")

        if result.get("success"):
            logger.info(f"Personagem criado com sucesso. ID: {result.get('character_id')}")
            return jsonify({
                "success": True,
                "message": result.get("message"),
                "character_id": result.get("character_id")
            }), 201
        else:
            error_msg = result.get("error", "Erro desconhecido ao criar personagem")
            logger.error(f"Erro na criação do personagem: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg,
                "details": result.get("details", "")
            }), 400

    except Exception as e:
        logger.exception("EXCEÇÃO NÃO TRATADA NA CRIAÇÃO DE PERSONAGEM")
        return jsonify({
            "success": False,
            "error": "Erro interno no servidor",
            "details": str(e)
        }), 500

@character_bp.route('/<character_id>', methods=['GET'])
@token_required
def get_character(character_id):
    """Rota para buscar personagem por ID"""
    try:
        result = get_character_service(character_id)

        if result.get("success"):
            character = result.get("character")
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

@character_bp.route('/campaign/<campaign_id>/characters', methods=['GET'])
def get_campaign_characters(campaign_id):
    try:
        logger.info(f"Recebendo requisição para campaign_id: {campaign_id}")
        result = get_campaign_characters_service(campaign_id)
        if result.get("success"):
            logger.info(f"Personagens encontrados: {len(result.get('characters'))}")
            return jsonify({
                "success": True,
                "characters": result.get("characters"),
                "count": result.get("count")
            }), 200
        else:
            logger.error(f"Erro ao buscar personagens: {result.get('error')}")
            return jsonify({"success": False, "error": result.get("error")}), 404
    except Exception as e:
        logger.exception("Exceção não tratada na rota get_campaign_characters")
        return jsonify({"success": False, "error": str(e)}), 500

@character_bp.route('/<character_id>', methods=['PUT'])
@token_required
def update_character(character_id):
    """Rota para atualizar personagem"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        char_result = get_character_service(character_id)
        if not char_result.get("success"):
            return jsonify({"error": "Personagem não encontrado"}), 404

        if char_result.get("character").get("user_id") != get_current_user_id():
            return jsonify({"error": "Acesso negado para atualizar este personagem"}), 403

        data['user_id'] = get_current_user_id()
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
        result = delete_character_service(character_id, user_id)

        if result.get("success"):
            return jsonify({
                "message": result.get("message")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500