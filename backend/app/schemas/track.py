from typing import List, Optional, Dict
from pydantic import BaseModel


class AudioFeatures(BaseModel):
    danceability: float
    energy: float
    loudness: float
    speechiness: float
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float


class AudioDNA(BaseModel):
    danceability: float
    energy: float
    valence: float
    acousticness: float
    instrumentalness: float
    liveness: float
    speechiness: float


class TrackOut(BaseModel):
    id: int
    spotify_id: str
    track_uri: str
    track_name: str
    artist_name: str
    album_name: Optional[str] = ""
    album_image_url: Optional[str] = ""
    release_date: Optional[str] = ""
    release_year: Optional[int] = 2000
    preview_url: Optional[str] = None
    popularity: int
    genres: List[str] = []
    duration_ms: int
    cluster: int
    audio_features: AudioFeatures
    audio_dna: AudioDNA
    match_score: Optional[float] = None
    similarity: Optional[float] = None


class GenreCount(BaseModel):
    genre: str
    count: int
