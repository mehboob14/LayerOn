"""Centralised runtime configuration."""
from __future__ import annotations

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Best-effort .env loader (no hard dependency on python-dotenv).
try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)

BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SQLITE_PATH = DATA_DIR / "layeron.db"
DATABASE_URL = f"sqlite:///{SQLITE_PATH.as_posix()}"

# Frontend build (served by FastAPI in production). Project-root relative.
DIST_DIR = PROJECT_ROOT / "dist" / "public"

# Auth
CLERK_PUBLISHABLE_KEY = os.getenv("VITE_CLERK_PUBLISHABLE_KEY", "")

# LLM providers
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Defaults
DEFAULT_USER_CREDITS = 100
CHAT_CREDIT_COST = 5
CHUNK_SIZE = 2000
CHUNK_OVERLAP = 200
RAG_CONTEXT_CHAR_LIMIT = 8000

# Creator knowledge base
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIM = 1536
CREATOR_KB_TOP_K = int(os.getenv("CREATOR_KB_TOP_K", "5"))
CREATOR_KB_MAX_CHARS = 6000
CREATOR_CHUNK_SIZE = 1500
CREATOR_CHUNK_OVERLAP = 150
SCRAPE_USER_AGENT = "LayerOn/1.0 (+https://layeron.ai)"
SCRAPE_TIMEOUT_SECONDS = 25

# ---- Async task queue (Celery + Redis) -----------------------------------
# Set REDIS_URL to the broker; CELERY_RESULT_BACKEND defaults to the same DB.
# For local development without Redis, set CELERY_TASK_ALWAYS_EAGER=true and
# tasks run synchronously inside the calling process (no worker required).
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
CELERY_TASK_ALWAYS_EAGER = os.getenv("CELERY_TASK_ALWAYS_EAGER", "false").lower() in ("1", "true", "yes")

# How often the beat scheduler should look for stale sources (seconds).
RESYNC_BEAT_INTERVAL_SECONDS = int(os.getenv("RESYNC_BEAT_INTERVAL_SECONDS", "3600"))
# Sources older than this are eligible for auto re-sync.
RESYNC_STALE_AFTER_SECONDS = int(os.getenv("RESYNC_STALE_AFTER_SECONDS", str(24 * 60 * 60)))
# Hard ceiling for a single sync task.
SYNC_TASK_TIME_LIMIT_SECONDS = int(os.getenv("SYNC_TASK_TIME_LIMIT_SECONDS", "1800"))
SYNC_TASK_SOFT_TIME_LIMIT_SECONDS = int(os.getenv("SYNC_TASK_SOFT_TIME_LIMIT_SECONDS", "1500"))
