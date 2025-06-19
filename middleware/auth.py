from functools import wraps
from flask import request, jsonify, g
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "sua-chave-secreta-aqui")


def token_required(f):
    """Decorator para proteger rotas com autenticação JWT"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Formato esperado: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Formato de token inválido. Use: Bearer <token>'}), 401

        if not token:
            return jsonify({'error': 'Token de acesso é obrigatório'}), 401

        try:
            # Decodificar e verificar o token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user_id = data['user_id']

            # Disponibilizar user_id para a rota
            g.current_user_id = current_user_id

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        except Exception as e:
            return jsonify({'error': 'Erro na validação do token'}), 401

        return f(*args, **kwargs)

    return decorated


def get_current_user_id():
    """Helper para obter o user_id do usuário autenticado"""
    return getattr(g, 'current_user_id', None)