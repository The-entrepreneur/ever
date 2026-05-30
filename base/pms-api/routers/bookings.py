"""
routers/bookings.py — POST /api/v1/bookings/create
Creates a booking record and generates a Stripe payment link.
"""
import os
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date

from auth import verify_api_key
from database import get_db
from models.booking import BookingRequest, BookingResponse

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
HOTEL_NAME    = os.getenv("HOTEL_NAME", "Hotel")
WEBHOOK_BASE  = os.getenv("WEBHOOK_BASE_URL", "https://example.com")


def _nights_between(check_in: str, check_out: str) -> int:
    d1 = date.fromisoformat(check_in)
    d2 = date.fromisoformat(check_out)
    return max(1, (d2 - d1).days)


@router.post("/create", response_model=BookingResponse, dependencies=[Depends(verify_api_key)])
async def create_booking(req: BookingRequest, db: AsyncSession = Depends(get_db)):
    # Look up room rate from DB (fallback to 129.0 if DB unavailable)
    rate = 129.0
    try:
        result = await db.execute(
            text("SELECT rate_per_night FROM rooms WHERE room_id = :room_id"),
            {"room_id": req.room_id}
        )
        row = result.fetchone()
        if row:
            rate = float(row[0])
    except Exception:
        pass

    nights = _nights_between(req.check_in, req.check_out)
    total  = round(rate * nights, 2)

    # Persist booking record
    try:
        await db.execute(
            text("""
                INSERT INTO bookings
                    (booking_ref, room_id, guest_name, email, phone,
                     check_in, check_out, guests, total, status)
                VALUES
                    (:ref, :room, :name, :email, :phone,
                     :ci::date, :co::date, :guests, :total, 'pending_payment')
                ON CONFLICT (booking_ref) DO NOTHING
            """),
            {
                "ref":    req.booking_ref,
                "room":   req.room_id,
                "name":   req.name,
                "email":  req.email,
                "phone":  req.phone,
                "ci":     req.check_in,
                "co":     req.check_out,
                "guests": req.guests,
                "total":  total,
            }
        )
        await db.commit()
    except Exception:
        await db.rollback()

    # Generate Stripe Checkout session
    payment_link = None
    if stripe.api_key and not stripe.api_key.startswith("your_"):
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "gbp",
                        "product_data": {
                            "name": f"{HOTEL_NAME} — {req.room_id} ({req.check_in} to {req.check_out})",
                        },
                        "unit_amount": int(total * 100),  # pence
                    },
                    "quantity": 1,
                }],
                mode="payment",
                client_reference_id=req.booking_ref,
                customer_email=req.email,
                success_url=f"{WEBHOOK_BASE}/payment/success?ref={req.booking_ref}",
                cancel_url=f"{WEBHOOK_BASE}/payment/cancel?ref={req.booking_ref}",
                idempotency_key=f"pi_{req.booking_ref}",  # prevents duplicate charges
            )
            payment_link = session.url
        except stripe.StripeError as e:
            # Non-fatal — return booking without payment link
            print(f"[PMS] Stripe error: {e}")

    return BookingResponse(
        booking_id=f"BK_{req.booking_ref}",
        booking_ref=req.booking_ref,
        room_id=req.room_id,
        check_in=req.check_in,
        check_out=req.check_out,
        guests=req.guests,
        total=total,
        payment_link=payment_link,
    )
