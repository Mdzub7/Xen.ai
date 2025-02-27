from fastapi import APIRouter, HTTPException
from ..controllers.ai_controller import get_review
from ..models.code_model import CodeRequest

router = APIRouter()


@router.post("/get-review")
async def review_code(payload: CodeRequest):
    """Route to process AI code review."""
    return await get_review(payload)
