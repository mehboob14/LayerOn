"""API routers."""
from . import (
    auth,
    billing,
    chat,
    conversations,
    creator_kb,
    creators,
    documents,
    favorites,
    health,
    modules,
    notifications,
)

all_routers = [
    health.router,
    auth.router,
    creators.router,
    creator_kb.router,
    modules.router,
    documents.router,
    conversations.router,
    chat.router,
    billing.router,
    notifications.router,
    favorites.router,
]
