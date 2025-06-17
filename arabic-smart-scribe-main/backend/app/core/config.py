
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str = ""
    youtube_api_key: str = ""
    secret_key: str = "your-secret-key-here"
    
    # Database
    database_url: str = "sqlite:///./al_shahid.db"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Redis (for background tasks)
    redis_url: str = "redis://localhost:6379/0"
    
    # App settings
    app_name: str = "الشاهد الاحترافي - Smart Writing Platform API"
    app_version: str = "2.5.0"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
