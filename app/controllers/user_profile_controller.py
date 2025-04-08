from fastapi import Depends
from app.services.user_profile import profile_details
from app.routes.auth_router import get_current_user

def profile(user: dict = Depends(get_current_user)):
    uid = user["uid"]
    user_record = profile_details(uid)

    # ✅ Convert UserRecord to dictionary
    user_data = {
        "uid": user_record.uid,
        "email": user_record.email,
        "display_name": user_record.display_name,
        "photo_url": user_record.photo_url,
        "phone_number": user_record.phone_number,
        "disabled": user_record.disabled,
        "provider_data": user_record.provider_data[0]._data if user_record.provider_data else None
    }

    return {"profile": user_data}
