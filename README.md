# Music Recommendation System

A full-stack, containerized **Music Recommendation System** built with **FastAPI**, **Machine Learning (Scikit-Learn)**, **PostgreSQL/SQLite**, and **React (Vite + Tailwind CSS)**.

---

## 🌟 Overview & Architecture

An intelligent recommendation system powered by a dataset of **10,000+ Spotify tracks** from 1950 to the present with high-dimensional acoustic features.

```
                  ┌──────────────────────────────┐
                  │    React 18 + Vite Client    │
                  │ (Tailwind CSS, Glassmorphic) │
                  └──────────────┬───────────────┘
                                 │ REST / JWT
                                 ▼
                  ┌──────────────────────────────┐
                  │    FastAPI Backend Server    │
                  │      (Uvicorn, Python)       │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                           ┌───────────────────┐
│ Machine Learning │                           │  Database Storage │
│ Recommendation   │                           │ (Postgres/SQLite) │
│ Engine (K-Means, │                           │   Users, Likes,   │
│ Cosine, TF-IDF)  │                           │     Playlists     │
└──────────────────┘                           └───────────────────┘
```

---

## ✨ Features

### 1. Recommendation Algorithms
- **Hybrid AI**: Combines 9-dimensional acoustic feature similarity (65%) with TF-IDF genre/artist semantic vectors (35%) and popularity weighting.
- **Audio DNA Vector Space**: 9-dimensional acoustic similarity (*danceability, energy, valence, acousticness, loudness, speechiness, tempo, etc.*).
- **Cluster Cosine**: K-Means clustered audio similarity.
- **Artist & Genre Matcher**: Semantic genre and artist matching with tempo/energy harmony.

### 2. Interactive Vibe & Mood Controls
- Fine-tune exact target vibes with interactive sliders (*Energy, Danceability, Valence/Happiness, Acousticness, Tempo BPM, and Popularity threshold*).
- Presets: `Party Anthem`, `Acoustic Chill`, `Deep Focus`, `Sunshine Mood`, `Late Night Melancholy`.

### 3. Audio DNA Radar Visualizer
- 7-axis radar chart directly comparing the acoustic features of any seed song against candidate recommendations.

### 4. Personalized "For You" Feed
- Dynamically calculates user taste centroid from liked songs to serve personalized recommendations.

### 5. Custom Playlists & Multi-Seed Flow Generator
- Create and manage custom playlists.
- Input multiple seed songs with mood boosters (`party`, `chill`, `happy`) to generate smooth curated playlist flows.
- One-click `.m3u` playlist export.

### 6. 30s Audio Preview Player
- Embedded HTML5 preview playback, time scrubber, volume control, and Spotify links.

---

## 🚀 Getting Started

### Option A: Running with Docker Compose
```bash
docker compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Running Locally

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Or run `run_dev.bat` on Windows to launch both services simultaneously!

---

## 🧪 Automated Testing
Run the test suite (14 test cases covering ML engine, search, audio features, auth, recommendations, playlists, and likes):
```bash
cd backend
python -m pytest tests -v -o asyncio_mode=auto
```

---

## 📂 Project Structure
```
Music-Recommendation/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Auth, Tracks, Recommendations, Likes, Playlists, Health
│   │   ├── core/              # Config, Security (JWT, bcrypt)
│   │   ├── db/                # Session & Base setup (Postgres/SQLite)
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic v2 schemas
│   │   ├── services/          # ML Engine & Recommendation logic
│   │   └── main.py            # FastAPI Application & Lifespan handler
│   ├── data/                  # 10,000+ Track Spotify Dataset
│   ├── tests/                 # Unit & Async Integration tests
│   ├── Dockerfile             # Backend Docker configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # AudioRadarChart, TrackCard, Navbar, AudioPlayer, Modals
│   │   ├── context/           # AuthContext, PlayerContext, LikeContext
│   │   ├── pages/             # Explore, Recommendation, VibeLab, ForYou, Playlists, Liked
│   │   ├── services/          # API Client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile             # Multi-stage Nginx build
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml         # Full-stack orchestrator
└── README.md
```

---

## 📄 License
MIT License.
