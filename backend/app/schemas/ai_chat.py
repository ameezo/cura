from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class AIMessageRead(BaseModel):
    id: int
    conversation_id: int
    sender: str
    content: str
    created_at: str


class AIConversationRead(BaseModel):
    id: int
    user_id: int
    role: str
    created_at: str
    updated_at: str


class AIChatResponse(BaseModel):
    conversation_id: int
    user_message: AIMessageRead
    assistant_message: AIMessageRead
