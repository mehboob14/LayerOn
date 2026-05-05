from typing import Optional, List

from pydantic import BaseModel


class UserSyncRequest(BaseModel):
    role: Optional[str] = "user"


class ProfileUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    profession: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    expertise: Optional[List[str]] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    role: Optional[str] = None
    markOnboarded: Optional[bool] = None
