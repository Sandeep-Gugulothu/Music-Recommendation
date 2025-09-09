from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, LikedTrack
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, UserUpdate
from app.schemas.recommendation import TasteProfile
from app.services.recommender import get_recommender_engine

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """Register a new user account."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    username = user_in.username or user_in.email.split("@")[0]
    # Check if username exists
    existing_uname = db.query(User).filter(User.username == username).first()
    if existing_uname:
        username = f"{username}_{int(db.query(User).count()) + 1}"

    user = User(
        email=user_in.email.lower(),
        username=username,
        full_name=user_in.full_name or username,
        hashed_password=get_password_hash(user_in.password),
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token)
def login(
    user_in: Optional[UserLogin] = Body(None),
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(lambda: None),
    db: Session = Depends(get_db)
) -> Any:
    """Login with email & password (supports JSON body or OAuth2 Form)."""
    email = None
    password = None

    if form_data is not None and form_data.username:
        email = form_data.username
        password = form_data.password
    elif user_in is not None:
        email = user_in.email
        password = user_in.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is disabled.")

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)) -> Any:
    """Retrieve logged-in user profile."""
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update profile information."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.username is not None:
        current_user.username = user_update.username
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/taste-profile")
def get_user_taste_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Compute and return the logged-in user's Audio DNA taste profile."""
    liked_tracks = db.query(LikedTrack).filter(LikedTrack.user_id == current_user.id).all()
    liked_uris = [t.track_uri for t in liked_tracks]
    
    engine = get_recommender_engine()
    user_rec = engine.recommend_for_user(liked_track_uris=liked_uris, top_n=5)
    
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "total_liked": len(liked_tracks),
        "taste_profile": user_rec.get("user_taste_profile")
    }
