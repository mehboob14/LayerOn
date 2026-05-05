from typing import Optional, List, Dict, Any

from pydantic import BaseModel


class ModuleCreateRequest(BaseModel):
    title: str
    description: str = ""
    instructions: str = ""
    provider: str = "openai"
    model: str = "gpt-4o-mini"
    conversation_starters: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    is_public: bool = True
    featured: bool = False
    image_url: Optional[str] = None
    api_schema: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class ModuleUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    conversation_starters: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    is_public: Optional[bool] = None
    featured: Optional[bool] = None
