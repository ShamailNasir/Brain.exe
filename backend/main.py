from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routes.ai import router as ai_router
from routes.db_routes import router as db_router
from routes.auth_routes import router as auth_router
import models
from database import engine
from config.settings import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Brain.exe API", version="1.0.0")

# Enable CORS for Next.js frontend
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(ai_router)
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(db_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
