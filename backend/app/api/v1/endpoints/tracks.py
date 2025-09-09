from typing import List, Optional, Any
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional
from app.models.models import User, SearchHistory
from app.schemas.track import TrackOut, GenreCount
from app.services.recommender import get_recommender_engine

router = APIRouter()


@router.get("/search", response_model=List[TrackOut])
def search_tracks(
    q: str = Query(..., min_length=1, description="Search term for track, artist, or genre"),
    limit: int = Query(15, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Smart fuzzy search across track names, artists, albums, and genres."""
    engine = get_recommender_engine()
    results = engine.search_tracks(query=q, limit=limit)

    # Save to search history if user is logged in
    if current_user and q.strip():
        try:
            history = SearchHistory(user_id=current_user.id, query=q.strip())
            db.add(history)
            db.commit()
        except Exception:
            db.rollback()

    return results


@router.get("/genres/all", response_model=List[GenreCount])
def get_all_genres(limit: int = Query(40, ge=5, le=100)) -> Any:
    """Get the top genres and track distribution across the dataset."""
    engine = get_recommender_engine()
    return engine.get_genres(top_n=limit)


@router.get("/popular/trending", response_model=List[TrackOut])
def get_trending_tracks(
    genre: Optional[str] = Query(None, description="Optional genre filter"),
    limit: int = Query(16, ge=1, le=50)
) -> Any:
    """Get trending and high-popularity tracks."""
    engine = get_recommender_engine()
    return engine.get_popular_tracks(limit=limit, genre=genre)


@router.get("/{identifier}", response_model=TrackOut)
def get_track_by_id(identifier: str) -> Any:
    """Get complete metadata, audio features, and Audio DNA for a specific track."""
    engine = get_recommender_engine()
    track = engine.get_track_by_identifier(identifier)
    if track is None:
        raise HTTPException(status_code=404, detail=f"Track '{identifier}' not found in database.")
    return engine._format_track(track)
