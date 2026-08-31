import json
from typing import Any, Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project Wade OS"
    API_V1_STR: str = "/api/v1"
    ENV: Literal["development", "production"] = "development"
    DEBUG: bool = True
    API_KEY: str = "dev-only-change-me"
    CORS_ORIGINS: Any = Field(default_factory=lambda: ["http://localhost:3000"])
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if not v_stripped:
                return ["*"]
            # Clean control characters / newlines
            clean_val = v_stripped.replace("\n", "").replace("\r", "").replace("\t", "")
            if clean_val.startswith("[") and clean_val.endswith("]"):
                try:
                    parsed = json.loads(clean_val)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if item]
                except Exception:
                    pass
            return [i.strip() for i in clean_val.split(",") if i.strip()]
        return v
    
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
