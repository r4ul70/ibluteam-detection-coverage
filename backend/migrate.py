"""Sxem yeniləməsi: köhnə bazanı pozmadan yeni cədvəl və sütunları əlavə edir."""
from sqlalchemy import text

from .database import Base, engine


def ensure_schema():
    from . import models                                        

    Base.metadata.create_all(engine)
    with engine.begin() as conn:
        cols = {r[1] for r in conn.execute(text("PRAGMA table_info(techniques)"))}
        if "data_sources" not in cols:
            conn.execute(text("ALTER TABLE techniques ADD COLUMN data_sources TEXT DEFAULT ''"))
        if "group_count" not in cols:
            conn.execute(text("ALTER TABLE techniques ADD COLUMN group_count INTEGER DEFAULT 0"))
