from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db
from app.services.recommender import get_recommender_engine

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)) -> Any:
    """System health check and diagnostic metrics."""
    db_healthy = False
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    engine = get_recommender_engine()

    return {
        "status": "healthy" if (db_healthy and engine.is_ready) else "degraded",
        "service": "HarmoniQ Music Recommendation API",
        "version": "1.0.0",
        "database": "connected" if db_healthy else "disconnected",
        "engine": {
            "ready": engine.is_ready,
            "total_tracks": len(engine.df) if engine.is_ready else 0,
            "clusters": engine.kmeans.n_clusters if engine.is_ready else 0,
            "features_indexed": 9
        }
    }
