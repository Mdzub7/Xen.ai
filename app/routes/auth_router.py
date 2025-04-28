from fastapi import APIRouter, Depends, HTTPException, Security
from app.services.firebase_auth import verify_firebase_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()


def get_current_user(cred: HTTPAuthorizationCredentials = Security(security)):
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    """
    token = cred.credentials  
    try:
        # Use the verify_firebase_token function from firebase_auth.py
        user_data = verify_firebase_token(cred)
        return user_data  
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed.")


@router.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    """
    A protected route that requires authentication.
    """
    return {"message": "You are authenticated!", "user": user}