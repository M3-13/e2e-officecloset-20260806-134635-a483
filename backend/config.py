from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    jwt_secret: str | None = None
    database_url: str = "sqlite:///./closet.db"
    upload_dir: str = "backend/uploads"
    frontend_origin: str = "http://localhost:5173"
