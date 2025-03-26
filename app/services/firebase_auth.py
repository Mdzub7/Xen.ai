
from firebase_admin import auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    

# Define Bearer token security scheme
security = HTTPBearer()

def verify_firebase_token(auth_credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Firebase ID token and return user data."""
    token = auth_credentials.credentials  
    if not token:
        raise HTTPException(status_code=401,detail="Misssing token")
    try:
        decoded_token = auth.verify_id_token(token)  
        return decoded_token  
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

