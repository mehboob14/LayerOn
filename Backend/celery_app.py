"""Celery application factory.

Importing this module gives you a configured ``celery`` instance. Workers
boot via::

    celery -A Backend.celery_app:celery worker --pool=solo --loglevel=info     # Windows
    celery -A Backend.celery_app:celery worker --loglevel=info                 # Linux

Beat scheduler::

    celery -A Backend.celery_app:celery beat --loglevel=info

Eager mode (no broker, runs inline) is enabled by ``CELERY_TASK_ALWAYS_EAGER``
in :mod:`Backend.config` so the app works without Redis during local dev.
"""
from __future__ import annotations

from celery import Celery
from celery.schedules import schedule

from .config import (
    CELERY_BROKER_URL,
    CELERY_RESULT_BACKEND,
    CELERY_TASK_ALWAYS_EAGER,
    RESYNC_BEAT_INTERVAL_SECONDS,
    SYNC_TASK_SOFT_TIME_LIMIT_SECONDS,
    SYNC_TASK_TIME_LIMIT_SECONDS,
)


def create_celery() -> Celery:
    app = Celery(
        "layeron",
        broker=CELERY_BROKER_URL,
        backend=CELERY_RESULT_BACKEND,
        include=[
            "Backend.tasks.creator_sync",
            "Backend.tasks.maintenance",
        ],
    )

    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,

        # Reliability defaults — workers ack only after success so a crashed
        # worker re-queues its in-flight task.
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        worker_prefetch_multiplier=1,
        broker_connection_retry_on_startup=True,

        # Hard ceilings; individual tasks can override.
        task_time_limit=SYNC_TASK_TIME_LIMIT_SECONDS,
        task_soft_time_limit=SYNC_TASK_SOFT_TIME_LIMIT_SECONDS,

        # Drop the inline-execution switch.
        task_always_eager=CELERY_TASK_ALWAYS_EAGER,
        task_eager_propagates=CELERY_TASK_ALWAYS_EAGER,

        # Beat schedule — periodic re-sync of stale sources.
        beat_schedule={
            "resync-stale-sources": {
                "task": "Backend.tasks.maintenance.resync_stale_sources",
                "schedule": schedule(run_every=RESYNC_BEAT_INTERVAL_SECONDS),
            },
        },
    )

    return app


celery = create_celery()
