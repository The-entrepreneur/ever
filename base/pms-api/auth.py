"""
auth.py — X-API-Key header authentication for internal PMS endpoints.
The FastAPI PMS layer is NEVER exposed publicly — only called from
the bot-engine container over the Docker bridge network.
"""
import os
from fastapi import Header, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")

async def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    if not INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration: INTERNAL_API_KEY not set"
        )
    if x_api_key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return x_api_key
