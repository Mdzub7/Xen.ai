from fastapi import APIRouter, HTTPException, Header,Depends
from pydantic import BaseModel
from typing import Optional
from ..firebase_client import db
from .auth_router import get_current_user
from ..services.firebase_auth import verify_firebase_token
from ..models.file_model import FileContent,FolderCreate
from typing import Dict
import firebase_admin
from firebase_admin import firestore

app = APIRouter()

@app.post("/files/")
async def create_file(file: FileContent, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(file.folder).document(file.filename)
    doc_ref.set({
        "content": file.content,
        "filename": file.filename,
        "folder": file.folder,
        "last_modified": firestore.SERVER_TIMESTAMP
    })
    return {"message": f"File {file.filename} created/updated"}

@app.get("/files/{folder}/{filename}")
async def read_file(folder: str, filename: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(folder).document(filename)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="File not found")
    return doc.to_dict()

@app.get("/files/{folder}", response_model=dict)
async def list_files(folder: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    docs = db.collection("users").document(user_id).collection(folder).stream()
    files = [{"filename": doc.id, **doc.to_dict()} for doc in docs if doc.id!=".marker"]
    return {"files": files}

@app.delete("/files/{folder}/{filename}")
async def delete_file(folder: str, filename: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(folder).document(filename)
    doc_ref.delete()
    return {"message": f"File {filename} deleted"}

@app.post("/folders/")
async def create_folder(folder: FolderCreate, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    existing_folders = [col.id for col in db.collection("users").document(user_id).collections()]
    if folder.folder_name in existing_folders:
        raise HTTPException(status_code=400, detail="Folder already exists")
    
    doc_ref = db.collection("users").document(user_id).collection(folder.folder_name).document(".marker")
    doc_ref.set({"created": firestore.SERVER_TIMESTAMP,
                "is_marker":True})
    #doc_ref.delete() 
    return {"message": f"Folder {folder.folder_name} created"}

# List all folders
@app.get("/folders/", response_model=dict)
async def list_folders(user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    folders = [col.id for col in db.collection("users").document(user_id).collections()]
    return {"folders": folders}