import json
from fastapi import WebSocket, WebSocketDisconnect
from ..services.judge0_service import submit_code

LANGUAGE_ID = {"python": 71, "cpp": 52, "java": 62}

async def handle_terminal_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)

            code = request.get("command", "")
            language = request.get("language", "python")
            user_input = request.get("input", "")

            if language not in LANGUAGE_ID:
                await websocket.send_text("Error: Unsupported language.")
                continue

            result = submit_code(code, LANGUAGE_ID[language], user_input)
            output = result.get("stdout", "") or result.get("stderr", "Execution failed.")

            await websocket.send_text(output)

    except WebSocketDisconnect:
        await websocket.send_text("\n[Session closed]")
