"""
models/booking.py — Pydantic models for booking creation and payment processing
Supports Paystack, Flutterwave, and Stripe payment providers.
"""
from pydantic import BaseModel
from typing import Optional


class BookingRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    check_in: str           # ISO date: "2026-06-10"
    check_out: str          # ISO date: "2026-06-13"
    guests: int = 1
    room_id: str
    booking_ref: str        # e.g. "BK-1716829200000" — idempotency key


class BookingResponse(BaseModel):
    booking_id: str
    booking_ref: str
    room_id: str
    check_in: str
    check_out: str
    guests: int
    total: float
    currency: str = "GBP"
    payment_link: Optional[str] = None
    status: str = "pending_payment"


class PaymentStatusRequest(BaseModel):
    booking_ref: str


class PaymentStatusResponse(BaseModel):
    booking_ref: str
    status: str             # "pending_payment" | "confirmed" | "failed" | "unknown"
    payment_provider: Optional[str] = None
    confirmed_at: Optional[str] = None
