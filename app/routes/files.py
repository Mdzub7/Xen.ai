from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from firebase_admin import firestore
# Fix the firebase_client import - you need to create this module
from app.firebase_client import db
# Fix the auth_router import
from app.routes.auth_router import get_current_user
# Fix the file_model import
from app.models.file_model import FileContent, FolderCreate

router = APIRouter()

@router.post("/files/")
async def create_file(file: FileContent, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(file.folder).document(file.filename)
    doc_ref.set({
        "content": file.content,
        "filename": file.filename,
        "folder": file.folder,
        "last_modified": firestore.SERVER_TIMESTAMP
    })
    return {"message": f"File '{file.filename}' created/updated successfully."}


@router.get("/files/{folder}/{filename}")
async def read_file(folder: str, filename: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(folder).document(filename)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="File not found")
    return doc.to_dict()


@router.get("/files/{folder}")
async def list_files(folder: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    docs = db.collection("users").document(user_id).collection(folder).stream()
    
    files = [{"filename": doc.id, **doc.to_dict()} for doc in docs if doc.id != ".marker"]
    
    if not files:
        return {"message": f"No files found in folder '{folder}'"}
    
    return {"files": files}


@router.delete("/files/{folder}/{filename}")
async def delete_file(folder: str, filename: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("users").document(user_id).collection(folder).document(filename)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="File not found")
    
    doc_ref.delete()
    return {"message": f"File '{filename}' deleted successfully."}


@router.post("/folders/")
async def create_folder(folder: FolderCreate, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    
    # Check if folder already exists
    existing_folders = [col.id for col in db.collection("users").document(user_id).collections()]
    if folder.folder_name in existing_folders:
        raise HTTPException(status_code=400, detail="Folder already exists")
    
    # Create a marker document
    doc_ref = db.collection("users").document(user_id).collection(folder.folder_name).document(".marker")
    doc_ref.set({
        "created": firestore.SERVER_TIMESTAMP,
        "is_marker": True
    })
    
    return {"message": f"Folder '{folder.folder_name}' created successfully."}


@router.get("/folders/")
async def list_folders(user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    folders = [col.id for col in db.collection("users").document(user_id).collections()]
    
    if not folders:
        return {"message": "No folders found"}
    
    return {"folders": folders}


@router.delete("/folders/{folder}")
async def delete_folder(folder: str, user: Dict = Depends(get_current_user)):
    user_id = user["uid"]
    folder_ref = db.collection("users").document(user_id).collection(folder)

    # First, delete all files inside the folder
    docs = folder_ref.stream()
    for doc in docs:
        doc.reference.delete()

    return {"message": f"Folder '{folder}' and all its contents deleted successfully."}
