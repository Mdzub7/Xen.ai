import asyncio
from typing import Dict, Set
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.judge0_route import router as judge0_router
from app.routes.ai import router as ai_router
from app.routes.auth_router import router as auth_router
from app.routes.user_route import router as user_router
from app.routes.files import router as files_router
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json


app = FastAPI(
    title="AI Powered Code Reviewer",
    description="An API for AI-powered code review and execution",
    version="1.0.0"
)



@app.get("/")
async def root():
    """Root endpoint to check if the server is running."""
    return {
        "status": "online",
        "message": "AI Code Reviewer API is running",
        "available_services": ["gemini", "deepseek", "qwen-2.5"]
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Store active connections
class ConnectionManager:
    def __init__(self):
        # Maps room_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Maps websocket -> room_id
        self.connection_to_room: Dict[WebSocket, str] = {}
        # Track active status of each connection
        self.active_status: Dict[WebSocket, bool] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
        self.active_connections[room_id].add(websocket)
        self.connection_to_room[websocket] = room_id
        self.active_status[websocket] = True
        
        # Send the client list to all participants
        await self.broadcast_room_info(room_id)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.connection_to_room:
            room_id = self.connection_to_room[websocket]
            if websocket in self.active_connections.get(room_id, set()):
                self.active_connections[room_id].remove(websocket)
            
            # Mark as inactive
            self.active_status[websocket] = False
            
            # Clean up
            if websocket in self.connection_to_room:
                del self.connection_to_room[websocket]
            
            # Remove room if empty
            if room_id in self.active_connections and len(self.active_connections[room_id]) == 0:
                del self.active_connections[room_id]
            else:
                # Notify remaining clients about disconnect
                return room_id
        return None
    
    async def broadcast_room_info(self, room_id: str):
        if room_id in self.active_connections:
            client_count = len(self.active_connections[room_id])
            await self.safe_broadcast(room_id, {
                "type": "info",
                "clients": client_count
            })
    
    async def safe_send(self, websocket: WebSocket, message: dict):
        """Safely send a message to a websocket, handling exceptions"""
        try:
            if websocket in self.active_status and self.active_status[websocket]:
                await websocket.send_json(message)
                return True
        except Exception as e:
            print(f"Error sending message: {e}")
            self.active_status[websocket] = False
            return False
        return False
    
    async def safe_broadcast(self, room_id: str, message: dict):
        """Safely broadcast a message to all clients in the room"""
        if room_id in self.active_connections:
            active_connections = list(self.active_connections[room_id])
            for connection in active_connections:
                success = await self.safe_send(connection, message)
                if not success and connection in self.active_connections.get(room_id, set()):
                    self.active_connections[room_id].remove(connection)
    
    async def broadcast_to_room(self, room_id: str, sender: WebSocket, message: dict):
        """Broadcast a message to all clients in the room except the sender"""
        if room_id in self.active_connections:
            active_connections = list(self.active_connections[room_id])
            for connection in active_connections:
                if connection != sender:
                    success = await self.safe_send(connection, message)
                    if not success and connection in self.active_connections.get(room_id, set()):
                        self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

# In your FastAPI backend
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Parse the incoming message
            try:
                message = json.loads(data)
                # Forward the message to other clients in the room
                await manager.broadcast_to_room(room_id, websocket, message)
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {data}")
    except WebSocketDisconnect:
        room_id = manager.disconnect(websocket)
        if room_id:
            # Use asyncio.create_task to avoid blocking
            asyncio.create_task(manager.broadcast_room_info(room_id))
    except Exception as e:
        print(f"Error processing websocket: {e}")
        manager.disconnect(websocket)

app.include_router(ai_router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_router, prefix="/api", tags=["Compiler"])
app.include_router(auth_router, prefix="/auth")
app.include_router(files_router, prefix="/project",tags=["File System"])
app.include_router(user_router,prefix="",tags=["Profile"])