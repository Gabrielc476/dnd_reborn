from flask import request, jsonify, Blueprint
import jwt
import os
from datetime import datetime, timedelta

from middleware.auth import token_required
from services.user import register_user, login_user, get_user_profile,  search_users_service

auth_bp = Blueprint('auth', __name__)

# Chave secreta para JWT (carregar da env)
JWT_SECRET = os.getenv("JWT_SECRET", "sua-chave-secreta-aqui")


@auth_bp.route('/register', methods=['POST'])
def register():
    """Rota para registro de usuário"""
    try:
        data = request.get_json()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service de registro
        result = register_user(data)

        if result.get("success"):
            return jsonify({
                "message": "Usuário criado com sucesso",
                "user_id": str(result.get("user_id"))
            }), 201
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Rota para login de usuário"""
    try:
        data = request.get_json()

        # Validar se dados foram enviados
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Chamar service de login
        result = login_user(data)

        if result.get("success"):
            # Gerar JWT token
            user_id = result.get("user_id")
            payload = {
                "user_id": str(user_id),
                "exp": datetime.utcnow() + timedelta(hours=24)  # Token expira em 24h
            }

            token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

            return jsonify({
                "message": "Login realizado com sucesso",
                "token": token,
                "user": result.get("user")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    """Rota para recuperar perfil do usuário"""
    try:
        # Chamar service para buscar usuário
        result = get_user_profile(user_id)

        if result.get("success"):
            return jsonify({
                "user": result.get("user")
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/search', methods=['GET'])
@token_required
def search_users():
    """Buscar usuários por username ou email"""
    try:
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({"error": "Parâmetro 'q' é obrigatório"}), 400

        if len(query) < 2:
            return jsonify({"error": "Query deve ter pelo menos 2 caracteres"}), 400

        # Chamar service para buscar usuários
        result = search_users_service(query)

        if result.get("success"):
            return jsonify({
                "success": True,
                "users": result.get("users", []),
                "count": result.get("count", 0)
            }), 200
        else:
            return jsonify({"error": result.get("error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500