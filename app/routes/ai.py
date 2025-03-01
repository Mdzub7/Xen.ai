from fastapi import APIRouter, HTTPException,Depends
from ..controllers.ai_controller import get_review, get_available_services
from ..models.code_model import CodeRequest
from ..services.firebase_auth import verify_firebase_token

router = APIRouter()

@router.get("/status")
async def ai_service_status():
    """Check the status of AI services."""
    services = await get_available_services()
    return {
        "status": "operational",
        "available_services": services
    }

@router.post("/get-review")
async def review_code(payload: CodeRequest,
                      user_data:dict=Depends(verify_firebase_token)):
    """Route to process AI code review."""
    try:
        review = await get_review(payload.code, payload.service_choice)
        return {"review": review}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))