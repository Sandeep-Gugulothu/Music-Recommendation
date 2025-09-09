from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional, get_current_user
from app.models.models import User, LikedTrack
from app.schemas.track import TrackOut
from app.schemas.recommendation import (
    TrackRecommendationResponse,
    VibeRequest,
    TasteProfileResponse,
    SeedPlaylistRequest
)
from app.services.recommender import get_recommender_engine

router = APIRouter()


@router.get("/track/{identifier}", response_model=TrackRecommendationResponse)
def get_recommendations_for_track(
    identifier: str,
    top_n: int = Query(10, ge=1, le=50),
    algorithm: str = Query("hybrid", pattern="^(hybrid|audio_dna|cluster_cosine|artist_genre)$"),
    genre_weight: float = Query(0.35, ge=0.0, le=1.0),
    audio_weight: float = Query(0.65, ge=0.0, le=1.0)
) -> Any:
    """
    Get track recommendations using specified algorithm:
      - **hybrid**: Audio cosine (65%) + Genre/Artist TF-IDF (35%) + Popularity factor
      - **audio_dna**: Pure 9-feature high-dimensional acoustic cosine similarity
      - **cluster_cosine**: Fast intra-cluster acoustic similarity
      - **artist_genre**: Genre & artist semantic matching blended with tempo/energy
    """
    engine = get_recommender_engine()
    result = engine.recommend_by_track(
        identifier=identifier,
        top_n=top_n,
        algorithm=algorithm,
        genre_weight=genre_weight,
        audio_weight=audio_weight
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.post("/vibe", response_model=List[TrackOut])
def get_recommendations_by_vibe(vibe: VibeRequest) -> Any:
    """
    Parametric Vibe Lab: match songs based on interactive mood & acoustic sliders.
    """
    engine = get_recommender_engine()
    results = engine.recommend_by_vibe(
        danceability=vibe.danceability,
        energy=vibe.energy,
        valence=vibe.valence,
        acousticness=vibe.acousticness,
        tempo=vibe.tempo,
        popularity_min=vibe.popularity_min,
        genre_filter=vibe.genre_filter,
        top_n=vibe.top_n
    )
    return results


@router.get("/for-you", response_model=TasteProfileResponse)
def get_personalized_recommendations(
    top_n: int = Query(15, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get personalized recommendations based on the user's liked track taste centroid.
    If anonymous or no likes yet, returns popular trending tracks.
    """
    engine = get_recommender_engine()
    liked_uris = []
    if current_user:
        liked_tracks = db.query(LikedTrack).filter(LikedTrack.user_id == current_user.id).all()
        liked_uris = [t.track_uri for t in liked_tracks]

    result = engine.recommend_for_user(liked_track_uris=liked_uris, top_n=top_n)
    return result


@router.post("/playlist-generator", response_model=List[TrackOut])
def generate_playlist_from_seeds(seed_req: SeedPlaylistRequest) -> Any:
    """
    Create a curated playlist flow from multiple seed songs with optional mood boosts.
    """
    if not seed_req.seed_uris:
        raise HTTPException(status_code=400, detail="At least one seed track URI is required.")

    engine = get_recommender_engine()
    results = engine.generate_seed_playlist(
        seed_uris=seed_req.seed_uris,
        target_length=seed_req.target_length,
        mood_boost=seed_req.mood_boost
    )
    return results
