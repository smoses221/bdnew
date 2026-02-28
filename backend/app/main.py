from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as api_router
from .database import engine
from . import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BD Library API",
    description="A secure API for managing a comic book library",
    version="1.0.0"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kotbd.kapucl.be",
        "http://localhost:5173",  # local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "BD Library API is running! Visit /docs for API documentation."}


# After defining all your routes, add this:
@app.on_event("startup")
async def startup_event():
    print("Available routes:")
    for route in app.routes:
        if hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")
        else:
            print(f"WebSocket {route.path}")