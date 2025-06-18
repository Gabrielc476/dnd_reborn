from bson import ObjectId
from typing import Optional, Dict, Any
from database.db import mydb  # Importa a conexão do arquivo database.py
from database.schemas.user import User  # Importa o schema User

users_collection = mydb["users"]

def create_user(user_data: Dict[str, Any]) -> ObjectId:
    """Insere um novo usuário no banco"""
    result = users_collection.insert_one(user_data)
    return result.inserted_id

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retorna usuário pelo ID"""
    return users_collection.find_one({"_id": ObjectId(user_id)})

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retorna usuário pelo email"""
    return users_collection.find_one({"email": email})

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Retorna usuário pelo username"""
    return users_collection.find_one({"username": username})

def get_all_users() -> list:
    """Retorna todos os usuários"""
    return list(users_collection.find())

def create_user_from_schema(user: User) -> ObjectId:
    """Insere um novo usuário usando o schema Pydantic"""
    user_dict = user.dict(by_alias=True, exclude_unset=True)
    result = users_collection.insert_one(user_dict)
    return result.inserted_id

def get_user_as_schema(user_id: str) -> Optional[User]:
    """Retorna usuário pelo ID como objeto User"""
    user_data = users_collection.find_one({"_id": ObjectId(user_id)})
    if user_data:
        return User(**user_data)
    return None