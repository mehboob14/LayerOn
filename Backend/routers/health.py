from fastapi import APIRouter
from starlette.responses import HTMLResponse

router = APIRouter(tags=["system"])


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/test-page")
def test_page():
    return HTMLResponse(
        """<!DOCTYPE html>
<html><head><title>Test</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
<h1 style="color:#3D3D3A;">LayerOn is working!</h1>
</body></html>"""
    )
