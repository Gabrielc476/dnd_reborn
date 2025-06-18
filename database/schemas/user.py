from pydantic import BaseModel, EmailStr
from bson import ObjectId


class User(BaseModel):
    id: ObjectId
    email: EmailStr
    username: str
    password: str  # Senha com hash (bcrypt, scrypt, etc.)

    class Config:
        arbitrary_types_allowed = True
