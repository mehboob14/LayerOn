from typing import List, Optional

from pydantic import BaseModel


class CreatorSourceCreate(BaseModel):
    platform: str  # medium | substack | youtube | rss
    handle: str
    enabled: bool = True


class CreatorSourceUpdate(BaseModel):
    handle: Optional[str] = None
    enabled: Optional[bool] = None


class CreatorChunkUpdate(BaseModel):
    enabled: bool


class WebIdentityRequest(BaseModel):
    name: Optional[str] = None
    hints: Optional[List[str]] = None
