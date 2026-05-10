from fastapi import APIRouter
from starlette.responses import HTMLResponse

from ..config import CELERY_BROKER_URL, CELERY_TASK_ALWAYS_EAGER

router = APIRouter(tags=["system"])


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/health/queue")
def queue_health():
    """Lightweight Celery / broker introspection. Safe to expose — no
    workload-specific data, just liveness."""
    if CELERY_TASK_ALWAYS_EAGER:
        return {"mode": "eager", "broker": None, "workers": []}

    payload: dict = {"mode": "celery", "broker": CELERY_BROKER_URL, "workers": []}
    try:
        from ..celery_app import celery

        ping = celery.control.ping(timeout=1.0) or []
        payload["workers"] = [list(p.keys())[0] for p in ping if p]
        payload["healthy"] = bool(payload["workers"])
    except Exception as e:
        payload["healthy"] = False
        payload["error"] = str(e)
    return payload


@router.get("/test-page")
def test_page():
    return HTMLResponse(
        """<!DOCTYPE html>
<html><head><title>Test</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
<h1 style="color:#3D3D3A;">LayerOn is working!</h1>
</body></html>"""
    )
