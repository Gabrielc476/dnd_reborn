import bcrypt
import re
from typing import Dict, Any, Optional
from database.schemas.user import User
from database.repositories.user import create_user, get_user_by_email, get_user_by_username, get_user_by_id,  search_users_by_query, get_user_by_username_or_email
from pydantic import ValidationError


def is_valid_email(email: str) -> bool:
    """Validação customizada de email"""
    if not isinstance(email, str):
        return False

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email.strip()))


def is_valid_username(username: str) -> bool:
    """Validação customizada de username"""
    if not isinstance(username, str):
        return False

    username = username.strip()

    if len(username) < 3 or len(username) > 50:
        return False

    # Permitir apenas letras, números e underscore
    return bool(re.match(r'^[a-zA-Z0-9_]+$', username))


def is_valid_password(password: str) -> bool:
    """Validação customizada de senha"""
    if not isinstance(password, str):
        return False

    return len(password) >= 6


def register_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida dados e registra novo usuário"""
    try:
        # Validar campos obrigatórios
        required_fields = ["email", "username", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Campo '{field}' é obrigatório"}

        # Validar se email já existe
        existing_user = get_user_by_email(data["email"])
        if existing_user:
            return {"success": False, "error": "Email já cadastrado"}

        # Validar se username já existe
        existing_username = get_user_by_username(data["username"])
        if existing_username:
            return {"success": False, "error": "Username já existe"}

        # Validar formato do email
        if not is_valid_email(data["email"]):
            return {"success": False, "error": "Formato de email inválido"}

        # Validar username
        if not is_valid_username(data["username"]):
            return {"success": False,
                    "error": "Username deve ter entre 3-50 caracteres e conter apenas letras, números e underscore"}

        # Validar tamanho da senha
        if not is_valid_password(data["password"]):
            return {"success": False, "error": "Senha deve ter pelo menos 6 caracteres"}

        # Hash da senha
        password_hash = bcrypt.hashpw(
            data["password"].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Preparar dados para inserção
        user_to_create = {
            "email": data["email"].lower().strip(),
            "username": data["username"].strip(),
            "password": password_hash
        }

        # Criar usuário no banco
        user_id = create_user(user_to_create)

        return {
            "success": True,
            "user_id": user_id,
            "message": "Usuário criado com sucesso"
        }

    except ValidationError as e:
        return {"success": False, "error": f"Dados inválidos: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def login_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida dados e autentica usuário"""
    try:
        # Validar campos obrigatórios
        if not data.get("email") or not data.get("password"):
            return {"success": False, "error": "Email e senha são obrigatórios"}

        # Normalizar email
        email = data["email"].lower().strip()

        # Buscar usuário pelo email
        user = get_user_by_email(email)
        if not user:
            return {"success": False, "error": "Email ou senha incorretos"}

        # Verificar senha
        password_valid = bcrypt.checkpw(
            data["password"].encode('utf-8'),
            user["password"].encode('utf-8')
        )

        if not password_valid:
            return {"success": False, "error": "Email ou senha incorretos"}

        # Remover senha dos dados de retorno
        user_data = {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"]
        }

        return {
            "success": True,
            "user_id": user["_id"],
            "user": user_data,
            "message": "Login realizado com sucesso"
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Recupera perfil do usuário pelo ID"""
    try:
        # Buscar usuário pelo ID
        user = get_user_by_id(user_id)
        if not user:
            return {"success": False, "error": "Usuário não encontrado"}

        # Retornar dados sem senha
        user_data = {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"]
        }

        return {
            "success": True,
            "user": user_data
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def search_users_service(query: str) -> Dict[str, Any]:
    """Busca usuários por username ou email"""
    try:


        # Buscar usuários
        users = search_users_by_query(query)

        # Converter para formato de resposta (sem senhas)
        users_response = []
        for user in users:
            user_data = {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"]
            }
            users_response.append(user_data)

        return {
            "success": True,
            "users": users_response,
            "count": len(users_response)
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def find_user_by_identifier_service(identifier: str) -> Dict[str, Any]:
    """Encontra usuário por username ou email"""
    try:
        # Verificar se é email ou username
        if "@" in identifier:
            user = get_user_by_email(identifier.lower().strip())
        else:
            user = get_user_by_username(identifier.strip())

        if not user:
            return {"success": False, "error": "Usuário não encontrado"}

        # Retornar dados sem senha
        user_data = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"]
        }

        return {
            "success": True,
            "user": user_data
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}

def get_user_by_id_service(user_id: str) -> Dict[str, Any]:
    """Busca usuário pelo ID"""
    try:
        # Buscar usuário pelo ID
        user = get_user_by_id(user_id)
        if not user:
            return {"success": False, "error": "Usuário não encontrado"}

        # Retornar dados sem senha
        user_data = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"]
        }

        return {
            "success": True,
            "user": user_data
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}