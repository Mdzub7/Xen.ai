from pydantic import BaseModel

class FileContent(BaseModel):
    filename: str
    content: str
    folder: str


class FolderCreate(BaseModel):
    folder_name: str