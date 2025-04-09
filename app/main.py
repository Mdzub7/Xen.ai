from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.judge0_route import router as judge0_router
from routes.ai import router as ai_router
from routes.auth_router import router as auth_router
from routes.user_route import router as user_router
from routes.files import router as files_router
from contextlib import asynccontextmanager




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

app.include_router(ai_router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_router, prefix="/api", tags=["Compiler"])
app.include_router(auth_router, prefix="/auth")
app.include_router(files_router, prefix="/project",tags=["File System"])
app.include_router(user_router,prefix="",tags=["Profile"])