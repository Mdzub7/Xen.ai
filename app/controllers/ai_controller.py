from fastapi import HTTPException
from ..services.ai_service import generate_review
from ..models.code_model import CodeRequest

async def get_review(payload: CodeRequest):
    """Processes code and returns AI-generated review."""
    code = payload.code
    if not code:
        raise HTTPException(status_code=400, detail="Code is required.")

    response = await generate_review(code)
    return {"review": response}
