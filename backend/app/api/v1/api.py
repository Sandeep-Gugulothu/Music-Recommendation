from fastapi import APIRouter
from app.api.v1.endpoints import auth, tracks, recommendations, likes, playlists, health

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["Tracks & Audio DNA"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations & Vibe Lab"])
api_router.include_router(likes.router, prefix="/likes", tags=["Liked Songs"])
api_router.include_router(playlists.router, prefix="/playlists", tags=["Playlists Studio"])
api_router.include_router(health.router, tags=["Health & Status"])
