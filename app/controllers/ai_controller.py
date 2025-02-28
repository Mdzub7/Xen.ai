from fastapi import HTTPException
from ..services.ai_service import gemini_generate_review,deepseek_generate_review,qwen_generate_review
from ..models.code_model import CodeRequest

async def get_available_services():
    """Get list of available AI services."""
    return {
        "gemini": "active",
        "deepseek": "active",
        "qwen-2.5": "active"
    }

async def get_review(code:str,service_choice:str):
    if service_choice == "gemini":
        return await gemini_generate_review(code)
    elif service_choice == "deepseek":
        return await deepseek_generate_review(code)
    elif service_choice == "qwen-2.5":
        return await qwen_generate_review(code)
    else:
        raise ValueError("Invalid service choice. Choose 'gemini' or 'deepseek' or 'qwen'.")
