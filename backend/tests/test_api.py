import pytest
import sys
import os
import httpx

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import Base, engine


@pytest.fixture(scope="module")
async def client():
    Base.metadata.create_all(bind=engine)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_and_health(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert "service" in res.json()

    res_health = await client.get("/api/v1/health")
    assert res_health.status_code == 200
    data = res_health.json()
    assert data["status"] == "healthy"
    assert data["engine"]["ready"] is True
    assert data["engine"]["total_tracks"] > 9000


@pytest.mark.asyncio
async def test_auth_workflow(client):
    unique_email = f"test_user_{os.getpid()}@example.com"
    # Signup
    signup_res = await client.post("/api/v1/auth/signup", json={
        "email": unique_email,
        "password": "SecurePassword123!",
        "full_name": "Test User",
        "username": f"tester_{os.getpid()}"
    })
    assert signup_res.status_code == 201
    signup_data = signup_res.json()
    assert "access_token" in signup_data
    token = signup_data["access_token"]

    # Login
    login_res = await client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Get Me
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email


@pytest.mark.asyncio
async def test_track_endpoints(client):
    # Search
    search_res = await client.get("/api/v1/tracks/search?q=Coldplay&limit=5")
    assert search_res.status_code == 200
    tracks = search_res.json()
    assert len(tracks) > 0

    first_track = tracks[0]
    track_id = first_track["spotify_id"]

    # Track by identifier
    detail_res = await client.get(f"/api/v1/tracks/{track_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["spotify_id"] == track_id

    # Genres
    genre_res = await client.get("/api/v1/tracks/genres/all?limit=10")
    assert genre_res.status_code == 200
    assert len(genre_res.json()) == 10

    # Popular
    pop_res = await client.get("/api/v1/tracks/popular/trending?limit=5")
    assert pop_res.status_code == 200
    assert len(pop_res.json()) == 5


@pytest.mark.asyncio
async def test_recommendation_endpoints(client):
    # Track recommendations
    rec_res = await client.get("/api/v1/recommendations/track/0vNPJrUrBnMFdCs8b2MTNG?top_n=6&algorithm=hybrid")
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert data["algorithm"] == "hybrid"
    assert len(data["recommendations"]) == 6

    # Vibe recommendations
    vibe_res = await client.post("/api/v1/recommendations/vibe", json={
        "danceability": 0.8,
        "energy": 0.7,
        "valence": 0.6,
        "acousticness": 0.1,
        "tempo": 125.0,
        "top_n": 8
    })
    assert vibe_res.status_code == 200
    assert len(vibe_res.json()) == 8


@pytest.mark.asyncio
async def test_likes_and_playlists_flow(client):
    # Register a user for like/playlist tests
    unique_email = f"playlist_fan_{os.getpid()}@example.com"
    signup_res = await client.post("/api/v1/auth/signup", json={
        "email": unique_email,
        "password": "Password123!",
        "username": f"fan_{os.getpid()}"
    })
    token = signup_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Toggle Like
    like_res = await client.post("/api/v1/likes/toggle", json={
        "track_uri": "spotify:track:0vNPJrUrBnMFdCs8b2MTNG",
        "track_name": "Fader",
        "artist_name": "The Temper Trap"
    }, headers=headers)
    assert like_res.status_code == 200
    assert like_res.json()["is_liked"] is True

    # Get Liked list
    likes_res = await client.get("/api/v1/likes/", headers=headers)
    assert likes_res.status_code == 200
    assert len(likes_res.json()) == 1

    # Create Playlist
    pl_create = await client.post("/api/v1/playlists/", json={
        "title": "My Weekend Jam",
        "description": "Chill & High Energy mix",
        "track_uris": ["spotify:track:0vNPJrUrBnMFdCs8b2MTNG"]
    }, headers=headers)
    assert pl_create.status_code == 201
    playlist_data = pl_create.json()
    playlist_id = playlist_data["id"]
    assert playlist_data["title"] == "My Weekend Jam"

    # Add Track to Playlist
    add_tr = await client.post(f"/api/v1/playlists/{playlist_id}/tracks", json={
        "track_uri": "spotify:track:1MtUq6Wp1eQ8PC6BbPCj8P",
        "track_name": "I Took A Pill In Ibiza",
        "artist_name": "Mike Posner"
    }, headers=headers)
    assert add_tr.status_code == 200

    # Get Playlist
    get_pl = await client.get(f"/api/v1/playlists/{playlist_id}", headers=headers)
    assert get_pl.status_code == 200
    assert len(get_pl.json()["tracks"]) == 2

    # Export M3U
    m3u_res = await client.get(f"/api/v1/playlists/{playlist_id}/export", headers=headers)
    assert m3u_res.status_code == 200
    assert "#EXTM3U" in m3u_res.text

    # Delete Playlist
    del_pl = await client.delete(f"/api/v1/playlists/{playlist_id}", headers=headers)
    assert del_pl.status_code == 204
