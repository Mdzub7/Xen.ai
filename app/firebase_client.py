import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load Firebase credentials from the service account JSON file
firebase_json = os.getenv("FIREBASE_CREDENTIALS")

cred = credentials.Certificate(firebase_json)
firebase_admin.initialize_app(cred)
db=firestore.client()
