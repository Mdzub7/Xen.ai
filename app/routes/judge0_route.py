from fastapi import APIRouter, Depends
from app.models.code_model import CodeSubmission
from app.controllers.judge0_controller import process_code_submission

router = APIRouter()

@router.post("/run-code/")
async def run_code(submission: CodeSubmission):
    result = process_code_submission(submission.source_code, submission.language_id, submission.stdin)
    return result
