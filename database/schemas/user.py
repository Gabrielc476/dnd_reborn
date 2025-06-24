from pydantic import BaseModel, ConfigDict, field_validator
from bson import ObjectId
import re


class User(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: ObjectId
    email: str
    username: str
    password: str  # Senha com hash (bcrypt, scrypt, etc.)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validação customizada de email sem dependência externa"""
        if not isinstance(v, str):
            raise ValueError('Email deve ser uma string')

        # Regex para validação básica de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        if not re.match(email_pattern, v):
            raise ValueError('Formato de email inválido')

        # Normalizar email (minúsculo e sem espaços)
        return v.lower().strip()

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Validação do username"""
        if not isinstance(v, str):
            raise ValueError('Username deve ser uma string')

        if len(v.strip()) < 3:
            raise ValueError('Username deve ter pelo menos 3 caracteres')

        if len(v.strip()) > 50:
            raise ValueError('Username não pode ter mais de 50 caracteres')

        # Permitir apenas letras, números e underscore
        if not re.match(r'^[a-zA-Z0-9_]+$', v.strip()):
            raise ValueError('Username deve conter apenas letras, números e underscore')

        return v.strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validação básica da senha (já deve estar hasheada)"""
        if not isinstance(v, str):
            raise ValueError('Password deve ser uma string')

        if len(v) < 6:
            raise ValueError('Password deve ter pelo menos 6 caracteres')

        return v