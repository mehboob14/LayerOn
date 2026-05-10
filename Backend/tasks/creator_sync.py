"""Async sync of creator KB sources."""
from __future__ import annotations

from celery.utils.log import get_task_logger

from ..celery_app import celery
from ..utils.creator_kb import sync_source as _sync_source

logger = get_task_logger(__name__)


@celery.task(
    name="Backend.tasks.creator_sync.sync_source",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,        # 1s, 2s, 4s, ...
    retry_backoff_max=300,     # cap at 5 min
    retry_jitter=True,
    max_retries=3,
    acks_late=True,
)
def sync_source(self, source_id: str) -> dict:
    """Run a full re-sync of a single ``CreatorSource``.

    The underlying :func:`Backend.utils.creator_kb.sync_source` already updates
    the source's status row in the DB, so the task return value is just for
    observability (Flower / Celery result backend).
    """
    logger.info("sync_source start id=%s attempt=%s", source_id, self.request.retries + 1)
    _sync_source(source_id)
    logger.info("sync_source done id=%s", source_id)
    return {"sourceId": source_id, "ok": True}
