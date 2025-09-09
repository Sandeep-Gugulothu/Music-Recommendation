from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
import hmac
import hashlib
import json
import base64

try:
    from jose import jwt, JWTError
    HAS_JOSE = True
except ImportError:
    try:
        import jwt
        from jwt import PyJWTError as JWTError
        HAS_JOSE = False
    except ImportError:
        jwt = None
        JWTError = Exception
        HAS_JOSE = False

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    pwd_context = None

from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if pwd_context is not None:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass
    # Fallback to salted sha256
    if ":" in hashed_password:
        salt, h = hashed_password.split(":", 1)
        calc = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
        return hmac.compare_digest(calc, h)
    return False


def get_password_hash(password: str) -> str:
    if pwd_context is not None:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass
    salt = base64.b64encode(hashlib.sha256(str(datetime.now().timestamp()).encode()).digest()[:16]).decode()
    h = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}:{h}"


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    if jwt is not None:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    # Simple self-contained fallback token encoding
    payload_str = json.dumps({"sub": str(subject), "exp": int(expire.timestamp())})
    payload_b64 = base64.urlsafe_b64encode(payload_str.encode()).decode().rstrip("=")
    sig = hmac.new(settings.SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def decode_token(token: str) -> Optional[dict]:
    if jwt is not None:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except Exception:
            return None
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        pad = "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + pad).decode())
        if payload.get("exp", 0) < datetime.now().timestamp():
            return None
        return payload
    except Exception:
        return None
