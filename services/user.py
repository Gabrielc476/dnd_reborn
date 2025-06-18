import bcrypt
from typing import Dict, Any, Optional
from database.schemas.user import User
from database.repositories.user import create_user, get_user_by_email, get_user_by_username, get_user_by_id
from pydantic import ValidationError


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

        # Validar formato do email básico
        if "@" not in data["email"] or "." not in data["email"]:
            return {"success": False, "error": "Formato de email inválido"}

        # Validar tamanho da senha
        if len(data["password"]) < 6:
            return {"success": False, "error": "Senha deve ter pelo menos 6 caracteres"}

        # Validar tamanho do username
        if len(data["username"]) < 3:
            return {"success": False, "error": "Username deve ter pelo menos 3 caracteres"}

        # Hash da senha
        password_hash = bcrypt.hashpw(
            data["password"].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Preparar dados para inserção
        user_to_create = {
            "email": data["email"],
            "username": data["username"],
            "password": password_hash
        }

        # Criar usuário no banco
        user_id = create_user(user_to_create)

        return {
            "success": True,
            "user_id": user_id,
            "message": "Usuário criado com sucesso"
        }

    except Exception as e:
        return {"success": False, "error": f"Erro interno: {str(e)}"}


def login_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida dados e autentica usuário"""
    try:
        # Validar campos obrigatórios
        if not data.get("email") or not data.get("password"):
            return {"success": False, "error": "Email e senha são obrigatórios"}

        # Buscar usuário pelo email
        user = get_user_by_email(data["email"])
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