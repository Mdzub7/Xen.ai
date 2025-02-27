from fastapi import APIRouter, HTTPException
from ..controllers.ai_controller import get_review
from ..models.code_model import CodeRequest

router = APIRouter()


@router.post("/get-review")
async def review_code(payload: CodeRequest):
    """Route to process AI code review."""
    try:
        review = await get_review(payload.code, payload.service_choice)
        return {"review": review}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))