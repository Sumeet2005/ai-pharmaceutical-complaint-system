from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.complaints import router as complaint_router
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Pharmaceutical Complaint Management System API",
    version="1.0.0",
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router)
app.include_router(complaint_router)
app.include_router(upload_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "AI-Powered Pharmaceutical Complaint Management System",
        "version": "1.0.0",
        "status": "Running",
        "documentation": "/docs",
    }