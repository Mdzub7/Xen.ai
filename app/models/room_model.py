from pydantic import BaseModel

class JoinRoomRequest(BaseModel):
    room_id: str
    password: str
    user_id: str