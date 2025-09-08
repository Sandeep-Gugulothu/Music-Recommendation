import pytest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.recommender import MusicRecommenderEngine, RADAR_FEATURES


@pytest.fixture(scope="module")
def engine():
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "top_10000_1950-now.csv"))
    engine = MusicRecommenderEngine(data_path=data_path)
    assert engine.is_ready, "Engine failed to initialize"
    return engine


def test_dataset_loaded(engine):
    assert len(engine.df) > 9000, f"Expected >9000 tracks, found {len(engine.df)}"
    assert engine.audio_scaled.shape[0] == len(engine.df)
    assert engine.audio_scaled.shape[1] == 9
    assert engine.audio_minmax.shape[1] == len(RADAR_FEATURES)


def test_search_tracks(engine):
    # Test track search by partial name
    results = engine.search_tracks("Coldplay", limit=10)
    assert len(results) > 0
    assert any("coldplay" in r["artist_name"].lower() or "coldplay" in r["track_name"].lower() for r in results)

    # Test search by song name
    results = engine.search_tracks("Fix You", limit=5)
    assert len(results) > 0
    assert any("fix you" in r["track_name"].lower() for r in results)


def test_recommend_by_track_hybrid(engine):
    # Recommend for 'Fix You'
    res = engine.recommend_by_track("Fix You", top_n=5, algorithm="hybrid")
    assert "error" not in res
    assert res["seed_track"]["track_name"].lower().startswith("fix you")
    assert len(res["recommendations"]) == 5
    for rec in res["recommendations"]:
        assert rec["track_name"] != res["seed_track"]["track_name"]
        assert "match_score" in rec
        assert "audio_dna" in rec
        assert 0.0 <= rec["match_score"] <= 100.0


def test_recommend_all_algorithms(engine):
    algorithms = ["hybrid", "audio_dna", "cluster_cosine", "artist_genre"]
    for algo in algorithms:
        res = engine.recommend_by_track("0vNPJrUrBnMFdCs8b2MTNG", top_n=5, algorithm=algo)
        assert "error" not in res, f"Algorithm {algo} returned error"
        assert len(res["recommendations"]) == 5
        assert res["algorithm"] == algo


def test_recommend_by_vibe(engine):
    # Test party vibe: high danceability, high energy
    party_recs = engine.recommend_by_vibe(danceability=0.9, energy=0.9, valence=0.8, top_n=6)
    assert len(party_recs) == 6
    for r in party_recs:
        assert "audio_dna" in r
        assert "danceability" in r["audio_dna"]

    # Test chill acoustic vibe
    chill_recs = engine.recommend_by_vibe(danceability=0.3, energy=0.2, acousticness=0.9, top_n=6)
    assert len(chill_recs) == 6


def test_recommend_for_user(engine):
    # Pick 3 tracks as liked
    sample_tracks = engine.df.head(3)["Track URI"].tolist()
    user_feed = engine.recommend_for_user(liked_track_uris=sample_tracks, top_n=10)
    assert "user_taste_profile" in user_feed
    assert user_feed["user_taste_profile"]["total_liked_tracks"] == 3
    assert len(user_feed["recommendations"]) == 10
    # Liked songs must not appear in recommendations
    rec_uris = [r["track_uri"] for r in user_feed["recommendations"]]
    for uri in sample_tracks:
        assert uri not in rec_uris


def test_generate_seed_playlist(engine):
    sample_tracks = engine.df.head(2)["Track URI"].tolist()
    playlist = engine.generate_seed_playlist(seed_uris=sample_tracks, target_length=15, mood_boost="happy")
    assert len(playlist) == 15
    for track in playlist:
        assert track["track_uri"] not in sample_tracks


def test_radar_audio_dna_ranges(engine):
    track = engine.search_tracks("a", limit=1)[0]
    dna = track["audio_dna"]
    for feat in ["danceability", "energy", "valence", "acousticness", "instrumentalness", "liveness", "speechiness"]:
        assert feat in dna
        assert 0.0 <= dna[feat] <= 1.0


def test_get_genres_and_popular(engine):
    genres = engine.get_genres(top_n=20)
    assert len(genres) == 20
    assert "genre" in genres[0]
    assert "count" in genres[0]

    popular = engine.get_popular_tracks(limit=10)
    assert len(popular) == 10
    assert popular[0]["popularity"] >= popular[-1]["popularity"]
