from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.models import User, LikedTrack
from app.schemas.like import LikeToggleRequest, LikedTrackOut, LikeToggleResponse

router = APIRouter()


@router.post("/toggle", response_model=LikeToggleResponse)
def toggle_like_track(
    like_in: LikeToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Toggle liking or unliking a track for the authenticated user."""
    existing_like = db.query(LikedTrack).filter(
        LikedTrack.user_id == current_user.id,
        LikedTrack.track_uri == like_in.track_uri
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        return {
            "is_liked": False,
            "message": "Track removed from Liked Songs.",
            "track_uri": like_in.track_uri
        }
    else:
        new_like = LikedTrack(
            user_id=current_user.id,
            track_uri=like_in.track_uri,
            track_name=like_in.track_name,
            artist_name=like_in.artist_name,
            album_image_url=like_in.album_image_url,
            preview_url=like_in.preview_url
        )
        db.add(new_like)
        db.commit()
        return {
            "is_liked": True,
            "message": "Track added to Liked Songs.",
            "track_uri": like_in.track_uri
        }


@router.get("/", response_model=List[LikedTrackOut])
def get_liked_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get list of all songs liked by the authenticated user."""
    likes = db.query(LikedTrack).filter(
        LikedTrack.user_id == current_user.id
    ).order_by(LikedTrack.created_at.desc()).all()
    return likes


@router.get("/check/{track_uri}")
def check_track_liked(
    track_uri: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Check if a specific track is liked by the current user."""
    exists = db.query(LikedTrack).filter(
        LikedTrack.user_id == current_user.id,
        LikedTrack.track_uri == track_uri
    ).first() is not None
    return {"track_uri": track_uri, "is_liked": exists}
