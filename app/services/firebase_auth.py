import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

    

# Define Bearer token security scheme
security = HTTPBearer()

def verify_firebase_token(auth_credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Firebase ID token and return user data."""
    token = auth_credentials.credentials  
    print(token)
    try:
        decoded_token = auth.verify_id_token(token)  
        return decoded_token  
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
