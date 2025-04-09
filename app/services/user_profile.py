import firebase_admin
from fastapi import HTTPException
import firebase_admin.auth


def profile_details(uid:str):
    try:
        user_record = firebase_admin.auth.get_user(uid)
        return user_record
    except firebase_admin.auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    
    



