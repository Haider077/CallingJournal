from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    context: Optional[str] = None

class ChatMessage(ChatMessageBase):
    id: int
    timestamp: datetime
    session_id: int

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    user_id: int
    messages: list[ChatMessage] = []

    class Config:
        from_attributes = True

# Journal Entry Schemas
class JournalEntryBase(BaseModel):
    date: date
    title: Optional[str] = "Journal Entry"
    mood: Optional[str] = "📝"
    duration: Optional[str] = None
    content: Optional[str] = None
    is_starred: Optional[bool] = False
    is_hidden: Optional[bool] = False

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    mood: Optional[str] = None
    duration: Optional[str] = None
    content: Optional[str] = None
    is_starred: Optional[bool] = None
    is_hidden: Optional[bool] = None

class JournalEntry(JournalEntryBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

