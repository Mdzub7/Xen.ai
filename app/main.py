from fastapi import FastAPI, HTTPException, Depends
from app.routes.judge0_route import router as judge0_router
from app.routes.ai import router as ai_router
from app.routes.auth_router import router as auth_router
from app.routes.user_route import router as user_router
from app.routes.files import router as files_router
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from fastapi.websockets import WebSocket, WebSocketDisconnect
import json
import asyncio
import threading
from redis import Redis
import uuid
from app.models.room_model import JoinRoomRequest

app = FastAPI(
    title="AI Powered Code Reviewer",
    description="An API for AI-powered code review and execution",
    version="1.0.0"
)
REDIS_HOST = "localhost"
REDIS_PORT = 6379
redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
PUBSUB_PREFIX = "room:"
ROOM_PREFIX = "collab_room:"
ROOM_CONTENT: Dict[str, str] = {}  # Store current content per room

# Utility function to generate a random password
def generate_password(length=8):
    import random
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return "".join(random.choice(characters) for _ in range(length))

class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, dict[str, WebSocket]] = {}  # room_id: {user_id: websocket}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
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

    async def broadcast_message(self, room_id: str, message_json: str, exclude_websocket: WebSocket = None):
        """Broadcast a raw JSON message to all users in a room"""
        if room_id in self.rooms:
            print(f"Broadcasting message to room {room_id}: {message_json}")  # Debug log
            disconnected_users = []
            for user_id, connection in self.rooms[room_id].items():
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(message_json)
                        print(f"Message sent to user {user_id}")  # Debug log
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
            print(f"Message published to Redis for room {room_id}")  # Debug log
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
    pubsub = redis_client.pubsub()
    pubsub.psubscribe(f"{PUBSUB_PREFIX}*")

    # Set up a new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    for message in pubsub.listen():
        if message["type"] == "pmessage":
            asyncio.run_coroutine_threadsafe(
                redis_message_queue.put(message),
                loop
            )

# --- New Room Creation and Joining Logic ---

async def create_room():
    room_id = str(uuid.uuid4())
    password = generate_password()
    room_key = f"{ROOM_PREFIX}{room_id}"
    redis_client.hmset(room_key, {"password": password, "host_id": ""}) # Host ID will be set on first join
    ROOM_CONTENT[room_id] = "" # Initialize content for the new room
    return {"room_id": room_id, "password": password}

async def join_room(websocket: WebSocket, room_id: str, user_id: str, password: str = None):
    room_key = f"{ROOM_PREFIX}{room_id}"
    room_data = redis_client.hgetall(room_key)

    if not room_data:
        await websocket.send_text(json.dumps({"type": "error", "message": "Room not found"}))
        await websocket.close()
        return False, None

    stored_password = room_data.get("password")
    host_id = room_data.get("host_id")

    if host_id == "":  # First user becomes the host
        redis_client.hset(room_key, "host_id", user_id)
        role = "host"
    elif password is None:
        await websocket.send_text(json.dumps({"type": "error", "message": "Password required to join this room."}))
        await websocket.close()
        return False, None
    elif stored_password != password:
        await websocket.send_text(json.dumps({"type": "error", "message": "Invalid password."}))
        await websocket.close()
        return False, None
    else:
        role = "guest"

    await manager.connect(websocket, room_id, user_id)
    await websocket.send_text(json.dumps({"type": "room_joined", "roomId": room_id, "role": role}))

    # Send initial content to the joining guest
    if room_id in ROOM_CONTENT and role == "guest":
        await websocket.send_text(json.dumps({
            "type": "initial_content",
            "content": ROOM_CONTENT[room_id]
        }))

    await manager.broadcast_notification(room_id, f"User {user_id} joined as {role}.", user_id)
    return True, role

# --- WebSocket Endpoint with Room Handling ---

@app.websocket("/ws/collab/{room_id}/{user_id}")
async def collab_websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    # Accept the connection first
    await websocket.accept()

    # Wait for the initial join message with password
    try:
        data = await websocket.receive_text()
        message_data = json.loads(data)

        if message_data["type"] != "join":
            await websocket.send_text(json.dumps({"type": "error", "message": "Expected join message"}))
            await websocket.close()
            return

        # Now try to join the room with the password
        success, role = await join_room(websocket, room_id, user_id, message_data.get("password"))
        if not success:
            return

        # Continue with normal message handling
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                message_data["userId"] = user_id
                message_data["role"] = role  # Include role in the message

                # Handle file creation by the host
                if message_data.get("type") == "create_file" and role == "host":
                    # Broadcast the file creation event to all clients
                    await manager.broadcast_message(room_id, json.dumps({
                        "type": "file_created",
                        "fileId": message_data.get("fileId"),
                        "fileName": message_data.get("fileName"),
                        "fileContent": message_data.get("fileContent"),
                        "fileType": message_data.get("fileType"),
                        "userId": user_id
                    }))

                # Handle file deletion (restricted to host)
                elif message_data.get("type") == "delete_file" and role != "host":
                    await websocket.send_text(json.dumps({"type": "error", "message": "Only the host can delete files."}))
                    continue

                # Broadcast other messages
                else:
                    message_json = json.dumps(message_data)
                    await manager.broadcast_message(room_id, message_json)

            except json.JSONDecodeError:
                print(f"Invalid JSON received from {user_id}: {data}")
            except Exception as e:
                print(f"Error processing message from {user_id}: {e}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user {user_id} in room {room_id}")
        manager.disconnect(room_id, user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(room_id, user_id)

# --- API Endpoints for Room Management ---

@app.post("/api/create-collab-room")
async def create_collab():
    return await create_room()

@app.post("/api/join-collab-room")
async def join_collab(request: JoinRoomRequest):
    room_id = request.room_id
    password = request.password
    user_id = request.user_id

    print(room_id,password,user_id)
    room_key = f"{ROOM_PREFIX}{room_id}"
    room_data = redis_client.hgetall(room_key)
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    if room_data.get("password") != password:
        raise HTTPException(status_code=401, detail="Invalid password")
    is_host = room_data.get("host_id") == user_id or not room_data.get("host_id")
    if not room_data.get("host_id"):
        redis_client.hset(room_key, "host_id", user_id)
        role = "host"
    else:
        role = "guest"
    return {"message": "Joined successfully", "is_host": role == "host"}

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

# Include your other routers
app.include_router(ai_router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_router, prefix="/api", tags=["Compiler"])
app.include_router(auth_router, prefix="/auth")
app.include_router(files_router, prefix="/project", tags=["File System"])
app.include_router(user_router, prefix="", tags=["Profile"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(process_redis_messages())

    # Start the Redis listener in a separate thread
    redis_thread = threading.Thread(target=redis_listener, daemon=True)
    redis_thread.start()
    print("Server started with Redis pubsub and Collab Room integration")