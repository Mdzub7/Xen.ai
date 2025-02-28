from fastapi import APIRouter, HTTPException
from ..controllers.ai_controller import get_review, get_available_services
from ..models.code_model import CodeRequest

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
async def review_code(payload: CodeRequest):
    """Route to process AI code review."""
    try:
        review = await get_review(payload.code, payload.service_choice)
        return {"review": review}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))