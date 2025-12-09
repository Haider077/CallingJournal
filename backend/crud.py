from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import date
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_chat_session(db: Session, user_id: int, title: str = "New Chat"):
    db_session = models.ChatSession(user_id=user_id, title=title)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_chat_sessions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ChatSession).filter(
        models.ChatSession.user_id == user_id
    ).order_by(models.ChatSession.updated_at.desc()).offset(skip).limit(limit).all()

def get_chat_session(db: Session, session_id: int, user_id: int):
    return db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == user_id
    ).first()

def update_chat_session(db: Session, session_id: int, user_id: int, title: str):
    db_session = get_chat_session(db, session_id, user_id)
    if db_session:
        db_session.title = title
        db.commit()
        db.refresh(db_session)
    return db_session

def delete_chat_session(db: Session, session_id: int, user_id: int):
    db_session = get_chat_session(db, session_id, user_id)
    if db_session:
        db.delete(db_session)
        db.commit()
    return db_session

def create_chat_message(db: Session, message: schemas.ChatMessageCreate, session_id: int):
    # Exclude 'context' if it exists in the schema, as it's not a DB column
    message_data = message.dict(exclude={'context'}) if hasattr(message, 'dict') else message.dict()
    db_message = models.ChatMessage(**message_data, session_id=session_id)
    db.add(db_message)
    
    # Update session updated_at
    db_session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if db_session:
        db_session.updated_at = func.now()
        
    db.commit()
    db.refresh(db_message)
    return db_message

def get_chat_messages(db: Session, session_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.timestamp.asc()).offset(skip).limit(limit).all()

def get_journal_entry(db: Session, entry_date: date, user_id: int):
    return db.query(models.JournalEntry).filter(
        models.JournalEntry.date == entry_date,
        models.JournalEntry.owner_id == user_id
    ).first()

def get_journal_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.JournalEntry).filter(
        models.JournalEntry.owner_id == user_id
    ).offset(skip).limit(limit).all()

def create_journal_entry(db: Session, entry: schemas.JournalEntryCreate, user_id: int):
    # Check if entry already exists for this date
    existing_entry = get_journal_entry(db, entry.date, user_id)
    if existing_entry:
        return existing_entry
        
    db_entry = models.JournalEntry(**entry.dict(), owner_id=user_id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_journal_entry(db: Session, entry_date: date, entry_update: schemas.JournalEntryUpdate, user_id: int):
    db_entry = get_journal_entry(db, entry_date, user_id)
    if db_entry:
        update_data = entry_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_entry, key, value)
        db.commit()
        db.refresh(db_entry)
    return db_entry

def delete_journal_entry(db: Session, entry_date: date, user_id: int):
    db_entry = get_journal_entry(db, entry_date, user_id)
    if db_entry:
        db.delete(db_entry)
        db.commit()
    return db_entry

