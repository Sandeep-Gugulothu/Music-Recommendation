from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.track import TrackOut, AudioDNA


class TrackRecommendationResponse(BaseModel):
    seed_track: TrackOut
    algorithm: str
    total_recommended: int
    recommendations: List[TrackOut]


class VibeRequest(BaseModel):
    danceability: float = Field(0.6, ge=0.0, le=1.0)
    energy: float = Field(0.6, ge=0.0, le=1.0)
    valence: float = Field(0.5, ge=0.0, le=1.0)
    acousticness: float = Field(0.2, ge=0.0, le=1.0)
    tempo: float = Field(120.0, ge=40.0, le=220.0)
    popularity_min: int = Field(0, ge=0, le=100)
    genre_filter: Optional[str] = None
    top_n: int = Field(12, ge=1, le=50)


class TasteProfile(BaseModel):
    total_liked_tracks: int
    audio_dna: AudioDNA
    top_genres: List[str] = []


class TasteProfileResponse(BaseModel):
    user_taste_profile: Optional[TasteProfile] = None
    recommendations: List[TrackOut]


class SeedPlaylistRequest(BaseModel):
    seed_uris: List[str]
    target_length: int = Field(20, ge=5, le=50)
    mood_boost: Optional[str] = None  # 'party', 'chill', 'happy', None
    playlist_title: Optional[str] = None
