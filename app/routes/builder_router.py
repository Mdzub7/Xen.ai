from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, List, Optional, Any
from app.controllers.builder_controller import generate_code, modify_file, execute_command, get_file_structure
from app.routes.auth_router import get_current_user
from pydantic import BaseModel

router = APIRouter()

class CodeGenerationRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

class FileModificationRequest(BaseModel):
    file_path: str
    changes: Dict[str, Any]

class CommandExecutionRequest(BaseModel):
    command: str

@router.post("/generate")
async def generate_code_endpoint(request: CodeGenerationRequest, user_data: dict = Depends(get_current_user)):
    """Endpoint to generate code based on a prompt and optional context."""
    try:
        result = await generate_code(request.prompt, request.context, user_data)
        return {
            "status": "success",
            "data": result
        }
    except HTTPException as e:
        return {
            "status": "error",
            "message": str(e.detail),
            "code": e.status_code
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}",
            "code": 500
        }

@router.post("/modify-file")
async def modify_file_endpoint(request: FileModificationRequest, user_data: dict = Depends(get_current_user)):
    """Endpoint to modify a file in the project."""
    return await modify_file(request.file_path, request.changes, user_data)

@router.post("/execute-command")
async def execute_command_endpoint(request: CommandExecutionRequest, user_data: dict = Depends(get_current_user)):
    """Endpoint to execute a terminal command."""
    return await execute_command(request.command, user_data)

@router.get("/file-structure")
async def get_file_structure_endpoint(user_data: dict = Depends(get_current_user)):
    """Endpoint to get the project file structure."""
    return await get_file_structure(user_data)