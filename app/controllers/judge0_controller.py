from ..services.judge0_service import submit_code

def process_code_submission(source_code: str, language_id: int, stdin: str):
    """
    Processes a code submission and returns the result.
    """
    result = submit_code(source_code, language_id, stdin)
    
    if "error" in result:
        return {"success": False, "message": result["error"]}
    
    return {"output": result.get("stdout", ""),"success": True, "time": result.get("time", "N/A")}
