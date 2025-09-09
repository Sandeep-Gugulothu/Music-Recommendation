from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class LikeToggleRequest(BaseModel):
    track_uri: str
    track_name: str
    artist_name: str
    album_image_url: Optional[str] = None
    preview_url: Optional[str] = None


class LikedTrackOut(BaseModel):
    id: int
    user_id: int
    track_uri: str
    track_name: str
    artist_name: str
    album_image_url: Optional[str] = None
    preview_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LikeToggleResponse(BaseModel):
    is_liked: bool
    message: str
    track_uri: str
