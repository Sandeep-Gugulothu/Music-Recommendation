from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.models import User, Playlist, PlaylistTrack
from app.schemas.playlist import (
    PlaylistCreate,
    PlaylistUpdate,
    PlaylistOut,
    PlaylistTrackCreate,
    PlaylistTrackOut
)
from app.services.recommender import get_recommender_engine

router = APIRouter()


@router.get("/", response_model=List[PlaylistOut])
def get_user_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve all playlists created by the current user."""
    playlists = db.query(Playlist).filter(
        Playlist.user_id == current_user.id
    ).order_by(Playlist.created_at.desc()).all()
    return playlists


@router.post("/", response_model=PlaylistOut, status_code=status.HTTP_201_CREATED)
def create_playlist(
    playlist_in: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new playlist and optionally add initial tracks."""
    playlist = Playlist(
        user_id=current_user.id,
        title=playlist_in.title,
        description=playlist_in.description,
        cover_image_url=playlist_in.cover_image_url,
        is_public=playlist_in.is_public if playlist_in.is_public is not None else True
    )
    db.add(playlist)
    db.commit()
    db.refresh(playlist)

    # Add initial track URIs if supplied
    if playlist_in.track_uris:
        engine = get_recommender_engine()
        for idx, uri in enumerate(playlist_in.track_uris):
            track_series = engine.get_track_by_identifier(uri)
            if track_series is not None:
                p_track = PlaylistTrack(
                    playlist_id=playlist.id,
                    track_uri=str(track_series.get("Track URI", uri)),
                    track_name=str(track_series.get("Track Name", "Unknown")),
                    artist_name=str(track_series.get("Artist Name(s)", "Unknown")),
                    album_image_url=str(track_series.get("Album Image URL", "")),
                    preview_url=str(track_series.get("Track Preview URL", "")),
                    duration_ms=int(track_series.get("Track Duration (ms)", 0)),
                    position=idx
                )
                db.add(p_track)
        db.commit()
        db.refresh(playlist)

    return playlist


@router.get("/{playlist_id}", response_model=PlaylistOut)
def get_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get single playlist by ID."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")
    return playlist


@router.put("/{playlist_id}", response_model=PlaylistOut)
def update_playlist(
    playlist_id: int,
    playlist_update: PlaylistUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update playlist title or description."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")

    if playlist_update.title is not None:
        playlist.title = playlist_update.title
    if playlist_update.description is not None:
        playlist.description = playlist_update.description
    if playlist_update.cover_image_url is not None:
        playlist.cover_image_url = playlist_update.cover_image_url
    if playlist_update.is_public is not None:
        playlist.is_public = playlist_update.is_public

    db.commit()
    db.refresh(playlist)
    return playlist


@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """Delete a playlist."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")

    db.delete(playlist)
    db.commit()
    return None


@router.post("/{playlist_id}/tracks", response_model=PlaylistTrackOut)
def add_track_to_playlist(
    playlist_id: int,
    track_in: PlaylistTrackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Add a track to a playlist."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")

    current_count = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id).count()

    p_track = PlaylistTrack(
        playlist_id=playlist_id,
        track_uri=track_in.track_uri,
        track_name=track_in.track_name,
        artist_name=track_in.artist_name,
        album_image_url=track_in.album_image_url,
        preview_url=track_in.preview_url,
        duration_ms=track_in.duration_ms or 0,
        position=current_count
    )
    db.add(p_track)
    db.commit()
    db.refresh(p_track)
    return p_track


@router.delete("/{playlist_id}/tracks/{track_uri}")
def remove_track_from_playlist(
    playlist_id: int,
    track_uri: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Remove a track from a playlist."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")

    track = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_uri == track_uri
    ).first()

    if not track:
        raise HTTPException(status_code=404, detail="Track not in playlist.")

    db.delete(track)
    db.commit()
    return {"message": "Track removed from playlist", "track_uri": track_uri}


@router.get("/{playlist_id}/export")
def export_playlist_m3u(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Response:
    """Export playlist as standard M3U format."""
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found.")

    lines = ["#EXTM3U", f"#PLAYLIST:{playlist.title}"]
    for t in playlist.tracks:
        lines.append(f"#EXTINF:{t.duration_ms // 1000},{t.artist_name} - {t.track_name}")
        lines.append(t.preview_url or f"https://open.spotify.com/track/{t.track_uri.split(':')[-1]}")

    content = "\n".join(lines)
    return Response(
        content=content,
        media_type="audio/x-mpegurl",
        headers={"Content-Disposition": f"attachment; filename={playlist.title.replace(' ', '_')}.m3u"}
    )
