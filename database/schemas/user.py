from pydantic import BaseModel, EmailStr, ConfigDict
from bson import ObjectId


class User(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: ObjectId
    email: EmailStr
    username: str
    password: str  # Senha com hash (bcrypt, scrypt, etc.)