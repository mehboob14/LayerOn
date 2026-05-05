from typing import Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    module_id: str
    message: str
    conversation_id: Optional[str] = None
