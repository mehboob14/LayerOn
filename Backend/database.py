"""SQLite engine, session factory, FastAPI dependency and lightweight migrator."""
from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL, SQLITE_PATH

Base = declarative_base()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)


def _sync_columns() -> None:
    """SQLite has no `ADD COLUMN IF NOT EXISTS`; bridge that gap manually.

    For each mapped table, compare its declared columns against the live schema
    and `ALTER TABLE ... ADD COLUMN` anything missing. New tables are already
    created by `Base.metadata.create_all`.
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            existing_cols = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_cols:
                    continue
                col_type = column.type.compile(dialect=engine.dialect)
                nullable = "" if column.nullable else " NOT NULL"
                default = ""
                if column.default is not None and getattr(column.default, "is_scalar", False):
                    raw = column.default.arg
                    if isinstance(raw, str):
                        default = f" DEFAULT '{raw}'"
                    elif isinstance(raw, bool):
                        default = f" DEFAULT {1 if raw else 0}"
                    elif isinstance(raw, (int, float)):
                        default = f" DEFAULT {raw}"
                ddl = f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {col_type}{nullable}{default}'
                try:
                    conn.execute(text(ddl))
                    print(f"[db] migrated: added {table.name}.{column.name}")
                except Exception as exc:
                    print(f"[db] migration skipped for {table.name}.{column.name}: {exc}")


def init_db() -> None:
    """Create missing tables and columns on the SQLite database."""
    from . import models  # noqa: F401  (registers mappers on Base)

    Base.metadata.create_all(bind=engine)
    _sync_columns()
    print(f"[db] SQLite ready at {SQLITE_PATH}")


def get_db():
    """FastAPI dependency that yields a scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
