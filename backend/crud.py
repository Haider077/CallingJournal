from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date
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

