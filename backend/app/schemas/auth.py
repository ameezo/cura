from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str  # "patient" or "doctor"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("patient", "doctor"):
            raise ValueError("Role must be 'patient' or 'doctor'")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
