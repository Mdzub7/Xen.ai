from fastapi import FastAPI
from .routes import ai,judge0_route
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/ai", tags=["AI Review"])
app.include_router(judge0_route.router, prefix="/api", tags=["Compiler"])