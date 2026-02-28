"""Env var loading via pydantic-settings."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""
    internal_secret: str = ""
    groq_api_key: str = ""
    google_drive_folder_id: str = ""
    google_service_account_json: str = ""
    cors_origins: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
