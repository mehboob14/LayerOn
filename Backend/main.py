"""FastAPI application entry point."""
from __future__ import annotations

import mimetypes
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import DIST_DIR
from .database import init_db
from .routers import all_routers


def _configure_mimetypes() -> None:
    mimetypes.init()
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("application/javascript", ".mjs")
    mimetypes.add_type("text/css", ".css")


def _mount_spa(app: FastAPI) -> None:
    if not DIST_DIR.exists():
        print(f"[static] {DIST_DIR} not found — API-only mode")
        return

    print(f"[static] Serving SPA from {DIST_DIR}")
    assets = DIST_DIR / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=str(assets)), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        candidate = DIST_DIR / full_path
        if candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(DIST_DIR / "index.html"))


def create_app() -> FastAPI:
    _configure_mimetypes()

    app = FastAPI(title="LayerOn API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        init_db()

    for router in all_routers:
        app.include_router(router)

    _mount_spa(app)
    return app


app = create_app()
