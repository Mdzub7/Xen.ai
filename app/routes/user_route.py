from fastapi import APIRouter, Depends
from ..controllers.user_profile_controller import profile

router = APIRouter()

@router.get("/profile/")
async def get_profile(profile: dict = Depends(profile)): 
    return profile  
