
from firebase_admin import auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..firebase_client import db
    

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

async def verify_role(auth_credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Firebase ID token and return user role from Firestore."""
    token = auth_credentials.credentials  

    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded_token = auth.verify_id_token(token)  
        uid = decoded_token.get("uid")

        if not uid:
            raise HTTPException(status_code=401, detail="Invalid token. UID missing.")

        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in Firestore")

        role = user_doc.to_dict().get("role")
        return role
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token or role retrieval failed: {str(e)}")
