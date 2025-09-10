import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine, Base
from app.api.v1.api import api_router
from app.services.recommender import get_recommender_engine
import app.models  # Import all models to ensure metadata registration


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist and initialize ML engine
    print(f"[{settings.PROJECT_NAME}] Starting up...")
    try:
        Base.metadata.create_all(bind=engine)
        print(f"[{settings.PROJECT_NAME}] Database tables verified/created.")
    except Exception as e:
        print(f"[{settings.PROJECT_NAME}] Warning: Database init error (will retry when DB available): {e}")

    # Eagerly initialize recommender engine
    engine_inst = get_recommender_engine()
    print(f"[{settings.PROJECT_NAME}] Engine status: ready={engine_inst.is_ready}")
    
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Containerized Music Recommendation Engine with Audio DNA analysis, mood tuning, and user taste profiling.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all local and deployed frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
