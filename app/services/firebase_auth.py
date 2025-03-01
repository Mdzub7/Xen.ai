import firebase_admin
from firebase_admin import credentials, auth
import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load Firebase credentials from the service account JSON file
firebase_json = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_admin._apps:  # Ensure Firebase is initialized only once
    cred = credentials.Certificate(firebase_json)
    firebase_admin.initialize_app(cred)

# Define Bearer token security scheme
security = HTTPBearer()

def verify_firebase_token(auth_credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Firebase ID token and return user data."""
    token = auth_credentials.credentials  
    try:
        decoded_token = auth.verify_id_token(token)  
        return decoded_token  
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
