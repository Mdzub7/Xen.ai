from fastapi import APIRouter
from ..models.code_model import CodeSubmission
from ..controllers.judge0_controller import process_code_submission

router = APIRouter()

@router.post("/run-code/")
async def run_code(submission: CodeSubmission):
    """
    API endpoint to receive code submissions and return execution results.
    """
    result = process_code_submission(submission.source_code, submission.language_id, submission.stdin)
    return result
