from fastapi import HTTPException, Depends
from typing import Dict, List, Optional, Any
from app.services.builder_service import builder_service
from app.routes.auth_router import get_current_user

async def generate_code(prompt: str, context: Optional[Dict[str, Any]] = None, user_data: dict = Depends(get_current_user)):
    """Controller function to handle code generation requests.
    
    Args:
        prompt: The user's request for code generation
        context: Optional context information like file contents, project structure, etc.
        user_data: User authentication data from Firebase
        
    Returns:
        Generated code with status
    """
    try:
        # Verify user has access to the Builder feature
        # This could include checking for beta access, subscription status, etc.
        
        # Call the service to generate code
        generated_code = await builder_service.generate_code(prompt, context)
        
        # Ensure we have a valid response
        if not generated_code or not isinstance(generated_code, dict) or 'code' not in generated_code:
            return {"status": "error", "message": "No code received in the response"}
            
        return generated_code
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def modify_file(file_path: str, changes: Dict[str, Any], user_data: dict = Depends(get_current_user)):
    """Controller function to handle file modification requests.
    
    Args:
        file_path: Path to the file to modify
        changes: Dictionary containing the changes to make
        user_data: User authentication data from Firebase
        
    Returns:
        Result of the operation
    """
    try:
        # Verify user has access to modify files
        
        # Call the service to modify the file
        result = await builder_service.modify_file(file_path, changes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def execute_command(command: str, user_data: dict = Depends(get_current_user)):
    """Controller function to handle command execution requests.
    
    Args:
        command: The command to execute
        user_data: User authentication data from Firebase
        
    Returns:
        Result of the command execution
    """
    try:
        # Verify user has access to execute commands
        
        # Call the service to execute the command
        result = await builder_service.execute_command(command)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_file_structure(user_data: dict = Depends(get_current_user)):
    """Controller function to get the project file structure.
    
    Args:
        user_data: User authentication data from Firebase
        
    Returns:
        Project file structure
    """
    try:
        # Verify user has access to view file structure
        
        # Call the service to get the file structure
        structure = await builder_service.get_file_structure()
        return structure
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))