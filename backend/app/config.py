import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedSentinel CPS"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "medsentinel-cps-super-secure-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: SQLite by default for zero-friction local run; PostgreSQL via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medsentinel.db")
    
    # Simulation
    SIMULATION_INTERVAL_SECONDS: float = 1.0
    SIMULATION_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

