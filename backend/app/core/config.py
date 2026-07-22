from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str
    DEBUG: bool

    DATABASE_URL: str

    GROQ_API_KEY: str
    GROQ_MODEL: str = "gemma2-9b-it"

    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()