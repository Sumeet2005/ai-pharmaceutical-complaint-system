from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str
    DEBUG: bool

    DATABASE_URL: str

    GROQ_API_KEY: str
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=(
            BACKEND_DIR / ".env",
            BACKEND_DIR.parent / ".env",
            ".env",
        ),
        extra="ignore",
    )


settings = Settings()