# Music-Recommendation

An intelligent, containerized **Music Recommendation System** built with **FastAPI**, **Machine Learning (Scikit-Learn)**, **PostgreSQL/SQLite**, and **React**.

---

## 🌟 Overview & Architecture

HarmoniQ is an advanced multi-strategy music recommendation engine powered by a dataset of **10,000+ Spotify songs** from 1950 to the present with high-dimensional acoustic features.

### Key Features
- **Multi-Algorithm Recommender Engine**:
  - **Hybrid Engine**: Balances acoustic audio DNA cosine distance with genre/artist TF-IDF semantic embeddings and popularity weighting.
  - **Audio DNA Cosine**: 9-dimensional acoustic feature similarity (*danceability, energy, acousticness, valence, loudness, speechiness, tempo, etc.*).
  - **Cluster Cosine**: K-Means clustered audio similarity.
  - **Artist & Genre Matcher**: TF-IDF textual semantic matching with tempo harmony.
- **Parametric Vibe & Mood Lab**: Dial in custom vibes in real time with interactive mood sliders (e.g. high valence/cheerful, party energy, acoustic chill, tempo BPM).
- **Personalized 'For You' Feed**: Computes a dynamic user taste centroid from liked tracks to uncover personalized gems.
- **Multi-Seed Playlist Studio**: Generates cohesive playlist transitions with mood boosters (`party`, `chill`, `happy`).
- **Audio DNA Radar Charts**: Interactive 7-axis visual comparison between seed songs and recommendations.
- **Smart Multi-Field Fuzzy Search**: Instant search across song titles, artists, albums, and genres.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional)

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m pytest tests/test_recommender.py -v
```

---

## 📂 Project Structure
```
Music-Recommendation/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints
│   │   ├── core/         # Config & Security
│   │   ├── db/           # Database sessions & models
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # ML Recommender Engine & Business Logic
│   ├── data/             # Spotify 10K dataset
│   └── tests/            # Test suite
├── frontend/             # Modern React Frontend (Vite + Tailwind)
└── docker-compose.yml    # Full-stack containerization
```

---

## 📄 License
MIT License.
