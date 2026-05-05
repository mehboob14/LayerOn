from typing import Optional

from pydantic import BaseModel


class ConversationCreateRequest(BaseModel):
    module_id: str
    title: Optional[str] = "New Conversation"
