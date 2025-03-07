# app/websocket/terminal.py
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from ..services.judge0_service import submit_code

LANGUAGE_ID = {"python": 71, "cpp": 52, "java": 62}

# This function should be imported and used in your main FastAPI app
def setup_terminal_websocket(app: FastAPI):
    # Add CORS middleware to allow WebSocket connections from your frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this to your frontend URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.websocket("/ws/terminal")
    async def terminal_websocket(websocket: WebSocket):
        try:
            await websocket.accept()
            await websocket.send_text("Connection established to code execution service")
            
            while True:
                try:
                    data = await websocket.receive_text()
                    request = json.loads(data)
                    
                    code = request.get("command", "")
                    language = request.get("language", "python")
                    user_input = request.get("input", "")
                    
                    if not code.strip():
                        await websocket.send_text("No code provided")
                        continue
                    
                    if language not in LANGUAGE_ID:
                        await websocket.send_text(f"Error: Unsupported language '{language}'. Supported languages: python, cpp, java")
                        continue
                    
                    # Add a timeout for execution to prevent long-running code
                    result = submit_code(code, LANGUAGE_ID[language], user_input)
                    
                    # Format the response
                    stdout = result.get("stdout", "")
                    stderr = result.get("stderr", "")
                    compilation_error = result.get("compile_output", "")
                    
                    if stdout:
                        await websocket.send_text(stdout.rstrip())
                    elif stderr:
                        await websocket.send_text(f"Error:\n{stderr.rstrip()}")
                    elif compilation_error:
                        await websocket.send_text(f"Compilation Error:\n{compilation_error.rstrip()}")
                    else:
                        await websocket.send_text("Execution completed with no output")
                        
                except json.JSONDecodeError:
                    await websocket.send_text("Error: Invalid JSON format")
                    
        except WebSocketDisconnect:
            # This is normal when client disconnects, no need to send anything
            pass
        except Exception as e:
            # Log the exception but don't crash the server
            print(f"Terminal WebSocket error: {str(e)}")
            try:
                await websocket.send_text(f"Server error: {str(e)}")
            except:
                pass