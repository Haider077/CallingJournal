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

