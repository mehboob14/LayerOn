"""User ORM model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    credits = Column(Integer, default=100, nullable=False)
    role = Column(String, default="user", nullable=False)
    profession = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    headline = Column(String, nullable=True)
    expertise = Column(JSON, nullable=True)
    onboarded_at = Column(DateTime, nullable=True)
    website = Column(String, nullable=True)
    twitter = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
