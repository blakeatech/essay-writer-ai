from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.v1.endpoints import router as v1_router
from app.api.v1.essay_endpoints import router as essay_router
from app.api.v1.stripe_endpoints import router as stripe_router
from app.api.v1.auth import router as auth_router
from app.core.config import settings
from app.core.limiter import limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

# Load environment variables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create output directory if it doesn't exist
os.makedirs("outputs", exist_ok=True)

# Create FastAPI app with docs disabled
app = FastAPI(
    title="Essay Generator API",
    description="API for generating academic papers",
    version="1.0.0",
    docs_url=None,  # Disable /docs
    redoc_url=None  # Disable /redoc
)

# Add rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(SlowAPIMiddleware)

# Include routers
app.include_router(v1_router)
app.include_router(essay_router)
app.include_router(stripe_router)
app.include_router(auth_router, prefix="/api/v1/auth")
# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to the EssayGenius API."}

# Add global rate limit
@app.middleware("http")
async def global_rate_limit(request: Request, call_next):
    response = await call_next(request)
    return response 