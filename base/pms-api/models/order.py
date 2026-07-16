"""
models/order.py — Pydantic request/response models for the
PMS API orders and services routers.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ─── ORDER MODELS ─────────────────────────────────────────────────────────────

class OrderItem(BaseModel):
    menu_item_id: str
    name:         str
    qty:          int   = Field(ge=1)
    unit_price:   float = Field(ge=0)
    subtotal:     float = Field(ge=0)


class OrderCreateRequest(BaseModel):
    hotel_slug:   str
    session_id:   str
    room_number:  str
    items:        List[OrderItem]
    total_amount: float = Field(ge=0)
    channel:      str   = "whatsapp"
    notes:        Optional[str] = None


class OrderResponse(BaseModel):
    order_id:    str
    order_ref:   str
    room_number: str
    total_amount: float
    status:      str = "pending"
    eta_minutes: int = 20
    folio_posted: bool = False


# ─── SERVICE REQUEST MODELS ────────────────────────────────────────────────────

class ServiceCreateRequest(BaseModel):
    hotel_slug:    str
    session_id:    str
    room_number:   str
    service_type:  str              # laundry | housekeeping | wakeup | restaurant | other
    details:       dict             # service-specific key-value pairs
    scheduled_for: Optional[str]  = None   # ISO-8601 datetime string for wakeup/restaurant
    channel:       str             = "whatsapp"


class ServiceResponse(BaseModel):
    id:           str
    request_ref:  str
    service_type: str
    room_number:  str
    status:       str = "pending"
    created_at:   str


# ─── MENU MODELS ───────────────────────────────────────────────────────────────

class MenuItem(BaseModel):
    id:             str
    name:           str
    description:    Optional[str] = None
    price:          float
    category:       str
    available:      bool = True
    prep_time_mins: Optional[int] = None


class MenuResponse(BaseModel):
    items:    List[MenuItem]
    category: str
    hotel_slug: str
