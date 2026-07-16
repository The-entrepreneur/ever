"""
main.py — FastAPI PMS / HCA Middleware Layer
Versioned, secured API endpoints for Property Management and
Hospitality Commerce (orders, services, folio charges).
Runs inside Docker network isolation — never exposed publicly.
All routes require X-API-Key header (except /health and payment webhooks).
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers import rooms, bookings, payments, orders, services

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup; dispose pool on shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info(
        "[PMS] Started — Hotel: %s | POS mode: %s",
        os.getenv("HOTEL_NAME", "unknown"),
        os.getenv("POS_INTEGRATION_TYPE", "fallback"),
    )
    yield
    await engine.dispose()


app = FastAPI(
    title="EVER HCA — PMS & Commerce API",
    description=(
        "Internal Property Management and Hospitality Commerce API. "
        "Handles bookings, in-chat orders (F&B/spa/transport), "
        "operational service requests, and folio charge posting. "
        "Network-isolated — never exposed publicly."
    ),
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# CORS — restrict to bot-engine container and localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://bot-engine:3001",
        "http://localhost:3001",
    ],
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["X-API-Key", "Content-Type"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(orders.router)      # HCA: in-chat F&B, spa, transport orders
app.include_router(services.router)    # HCA: housekeeping, wakeup, laundry, restaurant


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {
        "status":           "ok",
        "service":          "pms-api",
        "version":          "2.0.0",
        "hotel":            os.getenv("HOTEL_NAME", "unknown"),
        "pos_integration":  os.getenv("POS_INTEGRATION_TYPE", "fallback"),
        "env":              os.getenv("ENV", "development"),
    }
