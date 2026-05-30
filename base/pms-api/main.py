"""
main.py — FastAPI PMS Layer
Versioned, secured API endpoints for Property Management.
Runs inside Docker network isolation — never exposed publicly.
All routes require X-API-Key header (except /health and Stripe webhook).
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers import rooms, bookings, payments

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Hotel PMS API",
    description="Internal Property Management System API for hotel chatbot automation",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# CORS — only allow internal Docker network (no public access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://bot-engine:3001", "http://localhost:3001"],
    allow_methods=["POST", "GET"],
    allow_headers=["X-API-Key", "Content-Type"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(payments.router)


# ── Health check ─────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "service": "pms-api",
        "hotel": os.getenv("HOTEL_NAME", "unknown"),
    }
