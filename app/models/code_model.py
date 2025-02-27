from pydantic import BaseModel

class CodeRequest(BaseModel):
    code: str


class CodeSubmission(BaseModel):
    source_code: str
    language_id: int
    stdin: str = ""
