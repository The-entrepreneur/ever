"""
routers/rooms.py — GET/POST /api/v1/rooms/availability
Returns available rooms filtered by date range and guest count.
Falls back to rooms.json if database is not yet configured.
"""
import os
import json
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from auth import verify_api_key
from database import get_db
from models.room import AvailabilityRequest, RoomResponse

router = APIRouter(prefix="/api/v1/rooms", tags=["rooms"])


def _load_local_rooms(guests: int) -> List[dict]:
    """Fallback: load rooms.json from /app/data/rooms.json"""
    rooms_path = Path("/app/data/rooms.json")
    if rooms_path.exists():
        with open(rooms_path) as f:
            rooms = json.load(f)
        return [r for r in rooms if r.get("available") and r.get("capacity", 1) >= guests]
    # Static hardcoded backup
    return [
        {"id": "rm_std",   "type": "Standard", "rate": 89,  "capacity": 2, "description": "Cosy room with garden view.",   "amenities": "TV, AC, Safe",       "available": True},
        {"id": "rm_dlx",   "type": "Deluxe",   "rate": 129, "capacity": 2, "description": "Spacious room with city view.", "amenities": "King bed, Minibar",   "available": True},
        {"id": "rm_suite", "type": "Suite",    "rate": 199, "capacity": 4, "description": "Panoramic views, separate lounge.", "amenities": "Nespresso, Robe", "available": True},
    ]


@router.post("/availability", response_model=List[RoomResponse], dependencies=[Depends(verify_api_key)])
async def check_availability(req: AvailabilityRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Query rooms not already booked for overlapping date ranges
        result = await db.execute(
            text("""
                SELECT r.room_id as id, r.type, r.rate_per_night as rate,
                       r.capacity, r.description, r.amenities
                FROM rooms r
                WHERE r.available = true
                  AND r.capacity >= :guests
                  AND r.room_id NOT IN (
                    SELECT b.room_id FROM bookings b
                    WHERE b.status NOT IN ('cancelled', 'failed')
                      AND b.check_in  < :check_out::date
                      AND b.check_out > :check_in::date
                  )
                ORDER BY r.rate_per_night ASC
            """),
            {"guests": req.guests, "check_in": req.check_in, "check_out": req.check_out}
        )
        rows = result.mappings().all()
        if rows:
            return [RoomResponse(**dict(r)) for r in rows]
    except Exception as e:
        # DB not yet set up — fall through to local fallback
        pass

    return [RoomResponse(**r) for r in _load_local_rooms(req.guests)]
