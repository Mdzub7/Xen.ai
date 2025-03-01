from fastapi import APIRouter, Depends, HTTPException, Header
from ..services.firebase_auth import verify_firebase_token

auth_router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = authorization.split("Bearer ")[1]
    try:
        user_data = verify_firebase_token(token)
        return user_data  # This contains user UID, email, etc.
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@auth_router.get("/protected")
def protected_route(user=Depends(get_current_user)):
    """
    A protected route that requires authentication.
    """
    return {"message": "You are authenticated!", "user": user}
