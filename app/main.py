from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.judge0_route import router as judge0_router
from app.routes.ai import router as ai_router
from app.routes.auth_router import router as auth_router
from app.routes.user_route import router as user_router
from app.routes.files import router as files_router
from typing import Dict, List
from fastapi.websockets import WebSocket, WebSocketDisconnect
import json
import asyncio
import threading
from redis import Redis

app = FastAPI(
    title="AI Powered Code Reviewer",
    description="An API for AI-powered code review and execution",
    version="1.0.0"
)
REDIS_HOST = "localhost"
REDIS_PORT = 6379
redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
PUBSUB_PREFIX = "room:"

class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, dict[str, WebSocket]] = {}  # room_id: {user_id: websocket}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = {}
        self.rooms[room_id][user_id] = websocket
        await self.broadcast_notification(room_id, f"User {user_id} joined.", user_id)

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            del self.rooms[room_id][user_id]
            asyncio.create_task(self.broadcast_notification(room_id, f"User {user_id} left.", user_id))
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast_notification(self, room_id: str, message: str, user_id: str):
        notification = {
            "type": "notification",
            "content": message,
            "userId": user_id
        }
        await self.broadcast_message(room_id, json.dumps(notification))

    async def broadcast_message(self, room_id: str, message_json: str):
        """Broadcast a raw JSON message to all users in a room"""
        if room_id in self.rooms:
            disconnected_users = []
            for user_id, connection in self.rooms[room_id].items():
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    print(f"Error sending to user {user_id}: {e}")
                    disconnected_users.append(user_id)
            
            # Clean up disconnected users
            for user_id in disconnected_users:
                if user_id in self.rooms[room_id]:
                    del self.rooms[room_id][user_id]
        
        # Also publish to Redis for other server instances
        try:
            redis_client.publish(f"{PUBSUB_PREFIX}{room_id}", message_json)
        except Exception as e:
            print(f"Redis publish error: {e}")

manager = ConnectionManager()

# Global queue for Redis messages
redis_message_queue = asyncio.Queue()

async def process_redis_messages():
    """Task to process Redis messages from the queue"""
    while True:
        message = await redis_message_queue.get()
        try:
            if message["type"] == "pmessage":
                room_id = message["channel"].replace(PUBSUB_PREFIX, "")
                message_data = message["data"]
                
                if room_id in manager.rooms:
                    await manager.broadcast_message(room_id, message_data)
                    print(f"Redis forwarded message to room {room_id}")
        except Exception as e:
            print(f"Redis message handling error: {e}")
        finally:
            redis_message_queue.task_done()

def redis_listener():
    """Run in a separate thread to listen to Redis and put messages in the queue"""
    print("Starting Redis listener thread")
    pubsub = redis_client.pubsub()
    pubsub.psubscribe(f"{PUBSUB_PREFIX}*")
    
    # Reference to the main event loop
    loop = asyncio.get_event_loop_policy().get_event_loop()
    
    for message in pubsub.listen():
        if message["type"] == "pmessage":
            asyncio.run_coroutine_threadsafe(
                redis_message_queue.put(message), 
                loop
            )

@app.websocket("/ws/room/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(websocket, room_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                # Log raw message for debugging
                print(f"Raw message from user {user_id}: {data}")
                
                # Parse message
                message_data = json.loads(data)
                
                # Always ensure userId is in the message
                if "userId" not in message_data:
                    message_data["userId"] = user_id
                
                # Log the structured message
                print(f"Processed message from room {room_id}, user {user_id}: {message_data}")
                
                # Convert back to JSON string and broadcast
                message_json = json.dumps(message_data)
                await manager.broadcast_message(room_id, message_json)
            except json.JSONDecodeError:
                print(f"Invalid JSON received from {user_id}: {data}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user {user_id} in room {room_id}")
        manager.disconnect(room_id, user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(room_id, user_id)

@app.on_event("startup")
async def startup_event():
    # Start the Redis message processor
    asyncio.create_task(process_redis_messages())
    
    # Start the Redis listener in a separate thread
    redis_thread = threading.Thread(target=redis_listener, daemon=True)
    redis_thread.start()
    print("Server started with Redis pubsub integration")

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

app.include_router(ai_router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_router, prefix="/api", tags=["Compiler"])
app.include_router(auth_router, prefix="/auth")
app.include_router(files_router, prefix="/project", tags=["File System"])
app.include_router(user_router, prefix="", tags=["Profile"])