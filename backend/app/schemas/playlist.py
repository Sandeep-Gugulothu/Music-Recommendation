from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PlaylistTrackBase(BaseModel):
    track_uri: str
    track_name: str
    artist_name: str
    album_image_url: Optional[str] = None
    preview_url: Optional[str] = None
    duration_ms: Optional[int] = 0


class PlaylistTrackCreate(PlaylistTrackBase):
    pass


class PlaylistTrackOut(PlaylistTrackBase):
    id: int
    playlist_id: int
    position: int
    added_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PlaylistBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: Optional[bool] = True


class PlaylistCreate(PlaylistBase):
    track_uris: Optional[List[str]] = []


class PlaylistUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: Optional[bool] = None


class PlaylistOut(PlaylistBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tracks: List[PlaylistTrackOut] = []

    model_config = ConfigDict(from_attributes=True)
