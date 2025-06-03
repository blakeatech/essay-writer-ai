from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Essay Generator API"
    VERSION: str = "1.0.0"
    
    # Security
    OPENAI_API_KEY: str
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: Optional[str] = None
    
    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Server Configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = False
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React development server
        "http://localhost:8000",  # Backend URL
        "https://yourdomain.com",
        "https://www.essaygeniusai.com"
    ]

    # Stripe Configuration
    STRIPE_SECRET_KEY: str
    STRIPE_PRODUCT_ID: str
    STRIPE_PRICE_ID: str
    FRONTEND_URL: str
    STRIPE_WEBHOOK_SECRET: str
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Cache Settings
    CACHE_TTL: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    @property
    def backend_cors_origins(self) -> List[str]:
        """
        Parse ALLOWED_ORIGINS from comma-separated string to list if needed
        """
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings() 