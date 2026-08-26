from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project Wade OS"
    API_V1_STR: str = "/api/v1"
    ENV: Literal["development", "production"] = "development"
    DEBUG: bool = True
    API_KEY: str = "dev-only-change-me"
    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")
    
    # Defaulting to the docker-compose credentials
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"
    POSTGRES_DB: str = "wade_os"
    DATABASE_URL: str | None = None

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.ENV == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if self.API_KEY == "dev-only-change-me":
                raise ValueError("API_KEY must be changed in production")
        return self

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
