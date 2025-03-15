import firebase_admin
from fastapi import HTTPException, Security, Depends
import firebase_admin.auth
from ..routes.auth_router import get_current_user
from typing import Dict

def profile_details(uid:str):
    try:
        user_record=firebase_admin.auth.get_user(uid)
        return user_record
    except firebase_admin.auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    
    



