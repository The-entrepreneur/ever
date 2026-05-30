"""
models/room.py — Pydantic models for room availability requests and responses
"""
from pydantic import BaseModel
from typing import Optional, List


class AvailabilityRequest(BaseModel):
    check_in: str           # ISO date: "2026-06-10"
    check_out: str          # ISO date: "2026-06-13"
    guests: int = 1


class RoomResponse(BaseModel):
    id: str
    type: str
    rate: float
    capacity: int
    description: str
    amenities: Optional[str] = ""
    available: bool = True
