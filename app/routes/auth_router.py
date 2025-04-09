from fastapi import APIRouter, Depends, HTTPException, Header, Security
from services.firebase_auth import verify_firebase_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import credentials, auth

router = APIRouter()
security = HTTPBearer()


def get_current_user(cred: HTTPAuthorizationCredentials = Security(security)):
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    """
    token = cred.credentials  
    try:
        user_data = auth.verify_id_token(token)  
        return user_data  
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token. Please check your token.")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked. Please log in again.")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed.")

@router.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    """
    A protected route that requires authentication.
    """
    return {"message": "You are authenticated!", "user": user}