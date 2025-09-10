import os
import re
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors


AUDIO_FEATURES = [
    "Danceability", "Energy", "Loudness", "Speechiness", "Acousticness",
    "Instrumentalness", "Liveness", "Valence", "Tempo"
]

RADAR_FEATURES = [
    "Danceability", "Energy", "Valence", "Acousticness",
    "Instrumentalness", "Liveness", "Speechiness"
]

METADATA_COLUMNS = [
    "Track URI", "Track Name", "Artist URI(s)", "Artist Name(s)",
    "Album URI", "Album Name", "Album Release Date", "Album Image URL",
    "Track Preview URL", "Popularity", "Artist Genres", "Track Duration (ms)"
]


class MusicRecommenderEngine:
    """
    Advanced Multi-Algorithm Music Recommendation Engine.
    Supports:
      - Audio DNA High-Dimensional Cosine Similarity
      - Hybrid (Audio + Genre/Artist TF-IDF) Recommender
      - Cluster-guided Fast Neighbor Search
      - Parametric Vibe / Mood Matching
      - User Taste Centroid ('For You' Discovery)
      - Multi-seed Playlist Generation
      - Multi-field Smart Fuzzy Search & Autocomplete
    """

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or os.path.join(
            os.path.dirname(__file__), "..", "..", "data", "top_10000_1950-now.csv"
        )
        self.df: pd.DataFrame = pd.DataFrame()
        self.scaler = StandardScaler()
        self.minmax_scaler = MinMaxScaler()
        self.audio_scaled: Optional[np.ndarray] = None
        self.audio_minmax: Optional[np.ndarray] = None
        self.tfidf_matrix = None
        self.tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.kmeans = KMeans(n_clusters=12, random_state=42, n_init="auto")
        self.nn_model: Optional[NearestNeighbors] = None
        self.is_ready = False

        self.load_and_train()

    def load_and_train(self):
        """Loads CSV dataset, preprocesses columns, scales features, and builds indexes."""
        if not os.path.exists(self.data_path):
            print(f"[Music Recommendation Engine] WARNING: Dataset not found at {self.data_path}")
            return

        print(f"[Music Recommendation Engine] Loading dataset from {self.data_path}...")
        df_raw = pd.read_csv(self.data_path)

        # Standardize missing values
        df_raw["Artist Genres"] = df_raw["Artist Genres"].fillna("").astype(str)
        df_raw["Album Image URL"] = df_raw["Album Image URL"].fillna("").astype(str)
        df_raw["Track Preview URL"] = df_raw["Track Preview URL"].fillna("").astype(str)
        df_raw["Track Name"] = df_raw["Track Name"].fillna("Unknown Track").astype(str)
        df_raw["Artist Name(s)"] = df_raw["Artist Name(s)"].fillna("Unknown Artist").astype(str)
        df_raw["Album Name"] = df_raw["Album Name"].fillna("").astype(str)
        df_raw["Popularity"] = pd.to_numeric(df_raw["Popularity"], errors="coerce").fillna(0).astype(int)

        # Ensure numeric audio features
        for feat in AUDIO_FEATURES:
            df_raw[feat] = pd.to_numeric(df_raw[feat], errors="coerce").fillna(0.0)

        # Filter clean rows
        self.df = df_raw.dropna(subset=AUDIO_FEATURES + ["Track Name", "Artist Name(s)", "Track URI"]).copy()
        self.df.reset_index(drop=True, inplace=True)
        self.df["id"] = self.df.index

        # Extract Spotify ID from Track URI (e.g. spotify:track:0vNPJrUrBnMFdCs8b2MTNG -> 0vNPJrUrBnMFdCs8b2MTNG)
        self.df["spotify_id"] = self.df["Track URI"].apply(lambda x: str(x).split(":")[-1] if isinstance(x, str) else "")

        # Extract Release Year
        def parse_year(val):
            match = re.search(r"\b(19\d{2}|20\d{2})\b", str(val))
            return int(match.group(0)) if match else 2000
        self.df["Release Year"] = self.df["Album Release Date"].apply(parse_year)

        # Scale audio features with StandardScaler
        self.audio_scaled = self.scaler.fit_transform(self.df[AUDIO_FEATURES])

        # MinMax scaler (0.0 to 1.0) for Radar visualizer
        self.audio_minmax = self.minmax_scaler.fit_transform(self.df[RADAR_FEATURES])

        # Train K-Means clustering
        self.df["Cluster"] = self.kmeans.fit_predict(self.audio_scaled)

        # Fit Nearest Neighbors on audio space
        self.nn_model = NearestNeighbors(n_neighbors=50, metric="cosine", algorithm="brute")
        self.nn_model.fit(self.audio_scaled)

        # Fit TF-IDF on Genre + Artist combined text
        self.df["text_features"] = self.df["Artist Genres"] + " " + self.df["Artist Name(s)"] + " " + self.df["Album Name"]
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.df["text_features"])

        self.is_ready = True
        print(f"[Music Recommendation Engine] Ready! Loaded {len(self.df)} tracks across {len(AUDIO_FEATURES)} audio dimensions and {self.kmeans.n_clusters} clusters.")

    def _format_track(self, row: pd.Series, similarity: Optional[float] = None) -> Dict[str, Any]:
        """Formats a DataFrame row into a clean dictionary response with Audio DNA metrics."""
        idx = int(row["id"]) if "id" in row else int(row.name)
        radar_dict = {
            feat.lower(): round(float(np.clip(self.audio_minmax[idx, i], 0.0, 1.0)), 3)
            for i, feat in enumerate(RADAR_FEATURES)
        }

        track_dict = {
            "id": idx,
            "spotify_id": str(row.get("spotify_id", "")),
            "track_uri": str(row.get("Track URI", "")),
            "track_name": str(row.get("Track Name", "")),
            "artist_name": str(row.get("Artist Name(s)", "")),
            "album_name": str(row.get("Album Name", "")),
            "album_image_url": str(row.get("Album Image URL", "")),
            "release_date": str(row.get("Album Release Date", "")),
            "release_year": int(row.get("Release Year", 2000)),
            "preview_url": str(row.get("Track Preview URL", "")) or None,
            "popularity": int(row.get("Popularity", 0)),
            "genres": [g.strip() for g in str(row.get("Artist Genres", "")).split(",") if g.strip()],
            "duration_ms": int(row.get("Track Duration (ms)", 0)),
            "cluster": int(row.get("Cluster", 0)),
            "audio_features": {
                "danceability": float(row.get("Danceability", 0)),
                "energy": float(row.get("Energy", 0)),
                "loudness": float(row.get("Loudness", 0)),
                "speechiness": float(row.get("Speechiness", 0)),
                "acousticness": float(row.get("Acousticness", 0)),
                "instrumentalness": float(row.get("Instrumentalness", 0)),
                "liveness": float(row.get("Liveness", 0)),
                "valence": float(row.get("Valence", 0)),
                "tempo": float(row.get("Tempo", 0)),
            },
            "audio_dna": radar_dict
        }

        if similarity is not None:
            track_dict["match_score"] = round(float(similarity) * 100, 1)
            track_dict["similarity"] = round(float(similarity), 4)

        return track_dict

    def get_track_by_identifier(self, identifier: str) -> Optional[pd.Series]:
        """Finds a track by numeric ID, Spotify ID, Track URI, or exact track name."""
        if not self.is_ready or self.df.empty:
            return None

        # Check numeric ID
        if str(identifier).isdigit():
            idx = int(identifier)
            if 0 <= idx < len(self.df):
                return self.df.iloc[idx]

        # Check Spotify ID or Track URI
        if str(identifier).startswith("spotify:track:"):
            matches = self.df[self.df["Track URI"] == identifier]
            if not matches.empty:
                return matches.iloc[0]
        
        matches = self.df[self.df["spotify_id"] == identifier]
        if not matches.empty:
            return matches.iloc[0]

        # Check exact track name (case-insensitive)
        matches = self.df[self.df["Track Name"].str.lower() == str(identifier).lower()]
        if not matches.empty:
            return matches.iloc[0]

        # Check partial track name match
        matches = self.df[self.df["Track Name"].str.lower().str.contains(str(identifier).lower(), regex=False)]
        if not matches.empty:
            return matches.iloc[0]

        return None

    def search_tracks(self, query: str, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Smart search across Track Name, Artist Name, Album, and Genres with scoring.
        """
        if not self.is_ready or self.df.empty or not query.strip():
            return []

        q = query.strip().lower()

        # Exact track name start
        name_starts = self.df[self.df["Track Name"].str.lower().str.startswith(q)].copy()
        name_starts["score"] = 100 + name_starts["Popularity"] * 0.2

        # Track name contains
        name_contains = self.df[
            (~self.df.index.isin(name_starts.index)) &
            (self.df["Track Name"].str.lower().str.contains(q, regex=False))
        ].copy()
        name_contains["score"] = 75 + name_contains["Popularity"] * 0.2

        # Artist name contains
        artist_contains = self.df[
            (~self.df.index.isin(name_starts.index)) &
            (~self.df.index.isin(name_contains.index)) &
            (self.df["Artist Name(s)"].str.lower().str.contains(q, regex=False))
        ].copy()
        artist_contains["score"] = 50 + artist_contains["Popularity"] * 0.2

        # Genre contains
        genre_contains = self.df[
            (~self.df.index.isin(name_starts.index)) &
            (~self.df.index.isin(name_contains.index)) &
            (~self.df.index.isin(artist_contains.index)) &
            (self.df["Artist Genres"].str.lower().str.contains(q, regex=False))
        ].copy()
        genre_contains["score"] = 30 + genre_contains["Popularity"] * 0.2

        results_df = pd.concat([name_starts, name_contains, artist_contains, genre_contains])
        results_df = results_df.sort_values(by="score", ascending=False).head(limit)

        return [self._format_track(row) for _, row in results_df.iterrows()]

    def recommend_by_track(
        self,
        identifier: str,
        top_n: int = 10,
        algorithm: str = "hybrid",
        genre_weight: float = 0.35,
        audio_weight: float = 0.65
    ) -> Dict[str, Any]:
        """
        Generates track recommendations using specified algorithm:
          - 'hybrid': Audio cosine + TF-IDF textual similarity
          - 'audio_dna': High-dimensional audio feature cosine similarity
          - 'cluster_cosine': Cosine similarity inside same audio cluster
          - 'artist_genre': Textual TF-IDF genre & artist weighted match
        """
        if not self.is_ready:
            return {"error": "Recommendation engine not initialized"}

        seed_song = self.get_track_by_identifier(identifier)
        if seed_song is None:
            return {"error": f"Track '{identifier}' not found in database"}

        seed_idx = int(seed_song["id"])
        seed_scaled_vector = self.audio_scaled[seed_idx].reshape(1, -1)
        seed_track_uri = seed_song["Track URI"]
        seed_name_lower = str(seed_song["Track Name"]).lower()
        seed_artist_lower = str(seed_song["Artist Name(s)"]).lower()

        if algorithm == "cluster_cosine":
            target_cluster = seed_song["Cluster"]
            cluster_mask = self.df["Cluster"] == target_cluster
            cluster_indices = self.df[cluster_mask].index.values
            cluster_vectors = self.audio_scaled[cluster_indices]
            sims = cosine_similarity(seed_scaled_vector, cluster_vectors).flatten()

            candidate_df = self.df.iloc[cluster_indices].copy()
            candidate_df["sim"] = sims

        elif algorithm == "audio_dna":
            sims = cosine_similarity(seed_scaled_vector, self.audio_scaled).flatten()
            candidate_df = self.df.copy()
            candidate_df["sim"] = sims

        elif algorithm == "artist_genre":
            seed_tfidf = self.tfidf_matrix[seed_idx]
            text_sims = cosine_similarity(seed_tfidf, self.tfidf_matrix).flatten()
            audio_sims = cosine_similarity(seed_scaled_vector, self.audio_scaled).flatten()
            combined_sims = 0.7 * text_sims + 0.3 * audio_sims

            candidate_df = self.df.copy()
            candidate_df["sim"] = combined_sims

        else:  # 'hybrid' (Default)
            audio_sims = cosine_similarity(seed_scaled_vector, self.audio_scaled).flatten()
            seed_tfidf = self.tfidf_matrix[seed_idx]
            text_sims = cosine_similarity(seed_tfidf, self.tfidf_matrix).flatten()

            # Hybrid linear combination with popularity boost factor
            pop_factor = (self.df["Popularity"] / 100.0) * 0.05
            hybrid_sims = (audio_weight * audio_sims) + (genre_weight * text_sims) + pop_factor.values

            candidate_df = self.df.copy()
            candidate_df["sim"] = hybrid_sims

        # Filter out seed song itself and duplicate artist+title
        candidate_df = candidate_df[candidate_df["Track URI"] != seed_track_uri]
        candidate_df = candidate_df[
            ~(
                (candidate_df["Track Name"].str.lower() == seed_name_lower) &
                (candidate_df["Artist Name(s)"].str.lower() == seed_artist_lower)
            )
        ]

        # Sort and take top N
        top_candidates = candidate_df.sort_values(by="sim", ascending=False).head(top_n)

        return {
            "seed_track": self._format_track(seed_song),
            "algorithm": algorithm,
            "total_recommended": len(top_candidates),
            "recommendations": [
                self._format_track(row, similarity=row["sim"])
                for _, row in top_candidates.iterrows()
            ]
        }

    def recommend_by_vibe(
        self,
        danceability: float = 0.6,
        energy: float = 0.6,
        valence: float = 0.5,
        acousticness: float = 0.2,
        tempo: float = 120.0,
        popularity_min: int = 0,
        genre_filter: Optional[str] = None,
        top_n: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Parametric Vibe / Mood recommendation based on user slider controls.
        """
        if not self.is_ready:
            return []

        # Construct synthetic target feature vector
        # Loudness, Speechiness, Instrumentalness, Liveness set to balanced defaults
        target_features = pd.DataFrame([[
            danceability,
            energy,
            -7.0,          # Average balanced loudness in dB
            0.05,          # Speechiness
            acousticness,
            0.05,          # Instrumentalness
            0.15,          # Liveness
            valence,
            tempo
        ]], columns=AUDIO_FEATURES)

        target_scaled = self.scaler.transform(target_features)

        # Cosine similarity to synthetic target vector
        sims = cosine_similarity(target_scaled, self.audio_scaled).flatten()

        candidate_df = self.df.copy()
        candidate_df["sim"] = sims

        # Apply filters
        if popularity_min > 0:
            candidate_df = candidate_df[candidate_df["Popularity"] >= popularity_min]

        if genre_filter and genre_filter.strip():
            g = genre_filter.strip().lower()
            candidate_df = candidate_df[candidate_df["Artist Genres"].str.lower().str.contains(g, regex=False)]

        top_candidates = candidate_df.sort_values(by="sim", ascending=False).head(top_n)

        return [
            self._format_track(row, similarity=row["sim"])
            for _, row in top_candidates.iterrows()
        ]

    def recommend_for_user(
        self,
        liked_track_uris: List[str],
        top_n: int = 15
    ) -> Dict[str, Any]:
        """
        Personalized 'For You' discovery feed based on the centroid of user's liked tracks.
        """
        if not self.is_ready or not liked_track_uris:
            # Fallback to popular trending tracks
            popular_df = self.df.sort_values(by="Popularity", ascending=False).head(top_n)
            return {
                "user_taste_profile": None,
                "recommendations": [self._format_track(row, similarity=0.9) for _, row in popular_df.iterrows()]
            }

        liked_df = self.df[self.df["Track URI"].isin(liked_track_uris)]
        if liked_df.empty:
            popular_df = self.df.sort_values(by="Popularity", ascending=False).head(top_n)
            return {
                "user_taste_profile": None,
                "recommendations": [self._format_track(row, similarity=0.9) for _, row in popular_df.iterrows()]
            }

        liked_indices = liked_df.index.values
        liked_vectors = self.audio_scaled[liked_indices]

        # Calculate User Taste Centroid in Audio Space
        taste_centroid = np.mean(liked_vectors, axis=0).reshape(1, -1)

        # Also aggregate average radar metrics for profile visualization
        avg_radar = np.mean(self.audio_minmax[liked_indices], axis=0)
        taste_radar = {
            feat.lower(): round(float(np.clip(avg_radar[i], 0.0, 1.0)), 2)
            for i, feat in enumerate(RADAR_FEATURES)
        }

        # Compute similarity from centroid to all unliked songs
        sims = cosine_similarity(taste_centroid, self.audio_scaled).flatten()

        candidate_df = self.df.copy()
        candidate_df["sim"] = sims

        # Exclude already liked songs
        candidate_df = candidate_df[~candidate_df["Track URI"].isin(liked_track_uris)]

        top_candidates = candidate_df.sort_values(by="sim", ascending=False).head(top_n)

        return {
            "user_taste_profile": {
                "total_liked_tracks": len(liked_df),
                "audio_dna": taste_radar,
                "top_genres": [g for g in liked_df["Artist Genres"].str.cat(sep=",").split(",") if g.strip()][:5]
            },
            "recommendations": [
                self._format_track(row, similarity=row["sim"])
                for _, row in top_candidates.iterrows()
            ]
        }

    def generate_seed_playlist(
        self,
        seed_uris: List[str],
        target_length: int = 20,
        mood_boost: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Creates a coherent playlist flow from multiple seed songs.
        """
        if not self.is_ready or not seed_uris:
            return []

        seed_df = self.df[self.df["Track URI"].isin(seed_uris)]
        if seed_df.empty:
            return []

        seed_indices = seed_df.index.values
        seed_vectors = self.audio_scaled[seed_indices]
        centroid = np.mean(seed_vectors, axis=0).reshape(1, -1)

        sims = cosine_similarity(centroid, self.audio_scaled).flatten()
        candidate_df = self.df.copy()
        candidate_df["sim"] = sims
        candidate_df = candidate_df[~candidate_df["Track URI"].isin(seed_uris)]

        if mood_boost == "party":
            candidate_df["sim"] += candidate_df["Danceability"] * 0.2 + candidate_df["Energy"] * 0.2
        elif mood_boost == "chill":
            candidate_df["sim"] += candidate_df["Acousticness"] * 0.2 - candidate_df["Energy"] * 0.2
        elif mood_boost == "happy":
            candidate_df["sim"] += candidate_df["Valence"] * 0.3

        playlist_df = candidate_df.sort_values(by="sim", ascending=False).head(target_length)

        return [
            self._format_track(row, similarity=row["sim"])
            for _, row in playlist_df.iterrows()
        ]

    def get_genres(self, top_n: int = 50) -> List[Dict[str, Any]]:
        """Returns top genres and their track counts in the dataset."""
        if not self.is_ready:
            return []
        
        all_genres = []
        for g_str in self.df["Artist Genres"]:
            if g_str:
                for g in g_str.split(","):
                    g_clean = g.strip()
                    if g_clean:
                        all_genres.append(g_clean)
        
        series = pd.Series(all_genres).value_counts().head(top_n)
        return [{"genre": genre, "count": int(count)} for genre, count in series.items()]

    def get_popular_tracks(self, limit: int = 20, genre: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns trending/popular tracks."""
        if not self.is_ready:
            return []

        df_target = self.df
        if genre and genre.strip():
            df_target = self.df[self.df["Artist Genres"].str.lower().str.contains(genre.strip().lower(), regex=False)]

        top_df = df_target.sort_values(by="Popularity", ascending=False).head(limit)
        return [self._format_track(row) for _, row in top_df.iterrows()]


# Global Engine Singleton
engine_singleton = MusicRecommenderEngine()


def get_recommender_engine() -> MusicRecommenderEngine:
    return engine_singleton
