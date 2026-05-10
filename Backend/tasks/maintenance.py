"""Periodic maintenance tasks (run by celery beat)."""
from __future__ import annotations

from datetime import datetime, timedelta

from celery.utils.log import get_task_logger

from ..celery_app import celery
from ..config import RESYNC_STALE_AFTER_SECONDS
from ..database import SessionLocal
from ..models import CreatorSource


logger = get_task_logger(__name__)


@celery.task(name="Backend.tasks.maintenance.resync_stale_sources")
def resync_stale_sources() -> dict:
    """Find sources whose ``last_synced_at`` is older than the configured
    threshold and queue a re-sync for each. Skips sources currently in flight.
    """
    from .creator_sync import sync_source  # local import → avoid task-import cycle

    cutoff = datetime.utcnow() - timedelta(seconds=RESYNC_STALE_AFTER_SECONDS)
    queued = 0
    db = SessionLocal()
    try:
        candidates = (
            db.query(CreatorSource)
            .filter(CreatorSource.status.in_(("synced", "error")))
            .all()
        )
        for source in candidates:
            # Source has an explicit `enabled` boolean stored as JSON; honour
            # it so muted sources don't get auto-resynced.
            if source.enabled is False:
                continue
            last = source.last_synced_at
            if last is not None and last >= cutoff:
                continue
            sync_source.delay(source.id)
            queued += 1
    finally:
        db.close()

    logger.info("resync_stale_sources queued=%s", queued)
    return {"queued": queued}
