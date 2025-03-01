from fastapi import FastAPI
from .routes import ai,judge0_route,auth_router
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(ai.router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_route.router, prefix="/api", tags=["Compiler"])
app.include_router(auth_router.auth_router, prefix="/auth")