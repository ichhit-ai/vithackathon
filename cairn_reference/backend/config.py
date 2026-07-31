"""
Cairn backend configuration.

All settings are overridable via environment variables or a .env file
placed at the project root.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Load .env file manually at root if present
root_dir = Path(__file__).resolve().parent.parent
env_file_path = root_dir / ".env"
if env_file_path.exists():
    with open(env_file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'\"")
            if k and v and k not in os.environ:
                os.environ[k] = v


class Settings(BaseSettings):
    """Application-wide settings with sensible hackathon defaults."""

    # --- Database ---
    db_path: str = str(Path(__file__).resolve().parent / "cairn.db")

    # --- LLM Provider Settings & API Keys ---
    # Primary provider choice: "groq", "gemini", "openrouter", "ollama"
    llm_provider: str = "groq"
    
    # Groq Settings
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # Gemini Settings (Google official OpenAI-compatible endpoint)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"

    # OpenRouter Settings
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.0-flash-lite-001"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Ollama Settings (local fallback)
    ollama_base_url: str = "http://localhost:11434/v1"
    ollama_model: str = "qwen2.5:7b"

    # Generic overrides
    llm_temperature: float = 0.7
    llm_max_tokens: int = 2048

    # --- Autonomy Loop ---
    autonomy_interval_seconds: int = 60
    inactivity_threshold_minutes: int = 45
    alert_cooldown_minutes: int = 30

    # --- Watcher ---
    watcher_active_window_seconds: int = 120

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["*"]

    model_config = {"env_prefix": "CAIRN_", "env_file": ".env", "extra": "ignore"}

    @property
    def llm_model(self) -> str:
        if self.llm_provider == "groq":
            return self.groq_model
        elif self.llm_provider == "gemini":
            return self.gemini_model
        elif self.llm_provider == "openrouter":
            return self.openrouter_model
        return self.ollama_model


settings = Settings()

# Ensure keys are loaded from os.environ
if not settings.groq_api_key and os.getenv("GROQ_API_KEY"):
    settings.groq_api_key = os.getenv("GROQ_API_KEY", "")
if not settings.gemini_api_key and os.getenv("GEMINI_API_KEY"):
    settings.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if not settings.openrouter_api_key and os.getenv("OPENROUTER_API_KEY"):
    settings.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "")