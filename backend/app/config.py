import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Explicitly load .env from backend root regardless of current working directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "placeoracle-default-secret-key")
    
    # DB Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///placeoracle.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24)))
    
    # Webhook Security
    WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "placeoracle-inbound-secret-key")
    
    # GitHub OAuth
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_CALLBACK_URL = os.getenv("GITHUB_CALLBACK_URL", "http://localhost:5000/api/auth/callback")
    
    # LLM Gateway
    LLM_PRIMARY = os.getenv("LLM_PRIMARY", "gemini")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    
    OPENAI_COMPAT_BASE_URL = os.getenv("OPENAI_COMPAT_BASE_URL", "https://api.openai.com/v1")
    OPENAI_COMPAT_API_KEY = os.getenv("OPENAI_COMPAT_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
    OPENAI_COMPAT_MODEL = os.getenv("OPENAI_COMPAT_MODEL", "gpt-4o-mini")

    # Swagger / Flasgger Settings
    SWAGGER = {
        "title": "PlaceOracle RESTful API",
        "uiversion": 3,
        "description": "Tactical Multi-tenant Campus Recruitment & Zero-Day Skill Verification Engine",
        "version": "1.0.0",
        "termsOfService": "",
        "specs_route": "/apidocs/",
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Enter: Bearer <your_token_here>"
            }
        },
        "security": [
            {
                "Bearer": []
            }
        ]
    }
