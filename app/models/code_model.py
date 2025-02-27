from pydantic import BaseModel

class CodeRequest(BaseModel):
    code: str
    service_choice: str

class CodeSubmission(BaseModel):
    source_code: str
    language_id: int
    stdin: str = ""
