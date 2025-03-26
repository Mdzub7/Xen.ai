from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from services.ai_service import gemini_generate_review, deepseek_generate_review, qwen_generate_review, qwq_generate_review
from models.code_model import CodeRequest
import asyncio

async def get_available_services():
    """Get list of available AI services."""
    return {
        "services": [
            {"name": "gemini", "description": "Google's Gemini AI model"},
            {"name": "deepseek", "description": "DeepSeek AI model"},
            {"name": "qwen", "description": "Qwen AI model"},
            {"name": "qwq", "description": "QwQ AI model"}
        ],
        "status": {
            "gemini": "active",
            "deepseek": "active",
            "qwen-2.5": "active",
            "qwq-32b": "active"
        }
    }

# Define streaming versions of the review functions
async def gemini_generate_review_stream(code: str):
    """Stream response from Gemini AI"""
    response = await gemini_generate_review(code)
    # Simulate streaming by yielding parts of the response
    for i in range(0, len(response), 10):
        yield response[i:i+10]
        await asyncio.sleep(0.05)  # Small delay to simulate streaming

async def deepseek_generate_review_stream(code: str):
    """Stream response from DeepSeek AI"""
    response = await deepseek_generate_review(code)
    for i in range(0, len(response), 10):
        yield response[i:i+10]
        await asyncio.sleep(0.05)

async def qwen_generate_review_stream(code: str):
    """Stream response from Qwen AI"""
    response = await qwen_generate_review(code)
    for i in range(0, len(response), 10):
        yield response[i:i+10]
        await asyncio.sleep(0.05)

async def qwq_generate_review_stream(code: str):
    """Stream response from QWQ AI"""
    response = await qwq_generate_review(code)
    for i in range(0, len(response), 10):
        yield response[i:i+10]
        await asyncio.sleep(0.05)

async def get_review_stream(code: str, service_choice: str):
    """Stream the AI review response"""
    async def generate():
        try:
            if service_choice == "gemini":
                async for chunk in gemini_generate_review_stream(code):
                    yield chunk
            elif service_choice == "deepseek":
                async for chunk in deepseek_generate_review_stream(code):
                    yield chunk
            elif service_choice == "qwen-2.5":
                async for chunk in qwen_generate_review_stream(code):
                    yield chunk
            elif service_choice == "qwq-32b":
                async for chunk in qwq_generate_review_stream(code):
                    yield chunk
            else:
                yield "Invalid service choice. Choose 'gemini', 'deepseek', 'qwen-2.5', or 'qwq-32b'."
        except Exception as e:
            yield f"Error: {str(e)}"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

async def get_review(code: str, service_choice: str):
    """Get AI review (non-streaming version)"""
    if service_choice == "gemini":
        return await gemini_generate_review(code)
    elif service_choice == "deepseek":
        return await deepseek_generate_review(code)
    elif service_choice == "qwen-2.5":
        return await qwen_generate_review(code)
    elif service_choice == "qwq-32b":
        return await qwq_generate_review(code)
    else:
        raise ValueError("Invalid service choice. Choose 'gemini', 'deepseek', 'qwen-2.5', or 'qwq-32b'.")
